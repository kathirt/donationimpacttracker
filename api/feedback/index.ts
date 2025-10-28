import { AzureFunction, Context, HttpRequest } from "@azure/functions";

// Mock feedback storage (in production, this would come from a database)
const mockFeedback: any[] = [];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a feedback request.');

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
        await handleGetFeedback(context, req);
        break;
      case 'POST':
        await handleSubmitFeedback(context, req);
        break;
      default:
        context.res = {
          ...context.res,
          status: 405,
          body: { error: 'Method not allowed' }
        };
    }
  } catch (error) {
    context.log.error('Error in feedback function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleGetFeedback(context: Context, req: HttpRequest): Promise<void> {
  const { campaign, region, status } = req.query;

  let filteredFeedback = mockFeedback;

  // Apply filters
  if (campaign) {
    filteredFeedback = filteredFeedback.filter(f => f.campaign === campaign);
  }

  if (region) {
    filteredFeedback = filteredFeedback.filter(f => f.region === region);
  }

  if (status) {
    filteredFeedback = filteredFeedback.filter(f => f.status === status);
  }

  context.res = {
    ...context.res,
    status: 200,
    body: filteredFeedback
  };
}

async function handleSubmitFeedback(context: Context, req: HttpRequest): Promise<void> {
  const feedback = req.body;

  // Validate required fields
  if (!feedback.beneficiaryName || !feedback.campaign || !feedback.region || !feedback.message) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Missing required fields' }
    };
    return;
  }

  // Generate new ID
  const newFeedback = {
    id: `fb-${Date.now()}`,
    ...feedback,
    date: new Date().toISOString(),
    status: 'pending' // Default status
  };

  // In production, save to database
  mockFeedback.push(newFeedback);

  context.log('New feedback submitted:', newFeedback);

  context.res = {
    ...context.res,
    status: 201,
    body: {
      message: 'Feedback submitted successfully',
      feedback: newFeedback
    }
  };
}

export default httpTrigger;
