# MCP Live Forex Converter

A production-ready Model Context Protocol (MCP) server that provides live foreign exchange rates using HTTP transport. Perfect for AI assistants that need real-time currency conversion capabilities.

## Features

- 🌐 **Live Exchange Rates**: Fetches real-time data from exchangerate-api.com
- 💾 **Smart Caching**: 10-minute cache to optimize API usage
- 🔄 **Fallback System**: Graceful handling when external APIs are unavailable
- 🚀 **Cloud Ready**: Containerized for easy deployment to Azure Container Apps
- 🛡️ **Production Grade**: Health checks, error handling, and monitoring ready

## Supported Currencies

USD, EUR, GBP, JPY, INR, CAD, AUD, CHF, CNY

## Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```
   
   Server will start on port 3001:
   ```
   🚀 Live MCP Forex Server on port 3001
   💱 Ready to fetch live rates from exchangerate-api.com
   🔗 Health check: http://localhost:3001/health
   🔗 MCP endpoint: http://localhost:3001/mcp
   ```

3. **Test the server**
   
   Test currency conversion:
   ```powershell
   $body = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"convert_currency","arguments":{"amount":200,"from":"INR","to":"USD"}}}'
   Invoke-RestMethod -Uri "http://localhost:3001/mcp" -Method POST -Body $body -ContentType "application/json"
   ```
   
   Expected response:
   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "result": {
       "content": [{
         "type": "text",
         "text": "💰 200 INR = 2.25 USD\n📈 Live Rate: 1 INR = 0.0113 USD\n🕐 6/10/2025, 4:48:12 pm"
       }]
     }
   }
   ```

## VS Code Integration (HTTP Transport)

Add to your VS Code settings.json:

```json
{
  "github.copilot.enable": {
    "*": true
  },
  "github.copilot.chat.experimental": {
    "enableMCP": true
  },
  "mcp.servers": {
    "forex-converter": {
      "transport": {
        "type": "http",
        "uri": "http://localhost:3001/mcp"
      }
    }
  }
}
```

## Azure Container Apps Deployment

1. **Login to Azure**

   ```bash
   az login
   ```

2. **Deploy using the script**

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## MCP Tools

### convert_currency

Converts amounts between currencies using live exchange rates.

**Parameters:**
- `amount` (number): Amount to convert
- `from` (string): Source currency code
- `to` (string): Target currency code

## License

MIT

## Usage Examples
- "Save this FastAPI code as 'API Route' in python with tags: fastapi, web"
- "Search for react snippets"
- "Show me snippet 1"  
- "Get all JavaScript snippets"
- "What languages do I have snippets for?"

## Key Features
- **HTTP Transport**: Uses modern HTTP configuration
- **Single Endpoint**: All communication through /mcp
- **Standard Tools**: Test with curl, Postman, etc.
- **VS Code Integration**: Natural language queries through Copilot

This transforms VS Code into a personal code snippet manager!
