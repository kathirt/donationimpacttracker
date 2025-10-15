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
├── Donations API
├── Impact Metrics API
└── Data Processing

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

## 🔄 Future Enhancements

- Integration with real nonprofit APIs
- Advanced analytics and reporting
- Mobile app development
- Multi-language support
- Blockchain integration for transparency

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Security Guidelines](SECURITY.md) - Security best practices
- [Code Quality](CODE_QUALITY.md) - Code standards and guidelines
- [Contributing](CONTRIBUTING.md) - How to contribute
- [Code Review Summary](CODE_REVIEW_SUMMARY.md) - Latest review findings
- [Deployment Guide](DEPLOYMENT.md) - Azure deployment instructions

## 🔒 Security

- ✅ CodeQL security analysis passed with 0 alerts
- ✅ Input validation and sanitization implemented
- ✅ Security headers configured (CSP, X-Frame-Options, etc.)
- ✅ Environment variables for sensitive data
- See [SECURITY.md](SECURITY.md) for complete security policy

## 📊 Code Quality

- ✅ TypeScript strict mode enabled
- ✅ Error boundaries for graceful error handling
- ✅ Comprehensive documentation
- ✅ Accessibility features (ARIA labels, semantic HTML)
- See [CODE_QUALITY.md](CODE_QUALITY.md) for standards

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- For deployment help, see [DEPLOYMENT.md](DEPLOYMENT.md)
- For API questions, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- For security concerns, see [SECURITY.md](SECURITY.md)
- For issues, please create a GitHub issue
- For questions, contact the development team

---

*Built with ❤️ for nonprofit transparency and donor engagement*