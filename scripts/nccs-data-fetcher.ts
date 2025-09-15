#!/usr/bin/env node

/**
 * NCCS Data Fetcher
 * Downloads and parses IRS 990 Efiler data from National Center for Charitable Statistics
 * 
 * Key Tables:
 * - F9-P00-T00-HEADER: Organization info (EIN, name, address, tax year)
 * - F9-P01-T00-SUMMARY: Financial summary (total revenue, expenses, assets)
 * - F9-P08-T00-REVENUE: Revenue details (donations, grants, program revenue)
 * - F9-P03-T00-MISSION: Mission statements and program descriptions
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { createWriteStream } from 'fs';
import { promisify } from 'util';

interface NCCSConfig {
  baseUrl: string;
  outputDir: string;
  targetYears: number[];
  maxRecords: number;
  tables: {
    [key: string]: {
      name: string;
      description: string;
      fields: string[];
    };
  };
}

interface OrganizationData {
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

class NCCSDataFetcher {
  private config: NCCSConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://nccs-efile.s3.us-east-1.amazonaws.com/public/v2025',
      outputDir: path.join(__dirname, '..', 'data', 'nccs'),
      targetYears: [2023, 2022, 2021], // Most recent years with complete data
      maxRecords: 10000, // Limit for testing, remove for full dataset
      tables: {
        'F9-P00-T00-HEADER': {
          name: 'HEADER',
          description: 'Organization header information',
          fields: ['EIN', 'ORGANIZATION_NAME', 'TAX_YEAR', 'ADDRESS_LINE_1', 'CITY', 'STATE', 'ZIP_CODE']
        },
        'F9-P01-T00-SUMMARY': {
          name: 'SUMMARY', 
          description: 'Financial summary data',
          fields: ['EIN', 'TAX_YEAR', 'TOTAL_REVENUE', 'TOTAL_EXPENSES', 'TOTAL_ASSETS', 'NET_ASSETS']
        },
        'F9-P08-T00-REVENUE': {
          name: 'REVENUE',
          description: 'Revenue breakdown',
          fields: ['EIN', 'TAX_YEAR', 'CONTRIBUTIONS_GRANTS', 'PROGRAM_SERVICE_REVENUE', 'INVESTMENT_INCOME', 'OTHER_REVENUE']
        },
        'F9-P03-T00-MISSION': {
          name: 'MISSION',
          description: 'Mission and program descriptions',
          fields: ['EIN', 'TAX_YEAR', 'MISSION_DESCRIPTION', 'PROGRAM_SERVICE_DESCRIPTION']
        }
      }
    };

    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Download a file from NCCS
   */
  private async downloadFile(url: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Downloading: ${url}`);
      const file = createWriteStream(outputPath);
      
      https.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${path.basename(outputPath)}`);
            resolve();
          });
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      }).on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Delete partial file
        reject(err);
      });
    });
  }

  /**
   * Parse CSV file and return records
   */
  private async parseCSV(filePath: string, maxRecords?: number): Promise<any[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const records: any[] = [];
    
    const recordsToProcess = maxRecords ? Math.min(lines.length - 1, maxRecords) : lines.length - 1;
    
    for (let i = 1; i <= recordsToProcess; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const record: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          // Convert numeric fields
          if (header.includes('REVENUE') || header.includes('ASSETS') || header.includes('EXPENSES') || 
              header.includes('INCOME') || header.includes('GRANTS') || header === 'TAX_YEAR') {
            record[header] = value ? parseFloat(value) || 0 : 0;
          } else {
            record[header] = value || '';
          }
        });
        records.push(record);
      }
    }
    
    return records;
  }

  /**
   * Parse a single CSV line handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Download all required tables for specified years
   */
  public async downloadTables(): Promise<void> {
    console.log('Starting NCCS data download...');
    console.log(`Target years: ${this.config.targetYears.join(', ')}`);
    console.log(`Max records per table: ${this.config.maxRecords}`);
    
    for (const year of this.config.targetYears) {
      console.log(`\n--- Processing year ${year} ---`);
      
      for (const [tableId, tableInfo] of Object.entries(this.config.tables)) {
        try {
          const fileName = `${tableId}-${year}.csv`;
          const url = `${this.config.baseUrl}/${fileName}`;
          const outputPath = path.join(this.config.outputDir, fileName);
          
          // Skip if file already exists
          if (fs.existsSync(outputPath)) {
            console.log(`Skipping ${fileName} (already exists)`);
            continue;
          }
          
          await this.downloadFile(url, outputPath);
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Failed to download ${tableId} for ${year}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
    
    console.log('\nDownload phase completed.');
  }

  /**
   * Combine data from all tables into unified organization records
   */
  public async combineData(): Promise<OrganizationData[]> {
    console.log('\nCombining data from all tables...');
    
    const organizationMap = new Map<string, OrganizationData>();
    
    for (const year of this.config.targetYears) {
      console.log(`Processing year ${year}...`);
      
      // Process each table
      for (const [tableId, tableInfo] of Object.entries(this.config.tables)) {
        const fileName = `${tableId}-${year}.csv`;
        const filePath = path.join(this.config.outputDir, fileName);
        
        if (!fs.existsSync(filePath)) {
          console.log(`Skipping ${fileName} (not found)`);
          continue;
        }
        
        try {
          const records = await this.parseCSV(filePath, this.config.maxRecords);
          console.log(`Parsed ${records.length} records from ${fileName}`);
          
          // Process records based on table type
          for (const record of records) {
            const ein = record.EIN;
            if (!ein) continue;
            
            const key = `${ein}-${year}`;
            
            if (!organizationMap.has(key)) {
              organizationMap.set(key, {
                EIN: ein,
                ORGANIZATION_NAME: '',
                TAX_YEAR: year,
                TOTAL_REVENUE: 0,
                TOTAL_EXPENSES: 0,
                TOTAL_ASSETS: 0
              });
            }
            
            const org = organizationMap.get(key)!;
            
            // Merge data based on table type
            switch (tableId) {
              case 'F9-P00-T00-HEADER':
                org.ORGANIZATION_NAME = record.ORGANIZATION_NAME || org.ORGANIZATION_NAME;
                org.ADDRESS_LINE_1 = record.ADDRESS_LINE_1;
                org.CITY = record.CITY;
                org.STATE = record.STATE;
                org.ZIP_CODE = record.ZIP_CODE;
                break;
                
              case 'F9-P01-T00-SUMMARY':
                org.TOTAL_REVENUE = record.TOTAL_REVENUE || org.TOTAL_REVENUE;
                org.TOTAL_EXPENSES = record.TOTAL_EXPENSES || org.TOTAL_EXPENSES;
                org.TOTAL_ASSETS = record.TOTAL_ASSETS || org.TOTAL_ASSETS;
                break;
                
              case 'F9-P08-T00-REVENUE':
                org.PROGRAM_SERVICE_REVENUE = record.PROGRAM_SERVICE_REVENUE || org.PROGRAM_SERVICE_REVENUE;
                org.CONTRIBUTIONS_GRANTS = record.CONTRIBUTIONS_GRANTS || org.CONTRIBUTIONS_GRANTS;
                org.INVESTMENT_INCOME = record.INVESTMENT_INCOME || org.INVESTMENT_INCOME;
                break;
                
              case 'F9-P03-T00-MISSION':
                org.MISSION_DESCRIPTION = record.MISSION_DESCRIPTION || org.MISSION_DESCRIPTION;
                break;
            }
          }
          
        } catch (error) {
          console.error(`Error processing ${fileName}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
    
    const organizations = Array.from(organizationMap.values())
      .filter(org => org.ORGANIZATION_NAME && org.TOTAL_REVENUE > 0)
      .sort((a, b) => b.TOTAL_REVENUE - a.TOTAL_REVENUE);
    
    console.log(`Combined data for ${organizations.length} organizations`);
    return organizations;
  }

  /**
   * Save combined data to JSON file
   */
  public async saveData(organizations: OrganizationData[]): Promise<void> {
    const outputPath = path.join(this.config.outputDir, 'nccs-combined-data.json');
    
    const metadata = {
      generatedAt: new Date().toISOString(),
      source: 'National Center for Charitable Statistics (NCCS)',
      datasetUrl: 'https://nccs.urban.org/nccs/catalogs/catalog-efile-v2.html',
      years: this.config.targetYears,
      recordCount: organizations.length,
      tables: Object.keys(this.config.tables),
      maxRecordsPerTable: this.config.maxRecords
    };
    
    const output = {
      metadata,
      organizations
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nSaved combined data to: ${outputPath}`);
    console.log(`Total organizations: ${organizations.length}`);
    
    // Save summary statistics
    const summary = this.generateSummary(organizations);
    const summaryPath = path.join(this.config.outputDir, 'nccs-data-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`Saved summary statistics to: ${summaryPath}`);
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(organizations: OrganizationData[]): any {
    const totalRevenue = organizations.reduce((sum, org) => sum + org.TOTAL_REVENUE, 0);
    const totalAssets = organizations.reduce((sum, org) => sum + org.TOTAL_ASSETS, 0);
    
    const revenueRanges = {
      'Under $100K': 0,
      '$100K - $1M': 0,
      '$1M - $10M': 0,
      '$10M - $100M': 0,
      'Over $100M': 0
    };
    
    const stateDistribution: { [key: string]: number } = {};
    
    organizations.forEach(org => {
      // Revenue ranges
      if (org.TOTAL_REVENUE < 100000) revenueRanges['Under $100K']++;
      else if (org.TOTAL_REVENUE < 1000000) revenueRanges['$100K - $1M']++;
      else if (org.TOTAL_REVENUE < 10000000) revenueRanges['$1M - $10M']++;
      else if (org.TOTAL_REVENUE < 100000000) revenueRanges['$10M - $100M']++;
      else revenueRanges['Over $100M']++;
      
      // State distribution
      if (org.STATE) {
        stateDistribution[org.STATE] = (stateDistribution[org.STATE] || 0) + 1;
      }
    });
    
    return {
      totalOrganizations: organizations.length,
      totalRevenue: totalRevenue,
      totalAssets: totalAssets,
      averageRevenue: totalRevenue / organizations.length,
      medianRevenue: this.calculateMedian(organizations.map(org => org.TOTAL_REVENUE)),
      revenueRanges,
      stateDistribution: Object.entries(stateDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [state, count]) => ({ ...obj, [state]: count }), {}),
      topOrganizations: organizations.slice(0, 20).map(org => ({
        name: org.ORGANIZATION_NAME,
        ein: org.EIN,
        revenue: org.TOTAL_REVENUE,
        state: org.STATE
      }))
    };
  }

  /**
   * Calculate median value
   */
  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  /**
   * Main execution function
   */
  public async run(): Promise<void> {
    try {
      console.log('NCCS Data Fetcher - Starting...\n');
      
      // Download tables
      await this.downloadTables();
      
      // Combine and process data
      const organizations = await this.combineData();
      
      // Save results
      await this.saveData(organizations);
      
      console.log('\n✅ NCCS data fetch completed successfully!');
      console.log(`📁 Data saved to: ${this.config.outputDir}`);
      console.log('📊 Files generated:');
      console.log('   - Raw CSV files (by table and year)');
      console.log('   - nccs-combined-data.json (unified dataset)');
      console.log('   - nccs-data-summary.json (statistics)');
      
    } catch (error) {
      console.error('❌ Error during NCCS data fetch:', error);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const fetcher = new NCCSDataFetcher();
  fetcher.run();
}

export { NCCSDataFetcher, OrganizationData };