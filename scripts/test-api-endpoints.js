/**
 * API Testing Script
 * Tests your Azure Functions with realistic donation data
 */

const https = require('https');
const http = require('http');

class APITester {
  constructor(baseUrl = 'https://gentle-plant-05800ca0f.1.azurestaticapps.net/api') {
    this.baseUrl = baseUrl;
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Donation-Tracker-Test/1.0'
        }
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = client.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : null;
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: parsedData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testEndpoint(name, path, method = 'GET', data = null) {
    console.log(`🧪 Testing ${name}...`);
    
    try {
      const response = await this.makeRequest(path, method, data);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`✅ ${name} - Status: ${response.statusCode}`);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`   📊 Returned ${response.data.length} items`);
        } else if (response.data && typeof response.data === 'object') {
          console.log(`   📄 Returned object with keys: ${Object.keys(response.data).join(', ')}`);
        }
        
        return response;
      } else {
        console.log(`❌ ${name} - Status: ${response.statusCode}`);
        console.log(`   Error: ${JSON.stringify(response.data)}`);
        return null;
      }
    } catch (error) {
      console.log(`❌ ${name} - Network Error: ${error.message}`);
      return null;
    }
  }

  async runFullTests() {
    console.log('🚀 Starting API tests for Donation Impact Tracker\n');
    console.log(`🔗 Testing against: ${this.baseUrl}\n`);

    const tests = [
      // Basic endpoints
      { name: 'Get All Donations', path: '/donations' },
      { name: 'Get Impact Summary', path: '/impact-summary' },
      
      // Filtered endpoints
      { name: 'Donations by Region', path: '/donations?region=North America' },
      { name: 'Donations by Campaign', path: '/donations?campaign=School Lunch Program' },
      
      // Date range filtering
      { name: 'Recent Donations', path: '/donations?startDate=2024-01-01' },
      { name: 'Donations Date Range', path: '/donations?startDate=2023-01-01&endDate=2024-01-01' },
    ];

    const results = [];
    
    for (const test of tests) {
      const result = await this.testEndpoint(test.name, test.path);
      results.push({ ...test, success: result !== null, response: result });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test POST endpoints with sample data
    console.log('\n📤 Testing data submission...');
    
    const sampleDonation = {
      donorId: 'test-donor-001',
      donorName: 'Test User',
      amount: 100.00,
      date: new Date().toISOString().split('T')[0],
      campaign: 'API Test Campaign',
      region: 'North America',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    };

    const postResult = await this.testEndpoint(
      'Create Donation',
      '/donations',
      'POST',
      sampleDonation
    );
    
    results.push({
      name: 'Create Donation',
      path: '/donations',
      method: 'POST',
      success: postResult !== null,
      response: postResult
    });

    // Generate test report
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`✅ Successful: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
    console.log(`❌ Failed: ${total - successful}/${total}`);
    
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const method = result.method || 'GET';
      console.log(`${status} ${method} ${result.path} - ${result.name}`);
      
      if (result.response && result.response.data) {
        if (Array.isArray(result.response.data)) {
          console.log(`     📊 Data: ${result.response.data.length} items`);
          
          // Show sample data structure
          if (result.response.data.length > 0) {
            const sample = result.response.data[0];
            console.log(`     🏗️  Structure: ${Object.keys(sample).join(', ')}`);
          }
        } else if (typeof result.response.data === 'object') {
          console.log(`     📄 Data: ${Object.keys(result.response.data).join(', ')}`);
        }
      }
    });

    return results;
  }

  async generateLoadTest(concurrent = 5, totalRequests = 50) {
    console.log(`\n⚡ Load Testing - ${totalRequests} requests with ${concurrent} concurrent`);
    
    const startTime = Date.now();
    const results = [];
    
    const makeTestRequest = async () => {
      try {
        const response = await this.makeRequest('/donations');
        return {
          success: response.statusCode >= 200 && response.statusCode < 300,
          statusCode: response.statusCode,
          duration: Date.now() - requestStart
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          duration: Date.now() - requestStart
        };
      }
    };

    // Execute requests in batches
    for (let i = 0; i < totalRequests; i += concurrent) {
      const batch = [];
      const batchSize = Math.min(concurrent, totalRequests - i);
      
      for (let j = 0; j < batchSize; j++) {
        const requestStart = Date.now();
        batch.push(makeTestRequest());
      }
      
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      
      console.log(`⏳ Completed ${i + batchSize}/${totalRequests} requests`);
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // Calculate statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const averageResponseTime = results
      .filter(r => r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    console.log('\n📈 Load Test Results:');
    console.log('=' .repeat(40));
    console.log(`📊 Total Requests: ${results.length}`);
    console.log(`✅ Successful: ${successful} (${Math.round(successful/results.length*100)}%)`);
    console.log(`❌ Failed: ${failed} (${Math.round(failed/results.length*100)}%)`);
    console.log(`⏱️  Total Time: ${(totalDuration/1000).toFixed(2)}s`);
    console.log(`🚀 Requests/sec: ${(results.length / (totalDuration/1000)).toFixed(2)}`);
    console.log(`⚡ Avg Response: ${averageResponseTime.toFixed(0)}ms`);

    return results;
  }
}

// Data validation testing
async function testDataIntegrity() {
  console.log('\n🔍 Testing Data Integrity...');
  
  const tester = new APITester();
  
  try {
    // Get donations data
    const donationsResponse = await tester.makeRequest('/donations');
    
    if (!donationsResponse || donationsResponse.statusCode !== 200) {
      console.log('❌ Cannot retrieve donations data for validation');
      return;
    }
    
    const donations = donationsResponse.data;
    
    if (!Array.isArray(donations)) {
      console.log('❌ Donations data is not an array');
      return;
    }
    
    console.log(`📊 Validating ${donations.length} donation records...`);
    
    let validRecords = 0;
    const issues = [];
    
    donations.forEach((donation, index) => {
      const recordIssues = [];
      
      // Check required fields
      if (!donation.id) recordIssues.push('Missing ID');
      if (!donation.donorName) recordIssues.push('Missing donor name');
      if (!donation.amount || donation.amount <= 0) recordIssues.push('Invalid amount');
      if (!donation.date) recordIssues.push('Missing date');
      if (!donation.campaign) recordIssues.push('Missing campaign');
      if (!donation.region) recordIssues.push('Missing region');
      
      // Check data types
      if (donation.amount && typeof donation.amount !== 'number') recordIssues.push('Amount is not a number');
      if (donation.date && isNaN(Date.parse(donation.date))) recordIssues.push('Invalid date format');
      
      // Check coordinates if present
      if (donation.coordinates) {
        if (typeof donation.coordinates.latitude !== 'number' || 
            donation.coordinates.latitude < -90 || 
            donation.coordinates.latitude > 90) {
          recordIssues.push('Invalid latitude');
        }
        if (typeof donation.coordinates.longitude !== 'number' || 
            donation.coordinates.longitude < -180 || 
            donation.coordinates.longitude > 180) {
          recordIssues.push('Invalid longitude');
        }
      }
      
      if (recordIssues.length === 0) {
        validRecords++;
      } else {
        issues.push({ index, id: donation.id, issues: recordIssues });
      }
    });
    
    console.log(`✅ Valid records: ${validRecords}/${donations.length} (${Math.round(validRecords/donations.length*100)}%)`);
    
    if (issues.length > 0) {
      console.log(`❌ Found ${issues.length} records with issues:`);
      issues.slice(0, 5).forEach(issue => {
        console.log(`   Record ${issue.index} (${issue.id}): ${issue.issues.join(', ')}`);
      });
      if (issues.length > 5) {
        console.log(`   ... and ${issues.length - 5} more`);
      }
    }
    
    // Calculate statistics
    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const averageAmount = totalAmount / donations.length;
    const campaigns = [...new Set(donations.map(d => d.campaign))];
    const regions = [...new Set(donations.map(d => d.region))];
    
    console.log('\n📈 Data Statistics:');
    console.log(`💰 Total Amount: $${totalAmount.toLocaleString()}`);
    console.log(`📊 Average Donation: $${Math.round(averageAmount)}`);
    console.log(`🎯 Campaigns: ${campaigns.length} (${campaigns.slice(0, 3).join(', ')}${campaigns.length > 3 ? '...' : ''})`);
    console.log(`🌍 Regions: ${regions.length} (${regions.join(', ')})`);
    
  } catch (error) {
    console.log(`❌ Data integrity test failed: ${error.message}`);
  }
}

// Main execution
async function main() {
  console.log('🎯 Donation Impact Tracker - API Testing Suite');
  console.log('=' .repeat(60));
  
  const tester = new APITester();
  
  // Run basic API tests
  await tester.runFullTests();
  
  // Test data integrity
  await testDataIntegrity();
  
  // Optional: Run load test (uncomment to enable)
  // console.log('\n⚡ Starting load test...');
  // await tester.generateLoadTest(3, 20);
  
  console.log('\n🏁 All tests completed!');
  console.log('\n💡 Tips for real data testing:');
  console.log('1. Use the generated CSV files to import into a real database');
  console.log('2. Update your Azure Functions to connect to the database');
  console.log('3. Test with larger datasets for performance validation');
  console.log('4. Monitor API response times under load');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { APITester };