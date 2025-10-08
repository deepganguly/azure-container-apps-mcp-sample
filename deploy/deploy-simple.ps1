# Simple Azure Container Apps deployment using Azure CLI
# Make sure you have Azure CLI installed and logged in

# Variables - Update these with your values
$RESOURCE_GROUP = "mcp-forex-rg"
$LOCATION = "eastus"
$ACR_NAME = "mcpforexacr$(Get-Random -Minimum 1000 -Maximum 9999)"
$CONTAINER_APP_NAME = "mcp-forex-server"
$ENVIRONMENT_NAME = "mcp-forex-env"

Write-Host "🚀 Starting simple deployment of MCP Forex Server..." -ForegroundColor Green

# Step 1: Login to Azure
Write-Host "🔐 Logging in to Azure..." -ForegroundColor Yellow
az login

# Step 2: Create resource group
Write-Host "📦 Creating resource group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION

# Step 3: Create Azure Container Registry
Write-Host "🐳 Creating Azure Container Registry..." -ForegroundColor Yellow
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Step 4: Build and push to ACR
Write-Host "🔨 Building and pushing image to ACR..." -ForegroundColor Yellow
az acr build --registry $ACR_NAME --image mcp-forex-server:latest .

# Step 5: Create Container Apps Environment
Write-Host "🌐 Creating Container Apps Environment..." -ForegroundColor Yellow
az containerapp env create --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP --location $LOCATION

# Step 6: Deploy Container App
Write-Host "🚀 Deploying Container App..." -ForegroundColor Yellow
az containerapp create `
    --name $CONTAINER_APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --environment $ENVIRONMENT_NAME `
    --image "$ACR_NAME.azurecr.io/mcp-forex-server:latest" `
    --target-port 3001 `
    --ingress external `
    --registry-server "$ACR_NAME.azurecr.io" `
    --env-vars "PORT=3001" `
    --cpu 0.25 `
    --memory 0.5Gi `
    --min-replicas 1 `
    --max-replicas 3

# Step 7: Get the application URL
Write-Host "🔗 Getting application URL..." -ForegroundColor Yellow
$APP_URL = az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" --output tsv

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Application URL: https://$APP_URL" -ForegroundColor Cyan
Write-Host "🔗 MCP Endpoint: https://$APP_URL/mcp" -ForegroundColor Cyan
Write-Host "🏠 Health Check: https://$APP_URL/" -ForegroundColor Cyan

Write-Host "📝 To update your MCP settings, use this URL in your mcp-settings.json:" -ForegroundColor Yellow
Write-Host "https://$APP_URL/mcp" -ForegroundColor White