/**
 * Example: Using the Donation Impact Tracker API
 * 
 * This file demonstrates how to interact with the API endpoints
 * for common use cases.
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://your-app.azurewebsites.net/api';
const API_KEY = 'demo_key_12345678901234567890123456789012'; // Demo key for testing

// Create API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Example 1: Get all donations
async function getAllDonations() {
  try {
    const response = await apiClient.get('/donations');
    console.log('Total donations:', response.data.length);
    console.log('First donation:', response.data[0]);
  } catch (error) {
    console.error('Error fetching donations:', error.response?.data || error.message);
  }
}

// Example 2: Get donations by region
async function getDonationsByRegion(region) {
  try {
    const response = await apiClient.get('/donations', {
      params: { region }
    });
    console.log(`Donations in ${region}:`, response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Example 3: Create a new donation
async function createDonation(donationData) {
  try {
    const response = await apiClient.post('/donations', donationData);
    console.log('Created donation:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating donation:', error.response?.data || error.message);
  }
}

// Example 4: Get all donors
async function getAllDonors() {
  try {
    const response = await apiClient.get('/donors');
    console.log('Total donors:', response.data.count);
    console.log('Donors:', response.data.donors);
  } catch (error) {
    console.error('Error fetching donors:', error.response?.data || error.message);
  }
}

// Example 5: Get a specific donor
async function getDonorById(donorId) {
  try {
    const response = await apiClient.get(`/donors/${donorId}`);
    console.log('Donor details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching donor:', error.response?.data || error.message);
  }
}

// Example 6: Get all campaigns
async function getAllCampaigns() {
  try {
    const response = await apiClient.get('/campaigns');
    console.log('Active campaigns:', response.data.count);
    response.data.campaigns.forEach(campaign => {
      console.log(`  - ${campaign.name}: ${campaign.raised}/${campaign.goal}`);
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error.response?.data || error.message);
  }
}

// Example 7: Get impact metrics with aggregation
async function getAggregatedImpact(region) {
  try {
    const response = await apiClient.get('/impact-metrics', {
      params: { 
        region,
        aggregated: 'true'
      }
    });
    console.log('Aggregated impact:', response.data.summary);
    return response.data;
  } catch (error) {
    console.error('Error fetching impact:', error.response?.data || error.message);
  }
}

// Example 8: Get overall impact summary
async function getImpactSummary() {
  try {
    const response = await apiClient.get('/impact-summary');
    console.log('Overall impact:');
    console.log('  Total donations:', response.data.totalDonations);
    console.log('  Total amount:', response.data.totalAmount);
    console.log('  Total beneficiaries:', response.data.totalBeneficiaries);
    console.log('  Impacts by type:', response.data.impactsByType);
  } catch (error) {
    console.error('Error fetching summary:', error.response?.data || error.message);
  }
}

// Example 9: Register a webhook
async function registerWebhook(webhookUrl, events) {
  try {
    const response = await apiClient.post('/webhooks', {
      url: webhookUrl,
      events: events
    });
    console.log('Webhook registered:', response.data);
    console.log('IMPORTANT: Save this secret:', response.data.secret);
    return response.data;
  } catch (error) {
    console.error('Error registering webhook:', error.response?.data || error.message);
  }
}

// Example 10: List webhooks
async function listWebhooks() {
  try {
    const response = await apiClient.get('/webhooks');
    console.log('Registered webhooks:', response.data.count);
    response.data.webhooks.forEach(webhook => {
      console.log(`  - ${webhook.id}: ${webhook.url}`);
      console.log(`    Events: ${webhook.events.join(', ')}`);
    });
  } catch (error) {
    console.error('Error listing webhooks:', error.response?.data || error.message);
  }
}

// Example 11: Complex query - Get donations for a specific campaign in a date range
async function getCampaignDonationsInDateRange(campaign, startDate, endDate) {
  try {
    const response = await apiClient.get('/donations', {
      params: {
        campaign,
        startDate,
        endDate
      }
    });
    console.log(`Donations for "${campaign}" between ${startDate} and ${endDate}:`);
    console.log('  Count:', response.data.length);
    const total = response.data.reduce((sum, d) => sum + d.amount, 0);
    console.log('  Total amount:', total);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Example 12: Error handling with rate limiting
async function handleRateLimiting() {
  try {
    const response = await apiClient.get('/donations');
    
    // Check rate limit headers
    const limit = response.headers['x-ratelimit-limit'];
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];
    
    console.log('Rate limit info:');
    console.log('  Limit:', limit);
    console.log('  Remaining:', remaining);
    console.log('  Resets at:', reset);
    
    if (parseInt(remaining) < 10) {
      console.warn('Warning: Approaching rate limit!');
    }
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded! Please wait before making more requests.');
      const retryAfter = error.response.headers['retry-after'];
      console.log('Retry after:', retryAfter, 'seconds');
    } else {
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

// Run examples (uncomment to test)
// Note: These examples require a running API server

async function runExamples() {
  console.log('=== Donation Impact Tracker API Examples ===\n');
  
  console.log('1. Getting all donations...');
  // await getAllDonations();
  
  console.log('\n2. Getting donations by region...');
  // await getDonationsByRegion('North America');
  
  console.log('\n3. Getting all donors...');
  // await getAllDonors();
  
  console.log('\n4. Getting all campaigns...');
  // await getAllCampaigns();
  
  console.log('\n5. Getting impact summary...');
  // await getImpactSummary();
  
  console.log('\nExamples complete! Uncomment function calls to run against your API.');
}

// Export functions for use in other modules
module.exports = {
  getAllDonations,
  getDonationsByRegion,
  createDonation,
  getAllDonors,
  getDonorById,
  getAllCampaigns,
  getAggregatedImpact,
  getImpactSummary,
  registerWebhook,
  listWebhooks,
  getCampaignDonationsInDateRange,
  handleRateLimiting
};

// Run if executed directly
if (require.main === module) {
  runExamples();
}
