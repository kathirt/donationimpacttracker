# Real Data Integration Guide

## Overview
This guide walks you through integrating real data sources with your Donation Impact Tracker application.

## Database Setup Options

### Option 1: Azure Cosmos DB (Recommended)

#### Setup Steps:
1. Create an Azure Cosmos DB account in your resource group
2. Create containers for donations, impact metrics, donors, and campaigns
3. Update Azure Functions to use Cosmos DB SDK

#### Benefits:
- NoSQL flexibility
- Global distribution
- Automatic scaling
- Serverless billing option
- Strong integration with Azure Functions

### Option 2: Azure SQL Database

#### Setup Steps:
1. Create Azure SQL Database instance
2. Design relational schema
3. Update Azure Functions to use SQL client

#### Benefits:
- Familiar SQL syntax
- ACID compliance
- Strong consistency
- Rich query capabilities

### Option 3: External APIs Integration

#### Common Data Sources:
- Charity Navigator API
- DonorsChoose API
- GlobalGiving API
- Custom CRM/ERP systems

## Implementation Steps

### 1. Database Schema Design

#### Cosmos DB Collections:
```json
// donations collection
{
  "id": "don-001",
  "partitionKey": "2024-01",
  "donorId": "donor-001",
  "donorName": "John Doe",
  "amount": 500,
  "date": "2024-01-15T10:30:00Z",
  "campaign": "School Lunch Program",
  "region": "North America",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "metadata": {
    "source": "website",
    "paymentMethod": "credit_card",
    "currency": "USD"
  }
}

// impact_metrics collection
{
  "id": "imp-001",
  "partitionKey": "2024-01",
  "donationId": "don-001",
  "type": "meals_served",
  "value": 150,
  "description": "150 nutritious meals served",
  "region": "North America",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "date": "2024-01-15T12:00:00Z",
  "verificationStatus": "verified",
  "evidenceUrls": ["photo1.jpg", "report.pdf"]
}
```

#### SQL Schema:
```sql
-- Donors table
CREATE TABLE Donors (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) UNIQUE,
    TotalDonated DECIMAL(10,2) DEFAULT 0,
    DonationCount INT DEFAULT 0,
    JoinDate DATETIME2 DEFAULT GETUTCDATE(),
    LastDonationDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Campaigns table
CREATE TABLE Campaigns (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NTEXT,
    Goal DECIMAL(12,2) NOT NULL,
    Raised DECIMAL(12,2) DEFAULT 0,
    Region NVARCHAR(100),
    StartDate DATE,
    EndDate DATE,
    Status NVARCHAR(20) DEFAULT 'active',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Donations table
CREATE TABLE Donations (
    Id NVARCHAR(50) PRIMARY KEY,
    DonorId NVARCHAR(50) FOREIGN KEY REFERENCES Donors(Id),
    CampaignId NVARCHAR(50) FOREIGN KEY REFERENCES Campaigns(Id),
    Amount DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(3) DEFAULT 'USD',
    Date DATETIME2 NOT NULL,
    PaymentMethod NVARCHAR(50),
    Status NVARCHAR(20) DEFAULT 'completed',
    Latitude DECIMAL(10,8),
    Longitude DECIMAL(11,8),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Impact Metrics table
CREATE TABLE ImpactMetrics (
    Id NVARCHAR(50) PRIMARY KEY,
    DonationId NVARCHAR(50) FOREIGN KEY REFERENCES Donations(Id),
    Type NVARCHAR(50) NOT NULL,
    Value INT NOT NULL,
    Description NTEXT,
    Region NVARCHAR(100),
    Latitude DECIMAL(10,8),
    Longitude DECIMAL(11,8),
    Date DATETIME2 NOT NULL,
    VerificationStatus NVARCHAR(20) DEFAULT 'pending',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### 2. Azure Functions Update

#### Install Database Dependencies:
```bash
cd api
npm install @azure/cosmos
# OR for SQL
npm install mssql
```

#### Environment Variables:
```env
COSMOS_DB_ENDPOINT=https://your-cosmosdb.documents.azure.com:443/
COSMOS_DB_KEY=your-primary-key
COSMOS_DB_DATABASE=DonationTracker
```

### 3. Data Migration Strategy

#### From CSV Files:
```typescript
// scripts/import-csv.ts
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_DB_KEY!
});

async function importCsvData(filePath: string, containerName: string) {
  const database = client.database('DonationTracker');
  const container = database.container(containerName);
  
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (row) => {
      try {
        await container.items.create({
          id: row.id || `${containerName}-${Date.now()}-${Math.random()}`,
          partitionKey: row.partitionKey || new Date().toISOString().substring(0, 7),
          ...row
        });
      } catch (error) {
        console.error('Error importing row:', error);
      }
    });
}
```

#### From External APIs:
```typescript
// scripts/sync-external-data.ts
import axios from 'axios';

async function syncFromCharityAPI() {
  try {
    // Example: DonorsChoose API integration
    const response = await axios.get('https://api.donorschoose.org/common/json_feed.html', {
      params: {
        APIKey: process.env.DONORSCHOOSE_API_KEY,
        max: 100,
        sortBy: 'date_posted'
      }
    });
    
    // Transform and save data
    const projects = response.data.projects.map(project => ({
      id: `dc-${project.id}`,
      campaign: project.title,
      description: project.shortDescription,
      goal: parseFloat(project.totalPrice),
      raised: parseFloat(project.fundingStatus.fundingGoal) - parseFloat(project.fundingStatus.remainingToFund),
      region: `${project.school.state}, ${project.school.city}`,
      coordinates: {
        latitude: parseFloat(project.school.latitude),
        longitude: parseFloat(project.school.longitude)
      }
    }));
    
    // Save to database
    for (const project of projects) {
      await saveCampaign(project);
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}
```

## Testing Scenarios

### 1. Load Testing with Realistic Data Volumes

#### Sample Data Generation:
```typescript
// scripts/generate-test-data.ts
import { faker } from '@faker-js/faker';

function generateTestDonations(count: number) {
  const donations = [];
  const campaigns = ['School Lunch Program', 'Digital Learning', 'Clean Water', 'Medical Aid'];
  const regions = ['North America', 'Europe', 'Asia', 'Africa', 'South America'];
  
  for (let i = 0; i < count; i++) {
    donations.push({
      id: `don-${i.toString().padStart(6, '0')}`,
      donorId: `donor-${faker.number.int({ min: 1, max: 1000 }).toString().padStart(4, '0')}`,
      donorName: faker.person.fullName(),
      amount: faker.number.float({ min: 10, max: 5000, precision: 0.01 }),
      date: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }).toISOString().split('T')[0],
      campaign: faker.helpers.arrayElement(campaigns),
      region: faker.helpers.arrayElement(regions),
      coordinates: {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude()
      }
    });
  }
  
  return donations;
}

// Generate 10,000 test donations
const testData = generateTestDonations(10000);
console.log(JSON.stringify(testData, null, 2));
```

### 2. Real-time Data Streaming

#### Azure Event Hubs Integration:
```typescript
// services/event-hub-client.ts
import { EventHubProducerClient, EventHubConsumerClient } from "@azure/event-hubs";

const connectionString = process.env.EVENT_HUB_CONNECTION_STRING!;
const eventHubName = "donation-events";

export async function publishDonationEvent(donation: any) {
  const producer = new EventHubProducerClient(connectionString, eventHubName);
  
  try {
    const eventDataBatch = await producer.createBatch();
    eventDataBatch.tryAdd({ body: donation });
    await producer.sendBatch(eventDataBatch);
  } finally {
    await producer.close();
  }
}

export async function subscribeToDonationEvents(callback: (event: any) => void) {
  const consumer = new EventHubConsumerClient("$Default", connectionString, eventHubName);
  
  const subscription = consumer.subscribe({
    processEvents: async (events) => {
      for (const event of events) {
        callback(event.body);
      }
    },
    processError: async (err) => {
      console.error("Event processing error:", err);
    }
  });
  
  return subscription;
}
```

### 3. Data Validation and Quality

#### Validation Rules:
```typescript
// utils/data-validation.ts
import Joi from 'joi';

const donationSchema = Joi.object({
  donorId: Joi.string().required(),
  donorName: Joi.string().min(2).max(100).required(),
  amount: Joi.number().positive().precision(2).required(),
  date: Joi.date().iso().required(),
  campaign: Joi.string().min(3).max(200).required(),
  region: Joi.string().valid('North America', 'Europe', 'Asia', 'Africa', 'South America', 'Oceania').required(),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  }).optional()
});

export function validateDonation(donation: any) {
  return donationSchema.validate(donation);
}

export function sanitizeDonationData(rawData: any) {
  return {
    ...rawData,
    amount: Math.round(parseFloat(rawData.amount) * 100) / 100, // Ensure 2 decimal places
    date: new Date(rawData.date).toISOString().split('T')[0], // YYYY-MM-DD format
    donorName: rawData.donorName.trim(),
    campaign: rawData.campaign.trim()
  };
}
```

## Performance Optimization

### 1. Caching Strategy
```typescript
// utils/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes TTL

export async function getCachedOrFetch<T>(
  key: string,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) {
    return cached;
  }
  
  const result = await fetchFunction();
  cache.set(key, result);
  return result;
}
```

### 2. Database Indexing
```sql
-- SQL Server indexes for performance
CREATE INDEX IX_Donations_Date ON Donations(Date DESC);
CREATE INDEX IX_Donations_Campaign ON Donations(CampaignId);
CREATE INDEX IX_Donations_Donor ON Donations(DonorId);
CREATE INDEX IX_ImpactMetrics_Type ON ImpactMetrics(Type);
CREATE INDEX IX_ImpactMetrics_Region ON ImpactMetrics(Region);
```

### 3. Pagination Implementation
```typescript
// api/donations/index.ts - with pagination
async function handleGetDonations(context: Context, req: HttpRequest): Promise<void> {
  const { page = 1, limit = 50, ...filters } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Database query with pagination
  const result = await queryDonations({
    ...filters,
    offset,
    limit: parseInt(limit)
  });
  
  context.res = {
    ...context.res,
    status: 200,
    body: {
      data: result.donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit))
      }
    }
  };
}
```

## Security Considerations

### 1. Data Privacy
- Implement PII anonymization for public datasets
- Use environment variables for sensitive configuration
- Implement proper access controls

### 2. API Security
- Add rate limiting
- Implement authentication/authorization
- Validate all input data
- Use HTTPS only

### 3. Compliance
- GDPR compliance for EU donors
- Data retention policies
- Audit logging

## Monitoring and Analytics

### 1. Application Insights Integration
```typescript
import { TelemetryClient } from 'applicationinsights';

const telemetryClient = new TelemetryClient(process.env.APPINSIGHTS_INSTRUMENTATIONKEY!);

export function trackDonationCreated(donation: any) {
  telemetryClient.trackEvent({
    name: 'DonationCreated',
    properties: {
      campaign: donation.campaign,
      region: donation.region,
      amount: donation.amount
    }
  });
}
```

### 2. Real-time Dashboards
- Power BI integration for executive reporting
- Azure Monitor dashboards for system health
- Custom analytics for impact measurement

## Getting Started Checklist

### Phase 1: Development Testing
- [ ] Set up local development database
- [ ] Import sample realistic data (1000+ records)
- [ ] Test all CRUD operations
- [ ] Validate data consistency

### Phase 2: Integration Testing
- [ ] Deploy to staging environment
- [ ] Test with larger datasets (10k+ records)
- [ ] Verify performance under load
- [ ] Test error handling scenarios

### Phase 3: Production Deployment
- [ ] Set up production database
- [ ] Implement monitoring and alerting
- [ ] Configure backup and disaster recovery
- [ ] Plan data migration strategy

### Phase 4: Ongoing Operations
- [ ] Set up automated data sync (if using external sources)
- [ ] Implement data quality monitoring
- [ ] Regular performance optimization
- [ ] User feedback integration