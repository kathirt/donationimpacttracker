import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticateApiKey, requirePermission, sendUnauthorizedResponse, sendForbiddenResponse } from "../utils/auth";

// Mock campaign data (in production, this would come from a database)
const mockCampaigns = [
  {
    id: 'camp-001',
    name: 'School Lunch Program',
    description: 'Providing nutritious meals to students in underserved communities to improve their health and academic performance.',
    goal: 50000,
    raised: 42500,
    region: 'Global',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    impactTypes: ['meals_served', 'students_supported'],
    isActive: true
  },
  {
    id: 'camp-002',
    name: 'Digital Learning Initiative',
    description: 'Equipping schools with technology and digital resources to enhance modern education and prepare students for the digital age.',
    goal: 75000,
    raised: 58200,
    region: 'Global',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    impactTypes: ['books_distributed', 'students_supported'],
    isActive: true
  },
  {
    id: 'camp-003',
    name: 'Scholarship Fund',
    description: 'Supporting talented students from low-income families with scholarships to pursue higher education and break the cycle of poverty.',
    goal: 100000,
    raised: 89500,
    region: 'Global',
    startDate: '2023-09-01',
    endDate: '2024-08-31',
    impactTypes: ['scholarships_provided', 'students_supported'],
    isActive: true
  },
  {
    id: 'camp-004',
    name: 'Library Books Drive',
    description: 'Building and stocking community libraries with books and educational materials to promote literacy and lifelong learning.',
    goal: 30000,
    raised: 28750,
    region: 'Global',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    impactTypes: ['books_distributed'],
    isActive: true
  }
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Campaigns API function processed a request.');

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

  // Authenticate API key for all requests
  const auth = authenticateApiKey(context, req);
  if (!auth.authenticated) {
    sendUnauthorizedResponse(context, auth.error || 'Authentication required');
    return;
  }

  // Check read permission
  const readPermission = requirePermission(context, req, 'campaigns:read');
  if (!readPermission.authorized) {
    sendForbiddenResponse(context, readPermission.error || 'Insufficient permissions');
    return;
  }

  try {
    const campaignId = req.params.id;

    if (campaignId) {
      await handleGetCampaignById(context, campaignId);
    } else {
      await handleGetCampaigns(context, req);
    }
  } catch (error) {
    context.log.error('Error in campaigns function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleGetCampaigns(context: Context, req: HttpRequest): Promise<void> {
  const { region, active, impactType } = req.query;

  let filteredCampaigns = mockCampaigns;

  // Apply filters
  if (region && region !== 'Global') {
    filteredCampaigns = filteredCampaigns.filter(c => 
      c.region === region || c.region === 'Global'
    );
  }

  if (active === 'true') {
    const now = new Date();
    filteredCampaigns = filteredCampaigns.filter(c => {
      const startDate = new Date(c.startDate);
      const endDate = new Date(c.endDate);
      return c.isActive && now >= startDate && now <= endDate;
    });
  }

  if (impactType) {
    filteredCampaigns = filteredCampaigns.filter(c => 
      c.impactTypes.includes(impactType)
    );
  }

  context.res = {
    ...context.res,
    status: 200,
    body: {
      count: filteredCampaigns.length,
      campaigns: filteredCampaigns
    }
  };
}

async function handleGetCampaignById(context: Context, campaignId: string): Promise<void> {
  const campaign = mockCampaigns.find(c => c.id === campaignId);

  if (!campaign) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Campaign not found' }
    };
    return;
  }

  // Calculate additional stats
  const progress = (campaign.raised / campaign.goal) * 100;
  const remaining = campaign.goal - campaign.raised;

  context.res = {
    ...context.res,
    status: 200,
    body: {
      ...campaign,
      stats: {
        progress: Math.round(progress * 100) / 100,
        remaining,
        daysRemaining: Math.ceil(
          (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      }
    }
  };
}

export default httpTrigger;
