import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as fs from 'fs';
import * as path from 'path';

// Load transformed NCCS data
let realDonations: any[] = [];
let realCampaigns: any[] = [];
let realImpactLocations: any[] = [];
let transformationStats: any = {};

try {
  const donationsPath = path.join(__dirname, '../../data/transformed/donations.json');
  const campaignsPath = path.join(__dirname, '../../data/transformed/campaigns.json');
  const locationsPath = path.join(__dirname, '../../data/transformed/impact-locations.json');
  const statsPath = path.join(__dirname, '../../data/transformed/transformation-stats.json');
  
  if (fs.existsSync(donationsPath)) {
    realDonations = JSON.parse(fs.readFileSync(donationsPath, 'utf8'));
  }
  
  if (fs.existsSync(campaignsPath)) {
    realCampaigns = JSON.parse(fs.readFileSync(campaignsPath, 'utf8'));
  }
  
  if (fs.existsSync(locationsPath)) {
    realImpactLocations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
  }
  
  if (fs.existsSync(statsPath)) {
    transformationStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  }
  
  console.log(`Loaded ${realDonations.length} donations, ${realCampaigns.length} campaigns, ${realImpactLocations.length} locations`);
} catch (error) {
  console.warn('Could not load transformed NCCS data, falling back to mock data:', error);
}

// Mock impact data as fallback
const mockImpactData = {
  totalDonations: 1247,
  totalAmount: 185420,
  totalBeneficiaries: 3892,
  impactsByType: {
    meals_served: { total: 15640, description: "Meals served to students" },
    books_distributed: { total: 4820, description: "Educational books distributed" },
    students_supported: { total: 2150, description: "Students receiving support" },
    scholarships_provided: { total: 89, description: "Full scholarships awarded" }
  },
  regionBreakdown: {
    "North America": { donations: 420, amount: 78000, beneficiaries: 1200 },
    "Europe": { donations: 315, amount: 52000, beneficiaries: 890 },
    "Asia": { donations: 298, amount: 35000, beneficiaries: 980 },
    "Africa": { donations: 214, amount: 20420, beneficiaries: 822 }
  }
};

function generateRealImpactData(): any {
  if (realDonations.length === 0) {
    return mockImpactData;
  }

  // Calculate real statistics
  const totalDonations = realDonations.length;
  const totalAmount = realDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalBeneficiaries = realCampaigns.reduce((sum, c) => sum + (c.beneficiaries || 0), 0);

  // Impact metrics from campaigns
  const impactsByType: Record<string, any> = {};
  realCampaigns.forEach(campaign => {
    if (campaign.impactMetrics) {
      Object.entries(campaign.impactMetrics).forEach(([key, value]) => {
        if (!impactsByType[key]) {
          impactsByType[key] = { total: 0, description: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
        }
        impactsByType[key].total += (value as number) || 0;
      });
    }
  });

  // Region breakdown
  const regionBreakdown: Record<string, any> = {};
  realImpactLocations.forEach(location => {
    regionBreakdown[location.name] = {
      donations: location.totalDonations || 0,
      amount: location.totalDonations || 0,
      beneficiaries: location.beneficiaries || 0,
      activeCampaigns: location.activeCampaigns || 0
    };
  });

  // Category breakdown
  const categoryBreakdown: Record<string, any> = {};
  if (transformationStats.statistics?.topCategories) {
    Object.entries(transformationStats.statistics.topCategories).forEach(([category, count]) => {
      const categoryDonations = realDonations.filter(d => {
        const campaign = realCampaigns.find(c => c.id === d.campaign);
        return campaign?.category === category;
      });
      
      categoryBreakdown[category] = {
        campaigns: count,
        donations: categoryDonations.length,
        amount: categoryDonations.reduce((sum, d) => sum + d.amount, 0)
      };
    });
  }

  return {
    totalDonations,
    totalAmount,
    totalBeneficiaries,
    totalCampaigns: realCampaigns.length,
    impactsByType,
    regionBreakdown,
    categoryBreakdown,
    donorTypeDistribution: transformationStats.statistics?.donorTypeDistribution || {},
    averageDonation: totalAmount / totalDonations,
    dateRange: transformationStats.dateRange,
    generatedAt: transformationStats.generatedAt,
    dataSource: 'NCCS IRS 990 Efilers'
  };
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Impact summary function processed a request.');

  // Enable CORS
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  try {
    const { region, campaign, donor } = req.query;

    // Generate impact data from real NCCS data or use mock data
    let impactData = generateRealImpactData();

    // Apply filters if needed
    if (region && impactData.regionBreakdown && impactData.regionBreakdown[region]) {
      const regionData = impactData.regionBreakdown[region];
      impactData = {
        ...impactData,
        totalDonations: regionData.donations,
        totalAmount: regionData.amount,
        totalBeneficiaries: regionData.beneficiaries,
        filteredBy: `region: ${region}`
      };
    }

    if (campaign) {
      // Filter by campaign if specified
      const matchingCampaign = realCampaigns.find(c => 
        c.name?.toLowerCase().includes(campaign.toLowerCase()) ||
        c.id === campaign
      );
      
      if (matchingCampaign) {
        const campaignDonations = realDonations.filter(d => d.campaign === matchingCampaign.id);
        impactData = {
          ...impactData,
          totalDonations: campaignDonations.length,
          totalAmount: campaignDonations.reduce((sum, d) => sum + d.amount, 0),
          totalBeneficiaries: matchingCampaign.beneficiaries || 0,
          filteredBy: `campaign: ${matchingCampaign.name}`,
          campaignDetails: {
            name: matchingCampaign.name,
            description: matchingCampaign.description,
            category: matchingCampaign.category,
            status: matchingCampaign.status,
            goal: matchingCampaign.goal,
            raised: matchingCampaign.raised
          }
        };
      }
    }

    context.res = {
      ...context.res,
      status: 200,
      body: impactData
    };

  } catch (error) {
    context.log.error('Error in impact summary function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

export default httpTrigger;