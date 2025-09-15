# Deployment Guide for Donation Impact Tracker

This guide explains how to deploy the Donation Impact Tracker to Azure Static Web Apps.

## Prerequisites

1. **Azure Subscription**: Active Azure subscription
2. **GitHub Account**: Repository containing this code
3. **Azure CLI**: Latest version installed
4. **Node.js**: Version 18 or higher

## Azure Resources Required

### 1. Azure Static Web Apps
- Hosts the React frontend and Azure Functions backend
- Provides CI/CD integration with GitHub
- Handles routing and SSL certificates

### 2. Azure Maps Account
- Provides geospatial mapping services
- Required for the interactive impact map
- Free tier available for development

### 3. Azure OpenAI Service
- Powers AI-generated impact narratives
- Requires approval for access
- Alternative: Use OpenAI API directly

### 4. Azure Key Vault (Recommended)
- Securely stores API keys and secrets
- Integrates with Static Web Apps

## Deployment Steps

### Step 1: Create Azure Resources

1. **Create Resource Group**:
   ```bash
   az group create --name donation-tracker-rg --location eastus2
   ```

2. **Create Azure Maps Account**:
   ```bash
   az maps account create --name donation-tracker-maps --resource-group donation-tracker-rg --sku S0
   ```

3. **Create Azure OpenAI Resource**:
   ```bash
   az cognitiveservices account create \
     --name donation-tracker-openai \
     --resource-group donation-tracker-rg \
     --kind OpenAI \
     --sku S0 \
     --location eastus
   ```

4. **Create Static Web App**:
   ```bash
   az staticwebapp create \
     --name donation-impact-tracker \
     --resource-group donation-tracker-rg \
     --source https://github.com/YOUR_USERNAME/donation-impact-tracker \
     --location eastus2 \
     --branch main \
     --app-location "/" \
     --api-location "api" \
     --output-location "build"
   ```

### Step 2: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. **AZURE_STATIC_WEB_APPS_API_TOKEN**: Deployment token from Azure Static Web Apps
2. **AZURE_MAPS_CLIENT_ID**: Client ID from Azure Maps account
3. **AZURE_OPENAI_ENDPOINT**: Endpoint URL from Azure OpenAI service
4. **AZURE_OPENAI_KEY**: API key from Azure OpenAI service
5. **AZURE_OPENAI_DEPLOYMENT**: Deployment name (e.g., "gpt-4")

### Step 3: Configure Environment Variables

In Azure Static Web Apps configuration, add:

```
REACT_APP_AZURE_MAPS_CLIENT_ID=your-client-id
REACT_APP_AZURE_OPENAI_ENDPOINT=your-endpoint
REACT_APP_AZURE_OPENAI_DEPLOYMENT=gpt-4
REACT_APP_API_BASE_URL=https://your-app.azurestaticapps.net/api
```

### Step 4: Deploy

1. **Push to GitHub**: The GitHub Actions workflow will automatically deploy
2. **Monitor Deployment**: Check the Actions tab in your GitHub repository
3. **Verify Deployment**: Visit your Static Web App URL

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `REACT_APP_AZURE_MAPS_CLIENT_ID` | Azure Maps authentication | Yes | `abc123-def456-...` |
| `REACT_APP_AZURE_OPENAI_ENDPOINT` | OpenAI service endpoint | Yes | `https://your-service.openai.azure.com` |
| `REACT_APP_AZURE_OPENAI_KEY` | OpenAI API key | Yes | `your-api-key` |
| `REACT_APP_AZURE_OPENAI_DEPLOYMENT` | Model deployment name | Yes | `gpt-4` |
| `REACT_APP_API_BASE_URL` | API base URL | No | Auto-configured |

## Local Development Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/donation-impact-tracker
   cd donation-impact-tracker
   ```

2. **Install Dependencies**:
   ```bash
   npm install --force
   ```

3. **Configure Environment**:
   ```bash
   cp .env.template .env.local
   # Edit .env.local with your values
   ```

4. **Start Development Server**:
   ```bash
   npm start
   ```

5. **Start Azure Functions** (optional):
   ```bash
   cd api
   npm install
   func start
   ```

## Monitoring and Maintenance

### Health Checks
- Monitor application insights for errors
- Check function execution logs
- Verify map tiles are loading
- Test AI narrative generation

### Updates
- Regularly update dependencies
- Monitor Azure service updates
- Update AI model deployments as needed

### Security
- Rotate API keys quarterly
- Monitor unauthorized access attempts
- Keep Azure CLI and tools updated

## Troubleshooting

### Common Issues

1. **Map Not Loading**:
   - Verify Azure Maps client ID
   - Check browser console for authentication errors
   - Ensure domain is configured in Azure Maps

2. **AI Narratives Not Generating**:
   - Verify OpenAI endpoint and key
   - Check deployment model availability
   - Monitor rate limits and quotas

3. **Functions Not Working**:
   - Check function app logs
   - Verify CORS configuration
   - Test functions locally first

4. **Build Failures**:
   - Clear npm cache: `npm cache clean --force`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Support Resources
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Maps Documentation](https://docs.microsoft.com/azure/azure-maps/)
- [Azure OpenAI Documentation](https://docs.microsoft.com/azure/cognitive-services/openai/)

## Cost Optimization

- Use Azure Maps free tier for development
- Monitor OpenAI usage and costs
- Implement caching for API calls
- Use Azure Cost Management alerts

## Security Best Practices

- Enable HTTPS only
- Use managed identities where possible
- Implement proper CORS policies
- Regular security audits
- Monitor access logs