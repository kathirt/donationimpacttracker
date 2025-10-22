import { AzureFunction, Context, HttpRequest } from "@azure/functions";

// Mock donor data (in production, this would come from a database)
let mockDonors = [
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
    const donorId = req.query.id || (req.params && req.params.id);

    switch (req.method) {
      case 'GET':
        if (donorId) {
          await handleGetDonor(context, donorId);
        } else {
          await handleGetAllDonors(context);
        }
        break;
      case 'POST':
        await handleCreateDonor(context, req);
        break;
      case 'PUT':
        await handleUpdateDonor(context, req, donorId);
        break;
      case 'DELETE':
        await handleDeleteDonor(context, donorId);
        break;
      default:
        context.res = {
          ...context.res,
          status: 405,
          body: { error: 'Method not allowed' }
        };
    }
  } catch (error) {
    context.log.error('Error in donor-profile function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleGetAllDonors(context: Context): Promise<void> {
  context.res = {
    ...context.res,
    status: 200,
    body: mockDonors
  };
}

async function handleGetDonor(context: Context, donorId: string): Promise<void> {
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
      body: { error: 'Missing required fields: name and email are required' }
    };
    return;
  }

  // Check if email already exists
  const existingDonor = mockDonors.find(d => d.email === donor.email);
  if (existingDonor) {
    context.res = {
      ...context.res,
      status: 409,
      body: { error: 'A donor with this email already exists' }
    };
    return;
  }

  // Generate new ID
  const newDonor = {
    id: `donor-${Date.now()}`,
    name: donor.name,
    email: donor.email,
    totalDonated: 0,
    donationCount: 0,
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

async function handleUpdateDonor(context: Context, req: HttpRequest, donorId: string): Promise<void> {
  if (!donorId) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Donor ID is required' }
    };
    return;
  }

  const donorIndex = mockDonors.findIndex(d => d.id === donorId);
  if (donorIndex === -1) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Donor not found' }
    };
    return;
  }

  const updateData = req.body;
  const updatedDonor = {
    ...mockDonors[donorIndex],
    ...updateData,
    id: donorId, // Ensure ID doesn't change
  };

  // In production, update in database
  mockDonors[donorIndex] = updatedDonor;

  context.res = {
    ...context.res,
    status: 200,
    body: updatedDonor
  };
}

async function handleDeleteDonor(context: Context, donorId: string): Promise<void> {
  if (!donorId) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Donor ID is required' }
    };
    return;
  }

  const donorIndex = mockDonors.findIndex(d => d.id === donorId);
  if (donorIndex === -1) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Donor not found' }
    };
    return;
  }

  // In production, delete from database
  mockDonors.splice(donorIndex, 1);

  context.res = {
    ...context.res,
    status: 204,
    body: null
  };
}

export default httpTrigger;
