#!/usr/bin/env node

/**
 * NCCS Data Transformer
 * Converts NCCS IRS 990 data to Donation Impact Tracker schema
 * 
 * Transforms:
 * - Nonprofit organizations → Campaigns
 * - Revenue data → Donation transactions  
 * - Geographic data → Coordinates for mapping
 * - Mission statements → Campaign descriptions
 * - Financial data → Impact metrics
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Donation Impact Tracker Interfaces
interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  campaign: string;
  location: {
    country: string;
    region: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  type: 'individual' | 'corporate' | 'foundation' | 'government';
  recurring: boolean;
  anonymous: boolean;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  category: string;
  location: {
    country: string;
    region: string;
    coordinates: [number, number];
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  beneficiaries: number;
  impactMetrics: {
    peopleHelped: number;
    projectsCompleted: number;
    resourcesDistributed: number;
  };
}

interface ImpactLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  totalDonations: number;
  activeCampaigns: number;
  beneficiaries: number;
  impactScore: number;
}

// NCCS Data Interfaces
interface NCCSOrganization {
  EIN: string;
  ORGANIZATION_NAME: string;
  TAX_YEAR: number;
  TOTAL_REVENUE: number;
  TOTAL_EXPENSES: number;
  TOTAL_ASSETS: number;
  ADDRESS_LINE_1?: string;
  CITY?: string;
  STATE?: string;
  ZIP_CODE?: string;
  MISSION_DESCRIPTION?: string;
  PROGRAM_SERVICE_REVENUE?: number;
  CONTRIBUTIONS_GRANTS?: number;
  INVESTMENT_INCOME?: number;
}

interface TransformedData {
  donations: Donation[];
  campaigns: Campaign[];
  impactLocations: ImpactLocation[];
  metadata: {
    generatedAt: string;
    sourceDataset: string;
    recordCount: number;
    totalDonations: number;
    totalCampaigns: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

class NCCSDataTransformer {
  private readonly stateCoordinates: { [key: string]: [number, number] } = {
    'AL': [-86.79113, 32.377716], 'AK': [-152.404419, 61.270716], 'AZ': [-111.431221, 33.729759],
    'AR': [-92.373123, 34.969704], 'CA': [-119.681564, 36.116203], 'CO': [-105.311104, 39.059811],
    'CT': [-72.755371, 41.767], 'DE': [-75.507141, 39.161921], 'FL': [-81.686783, 27.670959],
    'GA': [-83.441162, 32.157435], 'HI': [-157.826182, 21.30895], 'ID': [-114.478828, 44.240459],
    'IL': [-89.094704, 40.19088], 'IN': [-86.148003, 39.790942], 'IA': [-93.620866, 42.032974],
    'KS': [-98.484246, 38.572954], 'KY': [-84.86311, 37.669789], 'LA': [-91.968041, 31.244823],
    'ME': [-69.765261, 44.323535], 'MD': [-76.501157, 39.045755], 'MA': [-71.530106, 42.230171],
    'MI': [-84.536095, 43.326618], 'MN': [-93.094635, 45.739102], 'MS': [-89.734383, 32.741646],
    'MO': [-92.189283, 38.572954], 'MT': [-110.454353, 47.052166], 'NE': [-99.901813, 41.492537],
    'NV': [-117.055374, 38.313515], 'NH': [-71.563896, 43.452492], 'NJ': [-74.521011, 40.298904],
    'NM': [-106.248482, 34.840515], 'NY': [-74.948051, 42.165726], 'NC': [-79.806419, 35.630066],
    'ND': [-99.784012, 47.528912], 'OH': [-82.764915, 40.269789], 'OK': [-96.928917, 35.482309],
    'OR': [-120.767273, 44.572021], 'PA': [-77.209755, 40.269789], 'RI': [-71.51178, 41.82355],
    'SC': [-80.945007, 33.856892], 'SD': [-99.901813, 44.299782], 'TN': [-86.692345, 35.771],
    'TX': [-97.563461, 31.106], 'UT': [-111.892622, 39.419220], 'VT': [-72.710686, 44.0582],
    'VA': [-78.169968, 37.677592], 'WA': [-121.1858, 47.042418], 'WV': [-80.954570, 38.349497],
    'WI': [-89.616508, 44.268543], 'WY': [-107.30249, 42.755966], 'DC': [-77.026817, 38.907192]
  };

  private readonly categoryMapping: { [key: string]: string } = {
    'EDUCATION': 'Education',
    'HEALTH': 'Healthcare',
    'HUMAN SERVICES': 'Social Services',
    'ARTS': 'Arts & Culture',
    'ENVIRONMENT': 'Environment',
    'RELIGION': 'Religion',
    'INTERNATIONAL': 'International Aid',
    'CIVIL RIGHTS': 'Human Rights',
    'COMMUNITY': 'Community Development',
    'RESEARCH': 'Research',
    'DEFAULT': 'General Support'
  };

  private inputFile: string;
  private outputDir: string;

  constructor(inputFile?: string) {
    this.inputFile = inputFile || path.join(__dirname, '..', 'data', 'nccs', 'nccs-combined-data.json');
    this.outputDir = path.join(__dirname, '..', 'data', 'transformed');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Load NCCS data from JSON file
   */
  private loadNCCSData(): { organizations: NCCSOrganization[]; metadata: any } {
    if (!fs.existsSync(this.inputFile)) {
      throw new Error(`NCCS data file not found: ${this.inputFile}`);
    }

    console.log(`Loading NCCS data from: ${this.inputFile}`);
    const content = fs.readFileSync(this.inputFile, 'utf-8');
    const data = JSON.parse(content);
    
    console.log(`Loaded ${data.organizations?.length || 0} organizations`);
    return data;
  }

  /**
   * Generate unique ID based on EIN and year
   */
  private generateId(ein: string, year?: number): string {
    const base = year ? `${ein}-${year}` : ein;
    return crypto.createHash('md5').update(base).digest('hex').substring(0, 12);
  }

  /**
   * Get coordinates for location
   */
  private getCoordinates(state?: string, city?: string): [number, number] {
    if (state && this.stateCoordinates[state.toUpperCase()]) {
      const [baseLng, baseLat] = this.stateCoordinates[state.toUpperCase()];
      // Add small random offset for city-level variation
      const lngOffset = (Math.random() - 0.5) * 2; // ±1 degree
      const latOffset = (Math.random() - 0.5) * 2; // ±1 degree
      return [baseLng + lngOffset, baseLat + latOffset];
    }
    // Default to center of US if no state
    return [-98.5795, 39.8282];
  }

  /**
   * Determine organization category from name and mission
   */
  private categorizeOrganization(name: string, mission?: string): string {
    const text = `${name} ${mission || ''}`.toUpperCase();
    
    if (text.includes('SCHOOL') || text.includes('EDUCATION') || text.includes('UNIVERSITY') || text.includes('COLLEGE')) {
      return this.categoryMapping['EDUCATION'];
    }
    if (text.includes('HEALTH') || text.includes('MEDICAL') || text.includes('HOSPITAL') || text.includes('CLINIC')) {
      return this.categoryMapping['HEALTH'];
    }
    if (text.includes('COMMUNITY') || text.includes('HOUSING') || text.includes('FOOD') || text.includes('SHELTER')) {
      return this.categoryMapping['HUMAN SERVICES'];
    }
    if (text.includes('ART') || text.includes('MUSIC') || text.includes('THEATER') || text.includes('MUSEUM')) {
      return this.categoryMapping['ARTS'];
    }
    if (text.includes('ENVIRONMENT') || text.includes('CONSERVATION') || text.includes('WILDLIFE')) {
      return this.categoryMapping['ENVIRONMENT'];
    }
    if (text.includes('CHURCH') || text.includes('RELIGIOUS') || text.includes('FAITH') || text.includes('MINISTRY')) {
      return this.categoryMapping['RELIGION'];
    }
    if (text.includes('INTERNATIONAL') || text.includes('GLOBAL') || text.includes('WORLD')) {
      return this.categoryMapping['INTERNATIONAL'];
    }
    if (text.includes('CIVIL RIGHTS') || text.includes('HUMAN RIGHTS') || text.includes('JUSTICE')) {
      return this.categoryMapping['CIVIL RIGHTS'];
    }
    if (text.includes('RESEARCH') || text.includes('SCIENCE') || text.includes('TECHNOLOGY')) {
      return this.categoryMapping['RESEARCH'];
    }
    
    return this.categoryMapping['DEFAULT'];
  }

  /**
   * Calculate impact metrics based on revenue and category
   */
  private calculateImpactMetrics(revenue: number, category: string): any {
    const baseMultiplier = Math.max(1, Math.floor(revenue / 100000)); // Scale with revenue
    
    switch (category) {
      case 'Education':
        return {
          peopleHelped: Math.floor(baseMultiplier * (50 + Math.random() * 200)), // Students
          projectsCompleted: Math.floor(baseMultiplier * (2 + Math.random() * 8)), // Programs
          resourcesDistributed: Math.floor(baseMultiplier * (100 + Math.random() * 500)) // Books/materials
        };
      case 'Healthcare':
        return {
          peopleHelped: Math.floor(baseMultiplier * (100 + Math.random() * 400)), // Patients
          projectsCompleted: Math.floor(baseMultiplier * (5 + Math.random() * 15)), // Health programs
          resourcesDistributed: Math.floor(baseMultiplier * (200 + Math.random() * 800)) // Medical supplies
        };
      case 'Social Services':
        return {
          peopleHelped: Math.floor(baseMultiplier * (80 + Math.random() * 320)), // Individuals served
          projectsCompleted: Math.floor(baseMultiplier * (3 + Math.random() * 12)), // Service programs
          resourcesDistributed: Math.floor(baseMultiplier * (150 + Math.random() * 600)) // Food/clothing items
        };
      default:
        return {
          peopleHelped: Math.floor(baseMultiplier * (30 + Math.random() * 120)),
          projectsCompleted: Math.floor(baseMultiplier * (1 + Math.random() * 5)),
          resourcesDistributed: Math.floor(baseMultiplier * (50 + Math.random() * 200))
        };
    }
  }

  /**
   * Transform NCCS organizations to campaigns
   */
  private transformToCampaigns(organizations: NCCSOrganization[]): Campaign[] {
    console.log('Transforming organizations to campaigns...');
    
    return organizations
      .filter(org => org.TOTAL_REVENUE > 50000) // Filter small organizations
      .map(org => {
        const coordinates = this.getCoordinates(org.STATE, org.CITY);
        const category = this.categorizeOrganization(org.ORGANIZATION_NAME, org.MISSION_DESCRIPTION);
        const impactMetrics = this.calculateImpactMetrics(org.TOTAL_REVENUE, category);
        
        // Calculate goal as revenue + 20-50% growth target
        const goalMultiplier = 1.2 + (Math.random() * 0.3);
        const goal = Math.floor(org.TOTAL_REVENUE * goalMultiplier);
        
        return {
          id: this.generateId(org.EIN, org.TAX_YEAR),
          name: org.ORGANIZATION_NAME,
          description: org.MISSION_DESCRIPTION || `Supporting ${category.toLowerCase()} initiatives in the community.`,
          goal: goal,
          raised: org.TOTAL_REVENUE,
          category: category,
          location: {
            country: 'United States',
            region: org.STATE || 'Unknown',
            coordinates: coordinates
          },
          startDate: `${org.TAX_YEAR}-01-01`,
          endDate: `${org.TAX_YEAR}-12-31`,
          status: (org.TOTAL_REVENUE >= goal * 0.9) ? 'completed' : 'active',
          beneficiaries: impactMetrics.peopleHelped,
          impactMetrics: impactMetrics
        } as Campaign;
      });
  }

  /**
   * Generate realistic donation transactions from revenue data
   */
  private generateDonations(organizations: NCCSOrganization[]): Donation[] {
    console.log('Generating donation transactions from revenue data...');
    
    const donations: Donation[] = [];
    const donorNames = [
      'Anonymous Donor', 'Community Foundation', 'Local Business Alliance', 'Individual Supporter',
      'Corporate Partnership', 'Family Foundation', 'Charitable Trust', 'Grant Foundation',
      'Major Donor', 'Monthly Supporter', 'Event Fundraiser', 'Online Campaign'
    ];

    organizations.forEach(org => {
      if (org.CONTRIBUTIONS_GRANTS && org.CONTRIBUTIONS_GRANTS > 1000) {
        // Generate 3-15 donation transactions per organization
        const numDonations = 3 + Math.floor(Math.random() * 12);
        const totalToDistribute = org.CONTRIBUTIONS_GRANTS;
        
        for (let i = 0; i < numDonations; i++) {
          // Pareto distribution - few large donors, many small ones
          const ratio = Math.pow(Math.random(), 2); // Skew toward smaller amounts
          const amount = Math.floor((totalToDistribute / numDonations) * (0.1 + ratio * 3));
          
          if (amount > 100) { // Minimum donation threshold
            const donorType = this.selectDonorType(amount);
            const coordinates = this.getCoordinates(org.STATE, org.CITY);
            
            // Random date within tax year
            const startDate = new Date(`${org.TAX_YEAR}-01-01`);
            const endDate = new Date(`${org.TAX_YEAR}-12-31`);
            const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            
            donations.push({
              id: this.generateId(`${org.EIN}-donation-${i}`, org.TAX_YEAR),
              donorName: donorNames[Math.floor(Math.random() * donorNames.length)],
              amount: amount,
              date: randomDate.toISOString().split('T')[0],
              campaign: this.generateId(org.EIN, org.TAX_YEAR),
              location: {
                country: 'United States',
                region: org.STATE || 'Unknown',
                coordinates: coordinates
              },
              type: donorType,
              recurring: Math.random() < 0.3, // 30% recurring
              anonymous: Math.random() < 0.15 // 15% anonymous
            });
          }
        }
      }
    });

    // Sort by date
    donations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    console.log(`Generated ${donations.length} donation transactions`);
    return donations;
  }

  /**
   * Select donor type based on donation amount
   */
  private selectDonorType(amount: number): 'individual' | 'corporate' | 'foundation' | 'government' {
    if (amount > 100000) {
      // Large donations more likely to be foundation/corporate
      const rand = Math.random();
      if (rand < 0.4) return 'foundation';
      if (rand < 0.7) return 'corporate';
      if (rand < 0.9) return 'government';
      return 'individual';
    } else if (amount > 10000) {
      // Medium donations mix of corporate and individual
      const rand = Math.random();
      if (rand < 0.3) return 'corporate';
      if (rand < 0.5) return 'foundation';
      return 'individual';
    } else {
      // Small donations mostly individual
      return Math.random() < 0.8 ? 'individual' : 'corporate';
    }
  }

  /**
   * Generate impact locations from geographic distribution
   */
  private generateImpactLocations(campaigns: Campaign[], donations: Donation[]): ImpactLocation[] {
    console.log('Generating impact locations...');
    
    const locationMap = new Map<string, {
      campaigns: Campaign[];
      donations: Donation[];
      coordinates: [number, number];
    }>();

    // Group by state
    campaigns.forEach(campaign => {
      const region = campaign.location.region;
      if (!locationMap.has(region)) {
        locationMap.set(region, {
          campaigns: [],
          donations: [],
          coordinates: campaign.location.coordinates
        });
      }
      locationMap.get(region)!.campaigns.push(campaign);
    });

    donations.forEach(donation => {
      const region = donation.location.region;
      if (locationMap.has(region)) {
        locationMap.get(region)!.donations.push(donation);
      }
    });

    return Array.from(locationMap.entries()).map(([region, data]) => {
      const totalDonations = data.donations.reduce((sum, d) => sum + d.amount, 0);
      const beneficiaries = data.campaigns.reduce((sum, c) => sum + c.beneficiaries, 0);
      
      // Calculate impact score based on efficiency (beneficiaries per dollar)
      const impactScore = beneficiaries > 0 && totalDonations > 0 
        ? Math.min(100, Math.floor((beneficiaries / totalDonations) * 100000))
        : 0;

      return {
        id: this.generateId(`location-${region}`),
        name: region,
        coordinates: data.coordinates,
        totalDonations: totalDonations,
        activeCampaigns: data.campaigns.filter(c => c.status === 'active').length,
        beneficiaries: beneficiaries,
        impactScore: impactScore
      };
    }).filter(loc => loc.totalDonations > 0)
      .sort((a, b) => b.totalDonations - a.totalDonations);
  }

  /**
   * Transform NCCS data to Donation Impact Tracker format
   */
  public async transform(): Promise<TransformedData> {
    console.log('Starting NCCS data transformation...\n');
    
    // Load source data
    const nccsData = this.loadNCCSData();
    const organizations = nccsData.organizations.slice(0, 1000); // Limit for testing
    
    console.log(`Processing ${organizations.length} organizations`);
    
    // Transform data
    const campaigns = this.transformToCampaigns(organizations);
    const donations = this.generateDonations(organizations);
    const impactLocations = this.generateImpactLocations(campaigns, donations);
    
    // Calculate metadata
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const dates = donations.map(d => d.date).sort();
    
    const transformedData: TransformedData = {
      donations,
      campaigns,
      impactLocations,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceDataset: 'NCCS IRS 990 Efilers',
        recordCount: organizations.length,
        totalDonations: totalDonations,
        totalCampaigns: campaigns.length,
        dateRange: {
          start: dates[0] || '',
          end: dates[dates.length - 1] || ''
        }
      }
    };

    console.log('\n📊 Transformation Summary:');
    console.log(`   Organizations processed: ${organizations.length}`);
    console.log(`   Campaigns created: ${campaigns.length}`);
    console.log(`   Donations generated: ${donations.length}`);
    console.log(`   Impact locations: ${impactLocations.length}`);
    console.log(`   Total donation value: $${totalDonations.toLocaleString()}`);
    
    return transformedData;
  }

  /**
   * Save transformed data to files
   */
  public async saveTransformedData(data: TransformedData): Promise<void> {
    console.log('\nSaving transformed data...');
    
    // Save complete dataset
    const mainFile = path.join(this.outputDir, 'donation-tracker-data.json');
    fs.writeFileSync(mainFile, JSON.stringify(data, null, 2));
    console.log(`✅ Saved complete dataset: ${mainFile}`);
    
    // Save individual data types for API endpoints
    const donationsFile = path.join(this.outputDir, 'donations.json');
    fs.writeFileSync(donationsFile, JSON.stringify(data.donations, null, 2));
    console.log(`✅ Saved donations: ${donationsFile}`);
    
    const campaignsFile = path.join(this.outputDir, 'campaigns.json');
    fs.writeFileSync(campaignsFile, JSON.stringify(data.campaigns, null, 2));
    console.log(`✅ Saved campaigns: ${campaignsFile}`);
    
    const impactFile = path.join(this.outputDir, 'impact-locations.json');
    fs.writeFileSync(impactFile, JSON.stringify(data.impactLocations, null, 2));
    console.log(`✅ Saved impact locations: ${impactFile}`);
    
    // Save metadata and statistics
    const statsFile = path.join(this.outputDir, 'transformation-stats.json');
    const stats = {
      ...data.metadata,
      statistics: {
        averageDonation: data.donations.length > 0 ? data.totalDonations / data.donations.length : 0,
        averageCampaignGoal: data.campaigns.length > 0 ? 
          data.campaigns.reduce((sum, c) => sum + c.goal, 0) / data.campaigns.length : 0,
        completionRate: data.campaigns.length > 0 ?
          data.campaigns.filter(c => c.status === 'completed').length / data.campaigns.length : 0,
        topCategories: this.getTopCategories(data.campaigns),
        topStates: this.getTopStates(data.impactLocations),
        donorTypeDistribution: this.getDonorTypeStats(data.donations)
      }
    };
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
    console.log(`✅ Saved statistics: ${statsFile}`);
    
    console.log(`\n📁 All files saved to: ${this.outputDir}`);
  }

  /**
   * Get top categories by campaign count
   */
  private getTopCategories(campaigns: Campaign[]): { [key: string]: number } {
    const categories: { [key: string]: number } = {};
    campaigns.forEach(campaign => {
      categories[campaign.category] = (categories[campaign.category] || 0) + 1;
    });
    return Object.fromEntries(
      Object.entries(categories).sort(([,a], [,b]) => b - a).slice(0, 10)
    );
  }

  /**
   * Get top states by total donations
   */
  private getTopStates(locations: ImpactLocation[]): { [key: string]: number } {
    return Object.fromEntries(
      locations.slice(0, 10).map(loc => [loc.name, loc.totalDonations])
    );
  }

  /**
   * Get donor type distribution
   */
  private getDonorTypeStats(donations: Donation[]): { [key: string]: number } {
    const types: { [key: string]: number } = {};
    donations.forEach(donation => {
      types[donation.type] = (types[donation.type] || 0) + 1;
    });
    return types;
  }

  /**
   * Main execution function
   */
  public async run(): Promise<void> {
    try {
      console.log('NCCS Data Transformer - Starting...\n');
      
      // Transform data
      const transformedData = await this.transform();
      
      // Save results
      await this.saveTransformedData(transformedData);
      
      console.log('\n✅ Data transformation completed successfully!');
      console.log('🚀 Ready for integration with Donation Impact Tracker');
      console.log('\nNext steps:');
      console.log('1. Update Azure Functions to serve this data');
      console.log('2. Modify React components to use real data');
      console.log('3. Test application with transformed dataset');
      
    } catch (error) {
      console.error('❌ Error during transformation:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const transformer = new NCCSDataTransformer();
  transformer.run();
}

export { NCCSDataTransformer, TransformedData };