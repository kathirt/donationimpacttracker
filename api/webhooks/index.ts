import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as crypto from 'crypto';
import { authenticateApiKey, requirePermission, sendUnauthorizedResponse, sendForbiddenResponse } from "../utils/auth";

// Constants
const WEBHOOK_SECRET_PREFIX = 'whsec_';
const WEBHOOK_ID_PREFIX = 'wh-';

// Mock webhook subscriptions storage
const webhookSubscriptions: any[] = [];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Webhooks API function processed a request.');

  // Enable CORS
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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

  // Check webhooks permission
  const webhookPermission = requirePermission(context, req, 'webhooks:manage');
  if (!webhookPermission.authorized) {
    sendForbiddenResponse(context, webhookPermission.error || 'Insufficient permissions');
    return;
  }

  try {
    const webhookId = req.params.id;

    switch (req.method) {
      case 'GET':
        if (webhookId) {
          await handleGetWebhookById(context, webhookId, auth.organizationId!);
        } else {
          await handleListWebhooks(context, auth.organizationId!);
        }
        break;
        
      case 'POST':
        await handleCreateWebhook(context, req, auth.organizationId!);
        break;
        
      case 'DELETE':
        if (!webhookId) {
          context.res = {
            ...context.res,
            status: 400,
            body: { error: 'Webhook ID is required for deletion' }
          };
          return;
        }
        await handleDeleteWebhook(context, webhookId, auth.organizationId!);
        break;
        
      default:
        context.res = {
          ...context.res,
          status: 405,
          body: { error: 'Method not allowed' }
        };
    }
  } catch (error) {
    context.log.error('Error in webhooks function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleListWebhooks(context: Context, organizationId: string): Promise<void> {
  const orgWebhooks = webhookSubscriptions.filter(w => w.organizationId === organizationId);

  context.res = {
    ...context.res,
    status: 200,
    body: {
      count: orgWebhooks.length,
      webhooks: orgWebhooks.map(w => ({
        id: w.id,
        url: w.url,
        events: w.events,
        isActive: w.isActive,
        createdAt: w.createdAt,
        lastTriggeredAt: w.lastTriggeredAt
      }))
    }
  };
}

async function handleGetWebhookById(context: Context, webhookId: string, organizationId: string): Promise<void> {
  const webhook = webhookSubscriptions.find(
    w => w.id === webhookId && w.organizationId === organizationId
  );

  if (!webhook) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Webhook not found' }
    };
    return;
  }

  context.res = {
    ...context.res,
    status: 200,
    body: {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      isActive: webhook.isActive,
      createdAt: webhook.createdAt,
      lastTriggeredAt: webhook.lastTriggeredAt
    }
  };
}

async function handleCreateWebhook(context: Context, req: HttpRequest, organizationId: string): Promise<void> {
  const { url, events } = req.body;

  // Validate required fields
  if (!url || !events || !Array.isArray(events) || events.length === 0) {
    context.res = {
      ...context.res,
      status: 400,
      body: { 
        error: 'Missing required fields',
        message: 'Please provide url and events array'
      }
    };
    return;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Invalid URL format' }
    };
    return;
  }

  // Validate events
  const validEvents = [
    'donation.created',
    'donation.updated',
    'campaign.created',
    'campaign.updated',
    'impact.recorded'
  ];

  const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
  if (invalidEvents.length > 0) {
    context.res = {
      ...context.res,
      status: 400,
      body: { 
        error: 'Invalid events',
        message: `Invalid event types: ${invalidEvents.join(', ')}`,
        validEvents
      }
    };
    return;
  }

  // Generate webhook secret
  const secret = WEBHOOK_SECRET_PREFIX + crypto.randomBytes(24).toString('hex');

  // Create webhook subscription
  const webhook = {
    id: WEBHOOK_ID_PREFIX + crypto.randomBytes(8).toString('hex'),
    organizationId,
    url,
    events,
    secret,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  webhookSubscriptions.push(webhook);

  context.res = {
    ...context.res,
    status: 201,
    body: {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      isActive: webhook.isActive,
      createdAt: webhook.createdAt,
      message: 'Webhook created successfully. Save the secret for verifying webhook payloads.'
    }
  };
}

async function handleDeleteWebhook(context: Context, webhookId: string, organizationId: string): Promise<void> {
  const webhookIndex = webhookSubscriptions.findIndex(
    w => w.id === webhookId && w.organizationId === organizationId
  );

  if (webhookIndex === -1) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Webhook not found' }
    };
    return;
  }

  webhookSubscriptions.splice(webhookIndex, 1);

  context.res = {
    ...context.res,
    status: 200,
    body: { message: 'Webhook deleted successfully' }
  };
}

export default httpTrigger;
