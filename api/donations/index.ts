import { AzureFunction, Context, HttpRequest } from "@azure/functions";

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
  // Add more mock data as needed
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

  try {
    switch (req.method) {
      case 'GET':
        await handleGetDonations(context, req);
        break;
      case 'POST':
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
      body: { error: 'Missing required fields: donorId, amount, and campaign are required' }
    };
    return;
  }

  // Validate amount is a positive number
  if (typeof donation.amount !== 'number' || donation.amount <= 0 || !isFinite(donation.amount)) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Invalid amount: must be a positive number' }
    };
    return;
  }

  // Sanitize string inputs
  const sanitizedDonation = {
    ...donation,
    donorId: String(donation.donorId).replace(/[<>]/g, '').trim().slice(0, 100),
    donorName: String(donation.donorName || '').replace(/[<>]/g, '').trim().slice(0, 200),
    campaign: String(donation.campaign).replace(/[<>]/g, '').trim().slice(0, 200),
    region: String(donation.region || '').replace(/[<>]/g, '').trim().slice(0, 100)
  };

  // Generate new ID
  const newDonation = {
    id: `don-${Date.now()}`,
    ...sanitizedDonation,
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