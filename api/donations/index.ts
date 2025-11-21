import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticateApiKey, requirePermission, sendUnauthorizedResponse, sendForbiddenResponse } from "../utils/auth";

// Mock data (in production, this would come from a database)
const mockDonations = [
  {
    id: 'don-001',
    donorId: 'donor-001',
    donorName: 'John Doe',
    amount: 500,
    date: '2024-01-15',
    campaign: 'School Lunch Program',
    region: 'North America',
    coordinates: { latitude: 40.7128, longitude: -74.0060 }
  },
  {
    id: 'don-002',
    donorId: 'donor-002',
    donorName: 'Jane Smith',
    amount: 250,
    date: '2024-01-14',
    campaign: 'Digital Learning Initiative',
    region: 'Europe',
    coordinates: { latitude: 51.5074, longitude: -0.1278 }
  },
  {
    id: 'don-003',
    donorId: 'donor-003',
    donorName: 'Education Foundation',
    amount: 1000,
    date: '2024-01-13',
    campaign: 'Scholarship Fund',
    region: 'Asia',
    coordinates: { latitude: 35.6762, longitude: 139.6503 }
  },
  {
    id: 'don-004',
    donorId: 'donor-004',
    donorName: 'Tech for Good',
    amount: 750,
    date: '2024-01-12',
    campaign: 'Library Books Drive',
    region: 'Africa',
    coordinates: { latitude: -1.2921, longitude: 36.8219 }
  },
  {
    id: 'don-005',
    donorId: 'donor-001',
    donorName: 'John Doe',
    amount: 300,
    date: '2024-01-10',
    campaign: 'Digital Learning Initiative',
    region: 'North America',
    coordinates: { latitude: 34.0522, longitude: -118.2437 }
  },
  {
    id: 'don-006',
    donorId: 'donor-005',
    donorName: 'Global Impact Corp',
    amount: 2000,
    date: '2024-01-08',
    campaign: 'School Lunch Program',
    region: 'South America',
    coordinates: { latitude: -23.5505, longitude: -46.6333 }
  },
  {
    id: 'don-007',
    donorId: 'donor-002',
    donorName: 'Jane Smith',
    amount: 150,
    date: '2024-01-05',
    campaign: 'Library Books Drive',
    region: 'Europe',
    coordinates: { latitude: 48.8566, longitude: 2.3522 }
  },
  {
    id: 'don-008',
    donorId: 'donor-006',
    donorName: 'Learning Together NGO',
    amount: 800,
    date: '2024-01-03',
    campaign: 'Scholarship Fund',
    region: 'Asia',
    coordinates: { latitude: 28.6139, longitude: 77.2090 }
  }
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.');

  // Enable CORS
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

  try {
    switch (req.method) {
      case 'GET':
        // Check read permission
        const readPermission = requirePermission(context, req, 'donations:read');
        if (!readPermission.authorized) {
          sendForbiddenResponse(context, readPermission.error || 'Insufficient permissions');
          return;
        }
        await handleGetDonations(context, req);
        break;
      case 'POST':
        // Check write permission
        const writePermission = requirePermission(context, req, 'donations:write');
        if (!writePermission.authorized) {
          sendForbiddenResponse(context, writePermission.error || 'Insufficient permissions');
          return;
        }
        await handleCreateDonation(context, req);
        break;
      default:
        context.res = {
          ...context.res,
          status: 405,
          body: { error: 'Method not allowed' }
        };
    }
  } catch (error) {
    context.log.error('Error in donations function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleGetDonations(context: Context, req: HttpRequest): Promise<void> {
  const { donor, campaign, region, startDate, endDate } = req.query;

  let filteredDonations = mockDonations;

  // Apply filters
  if (donor) {
    filteredDonations = filteredDonations.filter(d => d.donorId === donor || d.donorName.toLowerCase().includes(donor.toLowerCase()));
  }

  if (campaign) {
    filteredDonations = filteredDonations.filter(d => d.campaign.toLowerCase().includes(campaign.toLowerCase()));
  }

  if (region) {
    filteredDonations = filteredDonations.filter(d => d.region === region);
  }

  if (startDate) {
    filteredDonations = filteredDonations.filter(d => new Date(d.date) >= new Date(startDate));
  }

  if (endDate) {
    filteredDonations = filteredDonations.filter(d => new Date(d.date) <= new Date(endDate));
  }

  context.res = {
    ...context.res,
    status: 200,
    body: filteredDonations
  };
}

async function handleCreateDonation(context: Context, req: HttpRequest): Promise<void> {
  const donation = req.body;

  // Validate required fields
  if (!donation.donorId || !donation.amount || !donation.campaign) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Missing required fields' }
    };
    return;
  }

  // Generate new ID
  const newDonation = {
    id: `don-${Date.now()}`,
    ...donation,
    date: donation.date || new Date().toISOString().split('T')[0]
  };

  // In production, save to database
  mockDonations.push(newDonation);

  context.res = {
    ...context.res,
    status: 201,
    body: newDonation
  };
}

export default httpTrigger;