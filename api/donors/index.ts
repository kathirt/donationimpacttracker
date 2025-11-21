import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticateApiKey, requirePermission, sendUnauthorizedResponse, sendForbiddenResponse } from "../utils/auth";

// Mock donor data (in production, this would come from a database)
const mockDonors = [
  {
    id: 'donor-001',
    name: 'John Doe',
    email: 'john.doe@email.com',
    totalDonated: 2500,
    donationCount: 8,
    preferredCampaigns: ['School Lunch Program', 'Digital Learning Initiative'],
    joinDate: '2023-03-15'
  },
  {
    id: 'donor-002',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    totalDonated: 1800,
    donationCount: 6,
    preferredCampaigns: ['Scholarship Fund', 'Library Books Drive'],
    joinDate: '2023-05-22'
  },
  {
    id: 'donor-003',
    name: 'Education Foundation',
    email: 'contact@educfoundation.org',
    totalDonated: 15000,
    donationCount: 25,
    preferredCampaigns: ['School Lunch Program', 'Scholarship Fund', 'Digital Learning Initiative'],
    joinDate: '2022-09-10'
  },
  {
    id: 'donor-004',
    name: 'Tech for Good',
    email: 'donate@techforgood.org',
    totalDonated: 8500,
    donationCount: 15,
    preferredCampaigns: ['Digital Learning Initiative', 'Library Books Drive'],
    joinDate: '2023-01-08'
  },
  {
    id: 'donor-005',
    name: 'Global Impact Corp',
    email: 'csr@globalimpact.com',
    totalDonated: 12000,
    donationCount: 20,
    preferredCampaigns: ['School Lunch Program', 'Scholarship Fund'],
    joinDate: '2022-11-20'
  },
  {
    id: 'donor-006',
    name: 'Learning Together NGO',
    email: 'info@learningtogether.org',
    totalDonated: 5500,
    donationCount: 12,
    preferredCampaigns: ['Scholarship Fund', 'Digital Learning Initiative'],
    joinDate: '2023-07-14'
  }
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Donors API function processed a request.');

  // Enable CORS
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    const donorId = req.params.id;

    switch (req.method) {
      case 'GET':
        // Check read permission
        const readPermission = requirePermission(context, req, 'donors:read');
        if (!readPermission.authorized) {
          sendForbiddenResponse(context, readPermission.error || 'Insufficient permissions');
          return;
        }
        
        if (donorId) {
          await handleGetDonorById(context, donorId);
        } else {
          await handleGetDonors(context, req);
        }
        break;
        
      case 'POST':
        // Check write permission
        const createPermission = requirePermission(context, req, 'donors:write');
        if (!createPermission.authorized) {
          sendForbiddenResponse(context, createPermission.error || 'Insufficient permissions');
          return;
        }
        await handleCreateDonor(context, req);
        break;
        
      case 'PUT':
        // Check write permission
        const updatePermission = requirePermission(context, req, 'donors:write');
        if (!updatePermission.authorized) {
          sendForbiddenResponse(context, updatePermission.error || 'Insufficient permissions');
          return;
        }
        
        if (!donorId) {
          context.res = {
            ...context.res,
            status: 400,
            body: { error: 'Donor ID is required for update' }
          };
          return;
        }
        await handleUpdateDonor(context, donorId, req);
        break;
        
      default:
        context.res = {
          ...context.res,
          status: 405,
          body: { error: 'Method not allowed' }
        };
    }
  } catch (error) {
    context.log.error('Error in donors function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleGetDonors(context: Context, req: HttpRequest): Promise<void> {
  const { name, email, minDonated, campaign } = req.query;

  let filteredDonors = mockDonors;

  // Apply filters
  if (name) {
    filteredDonors = filteredDonors.filter(d => 
      d.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (email) {
    filteredDonors = filteredDonors.filter(d => 
      d.email.toLowerCase().includes(email.toLowerCase())
    );
  }

  if (minDonated) {
    const minAmount = parseFloat(minDonated);
    filteredDonors = filteredDonors.filter(d => d.totalDonated >= minAmount);
  }

  if (campaign) {
    filteredDonors = filteredDonors.filter(d => 
      d.preferredCampaigns.some(c => 
        c.toLowerCase().includes(campaign.toLowerCase())
      )
    );
  }

  context.res = {
    ...context.res,
    status: 200,
    body: {
      count: filteredDonors.length,
      donors: filteredDonors
    }
  };
}

async function handleGetDonorById(context: Context, donorId: string): Promise<void> {
  const donor = mockDonors.find(d => d.id === donorId);

  if (!donor) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Donor not found' }
    };
    return;
  }

  context.res = {
    ...context.res,
    status: 200,
    body: donor
  };
}

async function handleCreateDonor(context: Context, req: HttpRequest): Promise<void> {
  const donor = req.body;

  // Validate required fields
  if (!donor.name || !donor.email) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Missing required fields: name, email' }
    };
    return;
  }

  // Generate new ID
  const newDonor = {
    id: `donor-${Date.now()}`,
    name: donor.name,
    email: donor.email,
    totalDonated: donor.totalDonated || 0,
    donationCount: donor.donationCount || 0,
    preferredCampaigns: donor.preferredCampaigns || [],
    joinDate: new Date().toISOString().split('T')[0]
  };

  // In production, save to database
  mockDonors.push(newDonor);

  context.res = {
    ...context.res,
    status: 201,
    body: newDonor
  };
}

async function handleUpdateDonor(context: Context, donorId: string, req: HttpRequest): Promise<void> {
  const donorIndex = mockDonors.findIndex(d => d.id === donorId);

  if (donorIndex === -1) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Donor not found' }
    };
    return;
  }

  const updates = req.body;
  const updatedDonor = {
    ...mockDonors[donorIndex],
    ...updates,
    id: donorId // Ensure ID cannot be changed
  };

  // In production, update in database
  mockDonors[donorIndex] = updatedDonor;

  context.res = {
    ...context.res,
    status: 200,
    body: updatedDonor
  };
}

export default httpTrigger;
