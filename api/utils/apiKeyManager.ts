import * as crypto from 'crypto';
import { ApiKey, ApiPermission } from '../../src/types';

// Mock storage for API keys (in production, use a database)
const apiKeys: Map<string, ApiKey> = new Map();

// Initialize with a demo API key for testing
const demoApiKey: ApiKey = {
  id: 'key-demo-001',
  key: 'demo_key_12345678901234567890123456789012',
  name: 'Demo API Key',
  organizationId: 'org-demo-001',
  organizationName: 'Demo Organization',
  permissions: ['donations:read', 'donors:read', 'campaigns:read', 'impact:read'],
  rateLimit: 1000,
  isActive: true,
  createdAt: new Date().toISOString(),
  usageCount: 0
};

apiKeys.set(demoApiKey.key, demoApiKey);

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new API key for an organization
 */
export function createApiKey(
  organizationId: string,
  organizationName: string,
  name: string,
  permissions: ApiPermission[],
  rateLimit: number = 1000,
  expiresInDays?: number
): ApiKey {
  const key = generateApiKey();
  const apiKey: ApiKey = {
    id: 'key-' + crypto.randomBytes(8).toString('hex'),
    key,
    name,
    organizationId,
    organizationName,
    permissions,
    rateLimit,
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
    usageCount: 0
  };

  apiKeys.set(key, apiKey);
  return apiKey;
}

/**
 * Validate an API key
 */
export function validateApiKey(key: string): { valid: boolean; apiKey?: ApiKey; error?: string } {
  const apiKey = apiKeys.get(key);

  if (!apiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (!apiKey.isActive) {
    return { valid: false, error: 'API key is inactive' };
  }

  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  return { valid: true, apiKey };
}

/**
 * Check if API key has a specific permission
 */
export function hasPermission(apiKey: ApiKey, permission: ApiPermission): boolean {
  return apiKey.permissions.includes(permission);
}

/**
 * Record API key usage
 */
export function recordUsage(key: string): void {
  const apiKey = apiKeys.get(key);
  if (apiKey) {
    apiKey.usageCount++;
    apiKey.lastUsedAt = new Date().toISOString();
  }
}

/**
 * Check rate limit for an API key
 */
export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const apiKey = apiKeys.get(key);
  if (!apiKey) {
    return { allowed: false, remaining: 0 };
  }

  // Simple rate limiting (in production, use Redis or similar)
  // For now, just return the rate limit
  const remaining = apiKey.rateLimit - (apiKey.usageCount % apiKey.rateLimit);
  return { allowed: true, remaining };
}

/**
 * Get all API keys for an organization
 */
export function getApiKeysByOrganization(organizationId: string): ApiKey[] {
  return Array.from(apiKeys.values()).filter(
    key => key.organizationId === organizationId
  );
}

/**
 * Revoke an API key
 */
export function revokeApiKey(key: string): boolean {
  const apiKey = apiKeys.get(key);
  if (apiKey) {
    apiKey.isActive = false;
    return true;
  }
  return false;
}

/**
 * Delete an API key
 */
export function deleteApiKey(key: string): boolean {
  return apiKeys.delete(key);
}

/**
 * Get API key by ID
 */
export function getApiKeyById(id: string): ApiKey | undefined {
  return Array.from(apiKeys.values()).find(key => key.id === id);
}
