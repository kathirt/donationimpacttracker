import { AzureFunction, Context, HttpRequest } from "@azure/functions";

// Mock impact data
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

    // In production, filter data based on query parameters
    let filteredData = { ...mockImpactData };

    // Apply filters if needed (simplified for demo)
    if (region && mockImpactData.regionBreakdown[region]) {
      // Filter by specific region
      const regionData = mockImpactData.regionBreakdown[region];
      filteredData = {
        ...filteredData,
        totalDonations: regionData.donations,
        totalAmount: regionData.amount,
        totalBeneficiaries: regionData.beneficiaries
      };
    }

    context.res = {
      ...context.res,
      status: 200,
      body: filteredData
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