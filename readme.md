# 🌍 Donation Impact Tracker

Build a lightweight, AI-powered dashboard that visualizes the real-world impact of donations made to nonprofits. The goal is to help donors see how their contributions translate into tangible outcomes—such as meals served, trees planted, or students supported.

## 🎯 Problem Statement
Donors often lack visibility into how their contributions are used. This lack of transparency can reduce trust and engagement. Nonprofits struggle to communicate impact in a compelling, data-driven way.

## � Solution Overview
Create a web-based tracker that:

- Aggregates donation data from a nonprofit (or mock dataset)
- Maps impact metrics to geographic locations using Azure Maps
- Visualizes outcomes using interactive charts and dashboards
- Integrates with Azure OpenAI to generate narrative summaries of impact

## ✨ Key Features

- **Impact Mapping**: Show where donations are making a difference with interactive Azure Maps
- **Outcome Metrics**: Display KPIs like meals served, books distributed, students supported
- **Narrative Generator**: Use Azure OpenAI to summarize impact stories and generate donor communications
- **Donor View**: Filter by donor, campaign, or region for personalized dashboards
- **Real-time Updates**: Dynamic data visualization with responsive design
- **Public/Private API**: Comprehensive REST API for organizations and developers to sync and integrate donation data
- **Webhook Support**: Real-time notifications for donation and impact events
- **API Authentication**: Secure API key-based authentication with rate limiting

## �️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Mapping**: Azure Maps SDK for geospatial visualization
- **AI**: Azure OpenAI for narrative generation
- **Backend**: Azure Functions for serverless data processing
- **Charts**: Recharts for data visualization
- **Deployment**: Azure Static Web Apps with CI/CD
- **Styling**: Custom CSS with responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Azure subscription (for production deployment)
- Git

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd donation-impact-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install --force
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.template .env.local
   # Edit .env.local with your Azure credentials
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Azure Functions (Optional)
To run the backend API locally:

```bash
cd api
npm install
func start
```

## 📱 Features Implemented

### ✅ Completed
- React frontend with TypeScript
- Interactive Azure Maps integration
- Impact metrics dashboard with charts
- AI-generated impact narratives using Azure OpenAI
- Filtering by donor, campaign, and region
- Responsive design for mobile and desktop
- Azure Functions backend structure
- Mock data for education nonprofit
- Deployment configuration for Azure Static Web Apps
- **Comprehensive REST API for data integration**
- **API key authentication and authorization**
- **Rate limiting and usage tracking**
- **Webhook support for real-time notifications**
- **API documentation with code examples**

### 🔄 In Progress
- Power BI embedded dashboards
- Real-time data integration
- Advanced filtering and search

## 🌐 Deployment

The application is configured for deployment to Azure Static Web Apps. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Azure
1. Fork this repository
2. Create Azure Static Web App
3. Configure GitHub Actions
4. Set environment variables
5. Deploy automatically on push to main

## 🎨 Screenshots

### Dashboard View
- Impact metrics with KPIs
- AI-generated impact summaries
- Interactive charts and visualizations

### Map View
- Global impact locations
- Interactive markers with impact data
- Regional filtering and insights

### Donor View
- Personalized donor dashboards
- Donation history and impact
- Thank you messages powered by AI

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── Components (Dashboard, Maps, Charts)
├── Services (API, Azure OpenAI)
└── Types (TypeScript interfaces)

Backend (Azure Functions)
├── Donations API (GET, POST)
├── Donors API (GET, POST, PUT)
├── Campaigns API (GET)
├── Impact Metrics API (GET)
├── Impact Summary API (GET)
├── Webhooks API (GET, POST, DELETE)
├── API Authentication & Authorization
└── Rate Limiting & Usage Tracking

Azure Services
├── Static Web Apps (Hosting)
├── Azure Maps (Geospatial)
├── Azure OpenAI (AI Narratives)
└── Azure Functions (Serverless)
```

## 📊 Sample Data

The application includes realistic mock data for:
- **8 Donations** across different regions and campaigns
- **8 Impact Metrics** including meals, books, students, scholarships
- **6 Donors** with donation history and preferences
- **4 Campaigns** focused on education initiatives

## 🎯 Target Users

- **Individual Donors**: Track personal donation impact
- **Nonprofit Teams**: Communicate impact to stakeholders
- **CSR Departments**: Monitor corporate giving outcomes
- **Developers**: Integrate donation data via REST API
- **Organizations**: Sync data between systems using webhooks

## 🔄 Future Enhancements

- Integration with real nonprofit APIs
- Advanced analytics and reporting
- Mobile app development
- Multi-language support
- Blockchain integration for transparency

## 🔌 API Access

The Donation Impact Tracker provides a comprehensive REST API for organizations and developers to sync and integrate donation data.

### Key API Features

- **Secure Authentication**: API key-based authentication with rate limiting
- **Comprehensive Endpoints**: Access donations, donors, campaigns, and impact metrics
- **Real-time Webhooks**: Subscribe to events like new donations or impact records
- **Flexible Filtering**: Query data by region, date range, campaign, and more
- **Aggregated Analytics**: Get summary statistics and aggregated impact data

### Quick Start

1. **Get API Key**: Use the demo key for testing:
   ```
   demo_key_12345678901234567890123456789012
   ```

2. **Make Your First Request**:
   ```bash
   curl -X GET "https://your-app.azurewebsites.net/api/donations" \
     -H "Authorization: Bearer demo_key_12345678901234567890123456789012"
   ```

3. **Set Up Webhooks** (optional):
   ```bash
   curl -X POST "https://your-app.azurewebsites.net/api/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-app.com/webhook",
       "events": ["donation.created", "impact.recorded"]
     }'
   ```

### Available Endpoints

- `GET /api/donations` - List all donations with filtering
- `POST /api/donations` - Create new donation
- `GET /api/donors` - List all donors
- `GET /api/donors/{id}` - Get specific donor
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/{id}` - Get specific campaign
- `GET /api/impact-metrics` - List impact metrics with aggregation support
- `GET /api/impact-summary` - Get overall impact summary
- `POST /api/webhooks` - Register webhook subscription
- `GET /api/webhooks` - List webhook subscriptions
- `DELETE /api/webhooks/{id}` - Delete webhook subscription

### Full Documentation

For complete API documentation, code examples, and integration guides, see:
**[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

The documentation includes:
- Authentication guide
- All endpoint specifications
- Request/response examples
- Error handling
- Code samples in JavaScript, Python, and cURL
- Webhook setup and verification
- Rate limiting details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For deployment help, see [DEPLOYMENT.md](DEPLOYMENT.md)
For issues, please create a GitHub issue
For questions, contact the development team

---

*Built with ❤️ for nonprofit transparency and donor engagement*