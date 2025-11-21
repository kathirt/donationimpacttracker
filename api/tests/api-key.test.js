/**
 * Simple test suite for API key management
 * Run with: node api-key.test.js
 */

const { 
  generateApiKey, 
  createApiKey, 
  validateApiKey,
  hasPermission,
  checkRateLimit,
  recordUsage
} = require('../utils/apiKeyManager');

// Test 1: Generate API key
console.log('Test 1: Generate API key');
const newKey = generateApiKey();
console.log('✓ Generated key format:', newKey.startsWith('sk_') ? 'PASS' : 'FAIL');
console.log('✓ Key length:', newKey.length > 32 ? 'PASS' : 'FAIL');

// Test 2: Create API key
console.log('\nTest 2: Create API key');
const apiKey = createApiKey(
  'org-test-001',
  'Test Organization',
  'Test API Key',
  ['donations:read', 'donors:read'],
  1000
);
console.log('✓ API key created:', apiKey.id ? 'PASS' : 'FAIL');
console.log('✓ Has correct permissions:', apiKey.permissions.length === 2 ? 'PASS' : 'FAIL');

// Test 3: Validate API key
console.log('\nTest 3: Validate API key');
const validation = validateApiKey(apiKey.key);
console.log('✓ Valid key accepted:', validation.valid ? 'PASS' : 'FAIL');

const invalidValidation = validateApiKey('invalid-key');
console.log('✓ Invalid key rejected:', !invalidValidation.valid ? 'PASS' : 'FAIL');

// Test 4: Check permissions
console.log('\nTest 4: Check permissions');
console.log('✓ Has donations:read:', hasPermission(apiKey, 'donations:read') ? 'PASS' : 'FAIL');
console.log('✓ Does not have donations:write:', !hasPermission(apiKey, 'donations:write') ? 'PASS' : 'FAIL');

// Test 5: Record usage and rate limiting
console.log('\nTest 5: Rate limiting');
recordUsage(apiKey.key);
const rateLimit = checkRateLimit(apiKey.key);
console.log('✓ Rate limit check:', rateLimit.allowed ? 'PASS' : 'FAIL');
console.log('✓ Usage recorded:', apiKey.usageCount === 1 ? 'PASS' : 'FAIL');

// Test 6: Demo API key validation
console.log('\nTest 6: Demo API key');
const demoValidation = validateApiKey('demo_key_12345678901234567890123456789012');
console.log('✓ Demo key is valid:', demoValidation.valid ? 'PASS' : 'FAIL');
console.log('✓ Demo key has permissions:', demoValidation.apiKey?.permissions.length > 0 ? 'PASS' : 'FAIL');

console.log('\n✅ All tests completed!');
