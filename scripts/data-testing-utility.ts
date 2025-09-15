/**
 * Data Import and Testing Utilities
 * This script helps you test the Donation Impact Tracker with real data
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { faker } from '@faker-js/faker';

interface DonationRecord {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  date: string;
  campaign: string;
  region: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ImpactRecord {
  id: string;
  donationId: string;
  type: string;
  value: number;
  description: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string;
}

class DataGenerator {
  private campaigns = [
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

  private regions = [
    'North America',
    'Europe', 
    'Asia',
    'Africa',
    'South America',
    'Oceania'
  ];

  private impactTypes = [
    'meals_served',
    'books_distributed',
    'students_supported',
    'scholarships_provided',
    'trees_planted',
    'water_wells_built',
    'medical_treatments',
    'families_housed'
  ];

  /**
   * Generate realistic donation data
   */
  generateDonations(count: number): DonationRecord[] {
    const donations: DonationRecord[] = [];
    const donorCount = Math.max(Math.floor(count / 3), 100); // Realistic donor-to-donation ratio
    
    for (let i = 0; i < count; i++) {
      const donorId = `donor-${faker.number.int({ min: 1, max: donorCount }).toString().padStart(4, '0')}`;
      const region = faker.helpers.arrayElement(this.regions);
      const campaign = faker.helpers.arrayElement(this.campaigns);
      
      // Generate realistic coordinates based on region
      const coordinates = this.getRegionCoordinates(region);
      
      donations.push({
        id: `don-${i.toString().padStart(6, '0')}`,
        donorId,
        donorName: faker.person.fullName(),
        amount: this.generateRealisticAmount(),
        date: faker.date.between({ 
          from: '2023-01-01', 
          to: new Date() 
        }).toISOString().split('T')[0],
        campaign,
        region,
        coordinates
      });
    }
    
    return donations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Generate impact metrics based on donations
   */
  generateImpactMetrics(donations: DonationRecord[]): ImpactRecord[] {
    const impacts: ImpactRecord[] = [];
    
    donations.forEach((donation, index) => {
      // Generate 1-3 impact metrics per donation
      const impactCount = faker.number.int({ min: 1, max: 3 });
      
      for (let i = 0; i < impactCount; i++) {
        const impactType = faker.helpers.arrayElement(this.impactTypes);
        const value = this.generateImpactValue(donation.amount, impactType);
        
        impacts.push({
          id: `imp-${index.toString().padStart(6, '0')}-${i}`,
          donationId: donation.id,
          type: impactType,
          value,
          description: this.generateImpactDescription(impactType, value),
          region: donation.region,
          coordinates: donation.coordinates || { latitude: 0, longitude: 0 },
          date: donation.date
        });
      }
    });
    
    return impacts;
  }

  /**
   * Generate realistic donation amounts following Pareto distribution
   */
  private generateRealisticAmount(): number {
    const random = Math.random();
    
    if (random < 0.6) {
      // 60% small donations ($10-$100)
      return faker.number.float({ min: 10, max: 100, precision: 0.01 });
    } else if (random < 0.85) {
      // 25% medium donations ($100-$500)
      return faker.number.float({ min: 100, max: 500, precision: 0.01 });
    } else if (random < 0.95) {
      // 10% large donations ($500-$2000)
      return faker.number.float({ min: 500, max: 2000, precision: 0.01 });
    } else {
      // 5% major donations ($2000-$10000)
      return faker.number.float({ min: 2000, max: 10000, precision: 0.01 });
    }
  }

  /**
   * Get realistic coordinates for a region
   */
  private getRegionCoordinates(region: string): { latitude: number; longitude: number } {
    const regionBounds: Record<string, { lat: [number, number]; lng: [number, number] }> = {
      'North America': { lat: [25, 70], lng: [-160, -50] },
      'Europe': { lat: [35, 70], lng: [-10, 40] },
      'Asia': { lat: [-10, 70], lng: [60, 180] },
      'Africa': { lat: [-35, 35], lng: [-20, 50] },
      'South America': { lat: [-55, 12], lng: [-80, -35] },
      'Oceania': { lat: [-50, -10], lng: [110, 180] }
    };

    const bounds = regionBounds[region] || regionBounds['North America'];
    
    return {
      latitude: faker.number.float({ 
        min: bounds.lat[0], 
        max: bounds.lat[1], 
        precision: 0.0001 
      }),
      longitude: faker.number.float({ 
        min: bounds.lng[0], 
        max: bounds.lng[1], 
        precision: 0.0001 
      })
    };
  }

  /**
   * Generate impact value based on donation amount and type
   */
  private generateImpactValue(donationAmount: number, impactType: string): number {
    const conversionRates: Record<string, number> = {
      'meals_served': 3,        // $1 = 3 meals
      'books_distributed': 0.2,  // $1 = 0.2 books
      'students_supported': 0.1, // $1 = 0.1 students
      'scholarships_provided': 0.001, // $1 = 0.001 scholarships
      'trees_planted': 2,       // $1 = 2 trees
      'water_wells_built': 0.0001, // $1 = 0.0001 wells
      'medical_treatments': 0.5, // $1 = 0.5 treatments
      'families_housed': 0.01   // $1 = 0.01 families
    };

    const rate = conversionRates[impactType] || 1;
    const baseValue = donationAmount * rate;
    
    // Add some variance (±20%)
    const variance = faker.number.float({ min: 0.8, max: 1.2 });
    return Math.max(1, Math.round(baseValue * variance));
  }

  /**
   * Generate descriptive impact text
   */
  private generateImpactDescription(type: string, value: number): string {
    const descriptions: Record<string, string> = {
      'meals_served': `${value} nutritious meals served to children in need`,
      'books_distributed': `${value} educational books distributed to students`,
      'students_supported': `${value} students provided with educational support`,
      'scholarships_provided': `${value} scholarship${value !== 1 ? 's' : ''} awarded to deserving students`,
      'trees_planted': `${value} trees planted for environmental conservation`,
      'water_wells_built': `${value} water well${value !== 1 ? 's' : ''} constructed for clean water access`,
      'medical_treatments': `${value} medical treatment${value !== 1 ? 's' : ''} provided to patients`,
      'families_housed': `${value} famil${value !== 1 ? 'ies' : 'y'} provided with safe housing`
    };

    return descriptions[type] || `${value} units of impact delivered`;
  }
}

class DataImporter {
  private apiBaseUrl: string;

  constructor(apiUrl: string = 'http://localhost:7071/api') {
    this.apiBaseUrl = apiUrl;
  }

  /**
   * Import CSV file and convert to JSON
   */
  async importFromCSV(filePath: string): Promise<DonationRecord[]> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const donations: DonationRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const donation: any = {};
        
        headers.forEach((header, index) => {
          donation[header] = values[index];
        });
        
        // Convert and validate
        donations.push({
          id: donation.id || `don-${i.toString().padStart(6, '0')}`,
          donorId: donation.donorId || `donor-${Math.floor(Math.random() * 1000)}`,
          donorName: donation.donorName || 'Anonymous Donor',
          amount: parseFloat(donation.amount) || 0,
          date: donation.date || new Date().toISOString().split('T')[0],
          campaign: donation.campaign || 'General Fund',
          region: donation.region || 'North America',
          coordinates: donation.latitude && donation.longitude ? {
            latitude: parseFloat(donation.latitude),
            longitude: parseFloat(donation.longitude)
          } : undefined
        });
      }
    }
    
    return donations;
  }

  /**
   * Send data to API endpoints for testing
   */
  async testAPIEndpoints(donations: DonationRecord[]): Promise<void> {
    console.log('🧪 Testing API endpoints...');
    
    try {
      // Test batch upload (if supported)
      console.log('📤 Uploading sample donations...');
      const sampleDonations = donations.slice(0, 10);
      
      for (const donation of sampleDonations) {
        try {
          await axios.post(`${this.apiBaseUrl}/donations`, donation);
          console.log(`✅ Uploaded donation ${donation.id}`);
        } catch (error) {
          console.log(`❌ Failed to upload donation ${donation.id}:`, error.message);
        }
      }
      
      // Test retrieval
      console.log('📥 Testing data retrieval...');
      const response = await axios.get(`${this.apiBaseUrl}/donations`);
      console.log(`✅ Retrieved ${response.data.length} donations`);
      
      // Test filtering
      console.log('🔍 Testing filters...');
      const regionResponse = await axios.get(`${this.apiBaseUrl}/donations?region=North America`);
      console.log(`✅ Regional filter returned ${regionResponse.data.length} donations`);
      
    } catch (error) {
      console.error('❌ API testing failed:', error.message);
    }
  }

  /**
   * Validate data quality
   */
  validateData(donations: DonationRecord[]): { valid: number; invalid: any[] } {
    const invalid: any[] = [];
    let valid = 0;
    
    donations.forEach((donation, index) => {
      const issues: string[] = [];
      
      if (!donation.id) issues.push('Missing ID');
      if (!donation.donorName) issues.push('Missing donor name');
      if (!donation.amount || donation.amount <= 0) issues.push('Invalid amount');
      if (!donation.date || isNaN(Date.parse(donation.date))) issues.push('Invalid date');
      if (!donation.campaign) issues.push('Missing campaign');
      if (!donation.region) issues.push('Missing region');
      
      if (issues.length > 0) {
        invalid.push({ index, donation, issues });
      } else {
        valid++;
      }
    });
    
    return { valid, invalid };
  }
}

// Export sample data files
class DataExporter {
  /**
   * Export data to various formats for testing
   */
  static exportToFiles(donations: DonationRecord[], impacts: ImpactRecord[], outputDir: string = './test-data'): void {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Export as JSON
    fs.writeFileSync(
      path.join(outputDir, 'donations.json'),
      JSON.stringify(donations, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'impact-metrics.json'),
      JSON.stringify(impacts, null, 2)
    );

    // Export as CSV
    const donationCSV = [
      'id,donorId,donorName,amount,date,campaign,region,latitude,longitude',
      ...donations.map(d => 
        `${d.id},${d.donorId},"${d.donorName}",${d.amount},${d.date},"${d.campaign}",${d.region},${d.coordinates?.latitude || ''},${d.coordinates?.longitude || ''}`
      )
    ].join('\n');
    
    fs.writeFileSync(path.join(outputDir, 'donations.csv'), donationCSV);

    const impactCSV = [
      'id,donationId,type,value,description,region,latitude,longitude,date',
      ...impacts.map(i => 
        `${i.id},${i.donationId},${i.type},${i.value},"${i.description}",${i.region},${i.coordinates.latitude},${i.coordinates.longitude},${i.date}`
      )
    ].join('\n');
    
    fs.writeFileSync(path.join(outputDir, 'impact-metrics.csv'), impactCSV);

    console.log(`✅ Data exported to ${outputDir}/`);
  }

  /**
   * Generate SQL insert statements
   */
  static generateSQLInserts(donations: DonationRecord[], outputFile: string): void {
    const sqlStatements = [
      '-- Donation Data Insert Statements',
      '-- Generated for testing purposes',
      '',
      ...donations.map(d => 
        `INSERT INTO Donations (Id, DonorId, DonorName, Amount, Date, Campaign, Region, Latitude, Longitude) VALUES ('${d.id}', '${d.donorId}', '${d.donorName.replace(/'/g, "''")}', ${d.amount}, '${d.date}', '${d.campaign.replace(/'/g, "''")}', '${d.region}', ${d.coordinates?.latitude || 'NULL'}, ${d.coordinates?.longitude || 'NULL'});`
      )
    ];
    
    fs.writeFileSync(outputFile, sqlStatements.join('\n'));
    console.log(`✅ SQL statements generated: ${outputFile}`);
  }
}

// Main execution function
async function main() {
  console.log('🚀 Donation Impact Tracker - Data Testing Utility\n');

  const generator = new DataGenerator();
  const importer = new DataImporter();
  
  // Generate test data
  console.log('📊 Generating realistic test data...');
  const donations = generator.generateDonations(1000);
  const impacts = generator.generateImpactMetrics(donations);
  
  console.log(`✅ Generated ${donations.length} donations and ${impacts.length} impact metrics\n`);
  
  // Validate data
  console.log('🔍 Validating data quality...');
  const validation = importer.validateData(donations);
  console.log(`✅ Valid records: ${validation.valid}`);
  console.log(`❌ Invalid records: ${validation.invalid.length}\n`);
  
  if (validation.invalid.length > 0) {
    console.log('Invalid records:', validation.invalid.slice(0, 5));
  }
  
  // Export data
  console.log('💾 Exporting test data...');
  DataExporter.exportToFiles(donations, impacts);
  DataExporter.generateSQLInserts(donations, './test-data/donations.sql');
  
  // Test API endpoints (optional)
  console.log('\n🌐 Testing API endpoints...');
  console.log('Note: Make sure your Azure Functions are running locally (func start)');
  
  try {
    await importer.testAPIEndpoints(donations);
  } catch (error) {
    console.log('ℹ️  API testing skipped - functions may not be running locally');
  }
  
  console.log('\n✨ Data testing utility completed!');
  console.log('📁 Check the ./test-data/ folder for generated files');
  console.log('🔗 You can now import this data into your database or API');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { DataGenerator, DataImporter, DataExporter };