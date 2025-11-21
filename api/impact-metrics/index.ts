import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticateApiKey, requirePermission, sendUnauthorizedResponse, sendForbiddenResponse } from "../utils/auth";

// Mock impact metrics data (in production, this would come from a database)
const mockImpactMetrics = [
  {
    id: 'imp-001',
    donationId: 'don-001',
    type: 'meals_served',
    value: 150,
    description: '150 nutritious meals served to elementary school students',
    region: 'North America',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    date: '2024-01-15'
  },
  {
    id: 'imp-002',
    donationId: 'don-002',
    type: 'books_distributed',
    value: 25,
    description: '25 digital learning tablets distributed to rural schools',
    region: 'Europe',
    coordinates: { latitude: 51.5074, longitude: -0.1278 },
    date: '2024-01-14'
  },
  {
    id: 'imp-003',
    donationId: 'don-003',
    type: 'scholarships_provided',
    value: 2,
    description: '2 full scholarships awarded to deserving students',
    region: 'Asia',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
    date: '2024-01-13'
  },
  {
    id: 'imp-004',
    donationId: 'don-004',
    type: 'books_distributed',
    value: 75,
    description: '75 educational textbooks added to community library',
    region: 'Africa',
    coordinates: { latitude: -1.2921, longitude: 36.8219 },
    date: '2024-01-12'
  },
  {
    id: 'imp-005',
    donationId: 'don-005',
    type: 'students_supported',
    value: 30,
    description: '30 students provided with digital learning access',
    region: 'North America',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    date: '2024-01-10'
  },
  {
    id: 'imp-006',
    donationId: 'don-006',
    type: 'meals_served',
    value: 600,
    description: '600 meals provided through school feeding program',
    region: 'South America',
    coordinates: { latitude: -23.5505, longitude: -46.6333 },
    date: '2024-01-08'
  },
  {
    id: 'imp-007',
    donationId: 'don-007',
    type: 'books_distributed',
    value: 15,
    description: '15 children\'s storybooks donated to local library',
    region: 'Europe',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
    date: '2024-01-05'
  },
  {
    id: 'imp-008',
    donationId: 'don-008',
    type: 'scholarships_provided',
    value: 1,
    description: '1 scholarship covering full university tuition',
    region: 'Asia',
    coordinates: { latitude: 28.6139, longitude: 77.2090 },
    date: '2024-01-03'
  }
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Impact Metrics API function processed a request.');

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
  const readPermission = requirePermission(context, req, 'impact:read');
  if (!readPermission.authorized) {
    sendForbiddenResponse(context, readPermission.error || 'Insufficient permissions');
    return;
  }

  try {
    const metricId = req.params.id;

    if (metricId) {
      await handleGetMetricById(context, metricId);
    } else {
      await handleGetMetrics(context, req);
    }
  } catch (error) {
    context.log.error('Error in impact metrics function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleGetMetrics(context: Context, req: HttpRequest): Promise<void> {
  const { region, type, donationId, startDate, endDate, aggregated } = req.query;

  let filteredMetrics = mockImpactMetrics;

  // Apply filters
  if (region) {
    filteredMetrics = filteredMetrics.filter(m => m.region === region);
  }

  if (type) {
    filteredMetrics = filteredMetrics.filter(m => m.type === type);
  }

  if (donationId) {
    filteredMetrics = filteredMetrics.filter(m => m.donationId === donationId);
  }

  if (startDate) {
    filteredMetrics = filteredMetrics.filter(m => new Date(m.date) >= new Date(startDate));
  }

  if (endDate) {
    filteredMetrics = filteredMetrics.filter(m => new Date(m.date) <= new Date(endDate));
  }

  // If aggregated view is requested
  if (aggregated === 'true') {
    const aggregatedData = aggregateMetrics(filteredMetrics);
    context.res = {
      ...context.res,
      status: 200,
      body: {
        aggregated: true,
        summary: aggregatedData
      }
    };
    return;
  }

  context.res = {
    ...context.res,
    status: 200,
    body: {
      count: filteredMetrics.length,
      metrics: filteredMetrics
    }
  };
}

async function handleGetMetricById(context: Context, metricId: string): Promise<void> {
  const metric = mockImpactMetrics.find(m => m.id === metricId);

  if (!metric) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Impact metric not found' }
    };
    return;
  }

  context.res = {
    ...context.res,
    status: 200,
    body: metric
  };
}

function aggregateMetrics(metrics: any[]) {
  const byType: { [key: string]: { total: number; count: number } } = {};
  const byRegion: { [key: string]: { total: number; count: number } } = {};
  let totalImpact = 0;

  metrics.forEach(metric => {
    // Aggregate by type
    if (!byType[metric.type]) {
      byType[metric.type] = { total: 0, count: 0 };
    }
    byType[metric.type].total += metric.value;
    byType[metric.type].count += 1;

    // Aggregate by region
    if (!byRegion[metric.region]) {
      byRegion[metric.region] = { total: 0, count: 0 };
    }
    byRegion[metric.region].total += metric.value;
    byRegion[metric.region].count += 1;

    totalImpact += metric.value;
  });

  return {
    totalImpact,
    totalMetrics: metrics.length,
    byType,
    byRegion
  };
}

export default httpTrigger;
