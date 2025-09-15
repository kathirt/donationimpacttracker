/**
 * Simple Test Data Generator - Ready to Run
 * This generates realistic donation data that you can immediately use to test your app
 */

const fs = require('fs');
const path = require('path');

// Simple data generation without external dependencies
class SimpleDataGenerator {
  constructor() {
    this.campaigns = [
      'School Lunch Program',
      'Digital Learning Initiative', 
      'Clean Water Access',
      'Medical Equipment Fund',
      'Scholarship Program',
      'Library Development',
      'Teacher Training',
      'Emergency Relief',
      'Environmental Conservation',
      'Community Development'
    ];

    this.regions = [
      'North America',
      'Europe', 
      'Asia',
      'Africa',
      'South America',
      'Oceania'
    ];

    this.impactTypes = [
      'meals_served',
      'books_distributed',
      'students_supported',
      'scholarships_provided',
      'trees_planted'
    ];

    this.firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Maria'];
    this.lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    this.organizations = ['Foundation', 'Trust', 'Corporation', 'NGO', 'Institute', 'Group', 'Society', 'Alliance'];
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateName() {
    if (Math.random() < 0.7) {
      // 70% individual donors
      return `${this.randomChoice(this.firstNames)} ${this.randomChoice(this.lastNames)}`;
    } else {
      // 30% organizations
      return `${this.randomChoice(this.lastNames)} ${this.randomChoice(this.organizations)}`;
    }
  }

  generateDate() {
    const start = new Date('2023-01-01');
    const end = new Date();
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString().split('T')[0];
  }

  generateAmount() {
    const random = Math.random();
    
    if (random < 0.6) {
      // 60% small donations ($10-$100)
      return this.randomFloat(10, 100);
    } else if (random < 0.85) {
      // 25% medium donations ($100-$500)
      return this.randomFloat(100, 500);
    } else if (random < 0.95) {
      // 10% large donations ($500-$2000)
      return this.randomFloat(500, 2000);
    } else {
      // 5% major donations ($2000-$10000)
      return this.randomFloat(2000, 10000);
    }
  }

  getRegionCoordinates(region) {
    const regionBounds = {
      'North America': { lat: [25, 70], lng: [-160, -50] },
      'Europe': { lat: [35, 70], lng: [-10, 40] },
      'Asia': { lat: [-10, 70], lng: [60, 180] },
      'Africa': { lat: [-35, 35], lng: [-20, 50] },
      'South America': { lat: [-55, 12], lng: [-80, -35] },
      'Oceania': { lat: [-50, -10], lng: [110, 180] }
    };

    const bounds = regionBounds[region] || regionBounds['North America'];
    
    return {
      latitude: Math.round((Math.random() * (bounds.lat[1] - bounds.lat[0]) + bounds.lat[0]) * 10000) / 10000,
      longitude: Math.round((Math.random() * (bounds.lng[1] - bounds.lng[0]) + bounds.lng[0]) * 10000) / 10000
    };
  }

  generateDonations(count) {
    const donations = [];
    const donorCount = Math.max(Math.floor(count / 3), 100);
    
    for (let i = 0; i < count; i++) {
      const donorId = `donor-${String(this.random(1, donorCount)).padStart(4, '0')}`;
      const region = this.randomChoice(this.regions);
      const campaign = this.randomChoice(this.campaigns);
      const coordinates = this.getRegionCoordinates(region);
      
      donations.push({
        id: `don-${String(i).padStart(6, '0')}`,
        donorId,
        donorName: this.generateName(),
        amount: this.generateAmount(),
        date: this.generateDate(),
        campaign,
        region,
        coordinates
      });
    }
    
    // Sort by date (newest first)
    return donations.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  generateImpactMetrics(donations) {
    const impacts = [];
    
    donations.forEach((donation, index) => {
      const impactCount = this.random(1, 3);
      
      for (let i = 0; i < impactCount; i++) {
        const impactType = this.randomChoice(this.impactTypes);
        const value = this.generateImpactValue(donation.amount, impactType);
        
        impacts.push({
          id: `imp-${String(index).padStart(6, '0')}-${i}`,
          donationId: donation.id,
          type: impactType,
          value,
          description: this.generateImpactDescription(impactType, value),
          region: donation.region,
          coordinates: donation.coordinates,
          date: donation.date
        });
      }
    });
    
    return impacts;
  }

  generateImpactValue(donationAmount, impactType) {
    const conversionRates = {
      'meals_served': 3,
      'books_distributed': 0.2,
      'students_supported': 0.1,
      'scholarships_provided': 0.001,
      'trees_planted': 2
    };

    const rate = conversionRates[impactType] || 1;
    const baseValue = donationAmount * rate;
    const variance = this.randomFloat(0.8, 1.2);
    
    return Math.max(1, Math.round(baseValue * variance));
  }

  generateImpactDescription(type, value) {
    const descriptions = {
      'meals_served': `${value} nutritious meals served to children in need`,
      'books_distributed': `${value} educational books distributed to students`,
      'students_supported': `${value} students provided with educational support`,
      'scholarships_provided': `${value} scholarship${value !== 1 ? 's' : ''} awarded to deserving students`,
      'trees_planted': `${value} trees planted for environmental conservation`
    };

    return descriptions[type] || `${value} units of impact delivered`;
  }
}

// Generate and export data
function main() {
  console.log('🚀 Generating realistic test data for Donation Impact Tracker...\n');

  const generator = new SimpleDataGenerator();
  
  // Generate different dataset sizes
  const datasets = {
    small: 100,
    medium: 1000,
    large: 5000
  };

  Object.entries(datasets).forEach(([size, count]) => {
    console.log(`📊 Generating ${size} dataset (${count} donations)...`);
    
    const donations = generator.generateDonations(count);
    const impacts = generator.generateImpactMetrics(donations);
    
    // Create output directory
    const outputDir = `./test-data/${size}`;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save JSON files
    fs.writeFileSync(
      path.join(outputDir, 'donations.json'),
      JSON.stringify(donations, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'impact-metrics.json'),
      JSON.stringify(impacts, null, 2)
    );
    
    // Save CSV files
    const donationCSV = [
      'id,donorId,donorName,amount,date,campaign,region,latitude,longitude',
      ...donations.map(d => 
        `${d.id},${d.donorId},"${d.donorName}",${d.amount},${d.date},"${d.campaign}",${d.region},${d.coordinates.latitude},${d.coordinates.longitude}`
      )
    ].join('\n');
    
    fs.writeFileSync(path.join(outputDir, 'donations.csv'), donationCSV);
    
    // Generate statistics
    const stats = {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      averageDonation: donations.reduce((sum, d) => sum + d.amount, 0) / donations.length,
      dateRange: {
        earliest: donations[donations.length - 1]?.date,
        latest: donations[0]?.date
      },
      campaignBreakdown: {},
      regionBreakdown: {},
      impactSummary: {}
    };
    
    // Calculate breakdowns
    donations.forEach(d => {
      stats.campaignBreakdown[d.campaign] = (stats.campaignBreakdown[d.campaign] || 0) + 1;
      stats.regionBreakdown[d.region] = (stats.regionBreakdown[d.region] || 0) + 1;
    });
    
    impacts.forEach(i => {
      if (!stats.impactSummary[i.type]) {
        stats.impactSummary[i.type] = { count: 0, total: 0 };
      }
      stats.impactSummary[i.type].count++;
      stats.impactSummary[i.type].total += i.value;
    });
    
    fs.writeFileSync(
      path.join(outputDir, 'statistics.json'),
      JSON.stringify(stats, null, 2)
    );
    
    console.log(`✅ ${size} dataset complete: ${donations.length} donations, ${impacts.length} impacts`);
    console.log(`   Total amount: $${stats.totalAmount.toLocaleString()}`);
    console.log(`   Average: $${Math.round(stats.averageDonation)}`);
    console.log(`   Date range: ${stats.dateRange.earliest} to ${stats.dateRange.latest}\n`);
  });
  
  // Generate a quick start file for immediate testing
  const quickStart = generator.generateDonations(50);
  const quickImpacts = generator.generateImpactMetrics(quickStart);
  
  // Create a JavaScript module that can be imported directly
  const moduleContent = `// Quick start data for immediate testing
export const mockDonations = ${JSON.stringify(quickStart, null, 2)};

export const mockImpactMetrics = ${JSON.stringify(quickImpacts, null, 2)};

// Helper functions
export const getDonationsByRegion = (region) => {
  if (!region) return mockDonations;
  return mockDonations.filter(donation => donation.region === region);
};

export const getDonationsByCampaign = (campaign) => {
  if (!campaign) return mockDonations;
  return mockDonations.filter(donation => donation.campaign === campaign);
};

export const getTotalRaised = () => {
  return mockDonations.reduce((sum, donation) => sum + donation.amount, 0);
};

export const getImpactSummary = () => {
  const summary = {};
  mockImpactMetrics.forEach(metric => {
    if (!summary[metric.type]) {
      summary[metric.type] = { total: 0, count: 0 };
    }
    summary[metric.type].total += metric.value;
    summary[metric.type].count += 1;
  });
  return summary;
};

console.log('✅ Quick start data loaded: ' + mockDonations.length + ' donations');
`;
  
  fs.writeFileSync('./test-data/quick-start-data.js', moduleContent);
  
  console.log('🎉 All test data generated successfully!');
  console.log('\n📁 Generated files:');
  console.log('   ./test-data/small/     - 100 donations (for quick testing)');
  console.log('   ./test-data/medium/    - 1,000 donations (for standard testing)');
  console.log('   ./test-data/large/     - 5,000 donations (for performance testing)');
  console.log('   ./test-data/quick-start-data.js - Ready-to-import module');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Replace src/data/mockData.ts with generated data');
  console.log('2. Update your Azure Functions to use real database');
  console.log('3. Test with different dataset sizes');
  console.log('4. Import CSV files into your database for production testing');
}

if (require.main === module) {
  main();
}

module.exports = { SimpleDataGenerator };