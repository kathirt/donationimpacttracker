# NCCS Data Fetcher Usage Guide

## Overview

The NCCS Data Fetcher downloads real nonprofit organization data from the National Center for Charitable Statistics (NCCS) IRS 990 Efilers dataset. This replaces mock data in the Donation Impact Tracker with actual nonprofit financial information.

## Data Sources

The fetcher downloads data from these key IRS 990 tables:

- **F9-P00-T00-HEADER**: Organization info (EIN, name, address, tax year)
- **F9-P01-T00-SUMMARY**: Financial summary (total revenue, expenses, assets)
- **F9-P08-T00-REVENUE**: Revenue breakdown (donations, grants, program revenue)
- **F9-P03-T00-MISSION**: Mission statements and program descriptions

## Quick Start

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Fetch NCCS Data

```bash
npm run fetch-nccs
```

This will:
- Download CSV files for years 2021-2023
- Parse and combine data from all tables
- Generate unified JSON dataset
- Create summary statistics

### 3. Output Files

The script creates these files in `scripts/data/nccs/`:

- **Raw CSV files**: `F9-P00-T00-HEADER-2023.csv`, etc.
- **nccs-combined-data.json**: Unified dataset with all organizations
- **nccs-data-summary.json**: Statistics and insights

## Configuration

Edit the fetcher configuration in `nccs-data-fetcher.ts`:

```typescript
this.config = {
  baseUrl: 'https://nccs-efile.s3.us-east-1.amazonaws.com/public/v2025',
  outputDir: path.join(__dirname, '..', 'data', 'nccs'),
  targetYears: [2023, 2022, 2021], // Adjust years as needed
  maxRecords: 10000, // Remove limit for full dataset
  tables: {
    // Table configurations
  }
};
```

### Key Settings

- **targetYears**: Which tax years to download (default: 2021-2023)
- **maxRecords**: Limit records per table for testing (remove for full dataset)
- **outputDir**: Where to save downloaded files

## Data Structure

The combined dataset contains organizations with these fields:

```typescript
interface OrganizationData {
  EIN: string;                    // Employer Identification Number
  ORGANIZATION_NAME: string;      // Organization name
  TAX_YEAR: number;              // Tax year
  TOTAL_REVENUE: number;         // Total revenue
  TOTAL_EXPENSES: number;        // Total expenses  
  TOTAL_ASSETS: number;          // Total assets
  ADDRESS_LINE_1?: string;       // Street address
  CITY?: string;                 // City
  STATE?: string;                // State code
  ZIP_CODE?: string;             // ZIP code
  MISSION_DESCRIPTION?: string;   // Mission statement
  PROGRAM_SERVICE_REVENUE?: number;      // Program revenue
  CONTRIBUTIONS_GRANTS?: number;         // Donations/grants
  INVESTMENT_INCOME?: number;            // Investment income
}
```

## Usage Examples

### Basic Fetch

```bash
# Download data with default settings
npm run fetch-nccs
```

### Custom Years

Modify `targetYears` in the script:

```typescript
targetYears: [2023, 2022, 2021, 2020, 2019]
```

### Full Dataset

Remove the record limit:

```typescript
maxRecords: undefined // Download complete dataset
```

### Build TypeScript

```bash
npm run build-nccs
node dist/nccs-data-fetcher.js
```

## Integration with Donation Tracker

Once data is fetched, you can:

1. **Transform data format** to match the app schema
2. **Update API endpoints** to serve NCCS data
3. **Replace mock data** in frontend components
4. **Test with real data** in the application

## Data Quality

The fetcher includes built-in data validation:

- Filters organizations with names and revenue > 0
- Converts numeric fields properly
- Handles CSV parsing with quoted fields
- Combines data across multiple tables by EIN

## Performance Notes

- **Download time**: ~2-5 minutes for 3 years of data
- **File sizes**: ~100-500MB per table per year
- **Memory usage**: Processes data in chunks for efficiency
- **Rate limiting**: Includes 1-second delays between downloads

## Troubleshooting

### Download Failures

If downloads fail:
1. Check internet connection
2. Verify NCCS server availability
3. Files are skipped if they already exist
4. Delete partial files and retry

### Memory Issues

For large datasets:
1. Increase Node.js memory: `node --max-old-space-size=4096`
2. Process years separately
3. Use streaming for very large files

### TypeScript Errors

```bash
npm run build-nccs
# Fix any compilation errors before running
```

## Data Sources & Attribution

- **Source**: National Center for Charitable Statistics (NCCS)
- **Dataset**: IRS 990 Efilers Electronic Filing Database
- **URL**: https://nccs.urban.org/nccs/catalogs/catalog-efile-v2.html
- **Coverage**: Tax years 2009-2023 (availability varies)
- **Update frequency**: Updated monthly by IRS/NCCS

## Next Steps

After fetching NCCS data:

1. **Data Transformation**: Convert to Donation Tracker schema
2. **Geographic Mapping**: Add latitude/longitude coordinates
3. **API Integration**: Update Azure Functions endpoints
4. **Frontend Updates**: Modify React components
5. **Testing**: Validate with real data in full application

## Support

For issues with the NCCS Data Fetcher:

1. Check the console output for error details
2. Verify file permissions in the output directory
3. Ensure all dependencies are installed
4. Review the generated summary file for data quality insights