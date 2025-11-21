import { Context, HttpRequest } from "@azure/functions";
import { validateApiKey, hasPermission, recordUsage, checkRateLimit } from './apiKeyManager';
import { ApiPermission } from '../../src/types';

/**
 * Authentication middleware for Azure Functions
 */
export function authenticateApiKey(context: Context, req: HttpRequest): {
  authenticated: boolean;
  apiKeyId?: string;
  organizationId?: string;
  error?: string;
} {
  // Extract API key from Authorization header
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return {
      authenticated: false,
      error: 'Missing Authorization header. Please provide: Authorization: Bearer <api_key>'
    };
  }

  // Check if it's a Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return {
      authenticated: false,
      error: 'Invalid Authorization header format. Expected: Bearer <api_key>'
    };
  }

  const apiKey = parts[1];

  // Validate the API key
  const validation = validateApiKey(apiKey);
  if (!validation.valid || !validation.apiKey) {
    return {
      authenticated: false,
      error: validation.error || 'Invalid API key'
    };
  }

  // Check rate limit
  const rateLimit = checkRateLimit(apiKey);
  if (!rateLimit.allowed) {
    return {
      authenticated: false,
      error: 'Rate limit exceeded. Please try again later.'
    };
  }

  // Record usage
  recordUsage(apiKey);

  // Add rate limit headers to response
  if (!context.res) {
    context.res = {};
  }
  context.res.headers = {
    ...context.res.headers,
    'X-RateLimit-Limit': validation.apiKey.rateLimit.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString()
  };

  context.log('API request authenticated', {
    organizationId: validation.apiKey.organizationId,
    keyId: validation.apiKey.id
  });

  return {
    authenticated: true,
    apiKeyId: validation.apiKey.id,
    organizationId: validation.apiKey.organizationId
  };
}

/**
 * Check if the authenticated API key has required permission
 */
export function requirePermission(
  context: Context,
  req: HttpRequest,
  permission: ApiPermission
): { authorized: boolean; error?: string } {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return { authorized: false, error: 'Not authenticated' };
  }

  const apiKey = authHeader.split(' ')[1];
  const validation = validateApiKey(apiKey);

  if (!validation.valid || !validation.apiKey) {
    return { authorized: false, error: 'Invalid API key' };
  }

  if (!hasPermission(validation.apiKey, permission)) {
    return {
      authorized: false,
      error: `Insufficient permissions. Required: ${permission}`
    };
  }

  return { authorized: true };
}

/**
 * Send unauthorized response
 */
export function sendUnauthorizedResponse(context: Context, message: string): void {
  context.res = {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'WWW-Authenticate': 'Bearer'
    },
    body: {
      error: 'Unauthorized',
      message
    }
  };
}

/**
 * Send forbidden response
 */
export function sendForbiddenResponse(context: Context, message: string): void {
  context.res = {
    status: 403,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      error: 'Forbidden',
      message
    }
  };
}

/**
 * Send rate limit exceeded response
 */
export function sendRateLimitResponse(context: Context): void {
  context.res = {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': '3600'
    },
    body: {
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please try again later.'
    }
  };
}
