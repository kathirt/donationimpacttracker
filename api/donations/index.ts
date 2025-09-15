import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as fs from 'fs';
import * as path from 'path';

// Load transformed NCCS data
let realDonations: any[] = [];
let realCampaigns: any[] = [];

try {
  const donationsPath = path.join(__dirname, '../../data/transformed/donations.json');
  const campaignsPath = path.join(__dirname, '../../data/transformed/campaigns.json');
  
  if (fs.existsSync(donationsPath)) {
    realDonations = JSON.parse(fs.readFileSync(donationsPath, 'utf8'));
    console.log(`Loaded ${realDonations.length} real donations from NCCS data`);
  }
  
  if (fs.existsSync(campaignsPath)) {
    realCampaigns = JSON.parse(fs.readFileSync(campaignsPath, 'utf8'));
    console.log(`Loaded ${realCampaigns.length} real campaigns from NCCS data`);
  }
} catch (error) {
  console.warn('Could not load transformed NCCS data, falling back to mock data:', error);
}

// Fallback mock data if real data isn't available
const mockDonations = [
  {
    id: 'don-001',
    donorName: 'John Doe',
    amount: 500,
    date: '2024-01-15',
    campaign: 'School Lunch Program',
    location: { region: 'North America', coordinates: [40.7128, -74.0060] },
    type: 'individual'
  },
  {
    id: 'don-002',
    donorName: 'Jane Smith',
    amount: 250,
    date: '2024-01-14',
    campaign: 'Digital Learning Initiative',
    location: { region: 'Europe', coordinates: [51.5074, -0.1278] },
    type: 'individual'
  }
];

// Use real data if available, otherwise use mock data
const donationsData = realDonations.length > 0 ? realDonations : mockDonations;

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
  const { donor, campaign, region, startDate, endDate, limit = '100' } = req.query;

  let filteredDonations = [...donationsData];

  // Apply filters
  if (donor) {
    filteredDonations = filteredDonations.filter(d => 
      d.donorName?.toLowerCase().includes(donor.toLowerCase())
    );
  }

  if (campaign) {
    // Find matching campaign IDs
    const matchingCampaigns = realCampaigns.filter(c => 
      c.name?.toLowerCase().includes(campaign.toLowerCase())
    ).map(c => c.id);
    
    filteredDonations = filteredDonations.filter(d => 
      matchingCampaigns.includes(d.campaign) || 
      d.campaign?.toLowerCase().includes(campaign.toLowerCase())
    );
  }

  if (region) {
    filteredDonations = filteredDonations.filter(d => 
      d.location?.region === region || d.location?.country === region
    );
  }

  if (startDate) {
    filteredDonations = filteredDonations.filter(d => new Date(d.date) >= new Date(startDate));
  }

  if (endDate) {
    filteredDonations = filteredDonations.filter(d => new Date(d.date) <= new Date(endDate));
  }

  // Limit results for performance
  const limitNum = parseInt(limit as string) || 100;
  filteredDonations = filteredDonations.slice(0, limitNum);

  // Add campaign details to donations
  const enrichedDonations = filteredDonations.map(donation => {
    const campaign = realCampaigns.find(c => c.id === donation.campaign);
    return {
      ...donation,
      campaignName: campaign?.name || donation.campaign,
      campaignCategory: campaign?.category
    };
  });

  context.res = {
    ...context.res,
    status: 200,
    body: {
      donations: enrichedDonations,
      total: enrichedDonations.length,
      summary: {
        totalAmount: enrichedDonations.reduce((sum, d) => sum + d.amount, 0),
        averageAmount: enrichedDonations.length > 0 ? 
          enrichedDonations.reduce((sum, d) => sum + d.amount, 0) / enrichedDonations.length : 0,
        donorTypes: enrichedDonations.reduce((acc, d) => {
          acc[d.type] = (acc[d.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    }
  };
}

async function handleCreateDonation(context: Context, req: HttpRequest): Promise<void> {
  const donation = req.body;

  // Validate required fields
  if (!donation.donorName || !donation.amount || !donation.campaign) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Missing required fields: donorName, amount, campaign' }
    };
    return;
  }

  // Generate new ID
  const newDonation = {
    id: `don-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    donorName: donation.donorName,
    amount: parseFloat(donation.amount),
    date: donation.date || new Date().toISOString().split('T')[0],
    campaign: donation.campaign,
    location: donation.location || { region: 'Unknown', coordinates: [0, 0] },
    type: donation.type || 'individual'
  };

  // In production, this would save to database
  // For now, we'll just return the new donation
  context.res = {
    ...context.res,
    status: 201,
    body: {
      success: true,
      donation: newDonation,
      message: 'Donation recorded successfully'
    }
  };
}

export default httpTrigger;