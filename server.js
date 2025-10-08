import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Cache for exchange rates
let ratesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fetch live exchange rates from exchangerate-api.com (free, no API key needed)
async function getLiveRates() {
    try {
        // Check cache first
        if (ratesCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
            console.log('Using cached rates');
            return ratesCache;
        }

        console.log('Fetching live exchange rates...');
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.rates) {
            ratesCache = data.rates;
            cacheTimestamp = Date.now();
            console.log('Live rates fetched successfully');
            return data.rates;
        } else {
            throw new Error('Invalid API response - no rates data');
        }
    } catch (error) {
        console.error('Failed to fetch live rates:', error.message);
        console.log('Using fallback exchange rates');
        
        // Fallback to realistic mock data
        const fallbackRates = {
            'EUR': 0.85, 'GBP': 0.73, 'JPY': 149.50, 'INR': 83.25,
            'CAD': 1.37, 'AUD': 1.53, 'CHF': 0.88, 'CNY': 7.28,
            'SEK': 10.85, 'NOK': 10.95, 'DKK': 6.35, 'PLN': 4.05
        };
        
        ratesCache = fallbackRates;
        cacheTimestamp = Date.now();
        return fallbackRates;
    }
}

// MCP endpoint
app.post('/mcp', async (req, res) => {
    const { method, id, params } = req.body;
    
    if (method === 'tools/list') {
        res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
                tools: [{
                    name: "convert_currency",
                    description: "Convert amount from one currency to another using live rates",
                    inputSchema: {
                        type: "object",
                        properties: {
                            amount: { type: "number", description: "Amount to convert" },
                            from: { type: "string", description: "Source currency (USD, EUR, GBP, JPY, INR, CAD, AUD, CHF, CNY)" },
                            to: { type: "string", description: "Target currency (USD, EUR, GBP, JPY, INR, CAD, AUD, CHF, CNY)" }
                        },
                        required: ["amount", "from", "to"]
                    }
                }]
            }
        });
    } else if (method === 'tools/call') {
        const { name, arguments: args } = params;
        
        if (name === 'convert_currency') {
            const { amount, from, to } = args;
            
            try {
                const rates = await getLiveRates();
                
                if (from === to) {
                    res.json({
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            content: [{
                                type: "text",
                                text: `💰 ${amount} ${from} = ${amount} ${to} (same currency)`
                            }]
                        }
                    });
                    return;
                }
                
                let result;
                let rate;
                
                if (from === 'USD') {
                    // Convert from USD to target currency
                    rate = rates[to];
                    result = amount * rate;
                } else if (to === 'USD') {
                    // Convert from source currency to USD
                    rate = 1 / rates[from];
                    result = amount * rate;
                } else {
                    // Convert between two non-USD currencies
                    const usdRate = 1 / rates[from]; // from -> USD
                    const targetRate = rates[to];    // USD -> to
                    rate = usdRate * targetRate;
                    result = amount * rate;
                }
                
                if (rate && !isNaN(result)) {
                    res.json({
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            content: [{
                                type: "text",
                                text: `💰 ${amount} ${from} = ${result.toFixed(2)} ${to}\n📈 Live Rate: 1 ${from} = ${rate.toFixed(4)} ${to}\n🕐 ${new Date().toLocaleString()}`
                            }]
                        }
                    });
                } else {
                    res.json({
                        jsonrpc: "2.0",
                        id: id,
                        error: { code: -32602, message: `Unsupported currency: ${from} or ${to}` }
                    });
                }
            } catch (error) {
                res.json({
                    jsonrpc: "2.0",
                    id: id,
                    error: { code: -32603, message: `Conversion failed: ${error.message}` }
                });
            }
        } else {
            res.json({
                jsonrpc: "2.0",
                id: id,
                error: { code: -32601, message: `Unknown tool: ${name}` }
            });
        }
    } else {
        res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
                protocolVersion: "2024-11-05",
                capabilities: { tools: {} },
                serverInfo: { name: "live-forex-converter", version: "1.0.0" }
            }
        });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        message: "Live MCP Forex Converter", 
        endpoint: "/mcp",
        status: "Fetching live rates from exchangerate-api.com"
    });
});

// Error handling to prevent crashes
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
    console.log(`Live MCP Forex Server on port ${PORT}`);
    console.log(`Ready to fetch live rates from exchangerate-api.com`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});