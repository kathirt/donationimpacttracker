import { AzureFunction, Context, HttpRequest } from "@azure/functions";

// Regional demo data; aggregate the same records for filtered and global summaries.
const regionalData = [
  {
    region: "North America", donations: 420, amount: 78000, beneficiaries: 1200,
    impacts: { meals_served: 6000, books_distributed: 1800, students_supported: 800, scholarships_provided: 35 }
  },
  {
    region: "Europe", donations: 315, amount: 52000, beneficiaries: 890,
    impacts: { meals_served: 4000, books_distributed: 1200, students_supported: 600, scholarships_provided: 24 }
  },
  {
    region: "Asia", donations: 298, amount: 35000, beneficiaries: 980,
    impacts: { meals_served: 3000, books_distributed: 1000, students_supported: 450, scholarships_provided: 20 }
  },
  {
    region: "Africa", donations: 214, amount: 20420, beneficiaries: 822,
    impacts: { meals_served: 2640, books_distributed: 820, students_supported: 300, scholarships_provided: 10 }
  }
];

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
    const { region } = req.query;
    const unsupportedFilters = Object.keys(req.query).filter(key => key !== 'region' && req.query[key]);
    if (unsupportedFilters.length) {
      context.res = {
        ...context.res,
        status: 400,
        body: { error: 'Impact summary supports region filtering only.', unsupportedFilters }
      };
      return;
    }

    const filteredData = {
      totalDonations: 0,
      totalAmount: 0,
      totalBeneficiaries: 0,
      impactsByType: {
        meals_served: { total: 0, description: "Meals served to students" },
        books_distributed: { total: 0, description: "Educational books distributed" },
        students_supported: { total: 0, description: "Students receiving support" },
        scholarships_provided: { total: 0, description: "Full scholarships awarded" }
      },
      regionBreakdown: {} as Record<string, { donations: number; amount: number; beneficiaries: number }>
    };

    for (const data of regionalData.filter(data => !region || data.region === region)) {
      filteredData.totalDonations += data.donations;
      filteredData.totalAmount += data.amount;
      filteredData.totalBeneficiaries += data.beneficiaries;
      filteredData.regionBreakdown[data.region] = {
        donations: data.donations, amount: data.amount, beneficiaries: data.beneficiaries
      };
      for (const type of Object.keys(data.impacts) as Array<keyof typeof data.impacts>) {
        filteredData.impactsByType[type].total += data.impacts[type];
      }
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