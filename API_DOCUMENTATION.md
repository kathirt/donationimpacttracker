# API Documentation

This document describes the API endpoints for the Donation Impact Tracker.

## Base URL
```
Development: http://localhost:7071/api
Production: https://your-app.azurestaticapps.net/api
```

## Authentication
Currently using anonymous authentication. In production, implement Azure AD B2C or similar.

## Endpoints

### Donations API

#### Get All Donations
```http
GET /donations
```

**Query Parameters:**
- `donor` (optional): Filter by donor ID or name
- `campaign` (optional): Filter by campaign name
- `region` (optional): Filter by region
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": "don-001",
    "donorId": "donor-001",
    "donorName": "John Doe",
    "amount": 500,
    "date": "2024-01-15",
    "campaign": "School Lunch Program",
    "region": "North America",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
]
```

#### Create Donation
```http
POST /donations
```

**Request Body:**
```json
{
  "donorId": "donor-001",
  "donorName": "John Doe",
  "amount": 500,
  "campaign": "School Lunch Program",
  "region": "North America",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Validation Rules:**
- `donorId` (required): String, max 100 characters
- `amount` (required): Positive number
- `campaign` (required): String, max 200 characters
- `donorName` (optional): String, max 200 characters
- `region` (optional): String, max 100 characters
- `coordinates` (optional): Valid latitude/longitude

**Response:** 201 Created
```json
{
  "id": "don-1234567890",
  "donorId": "donor-001",
  "donorName": "John Doe",
  "amount": 500,
  "date": "2024-01-15",
  "campaign": "School Lunch Program",
  "region": "North America"
}
```

**Error Responses:**
- 400 Bad Request: Invalid or missing required fields
- 500 Internal Server Error: Server error

### Impact Summary API

#### Get Impact Summary
```http
GET /impact-summary
```

**Query Parameters:**
- `region` (optional): Filter by specific region
- `campaign` (optional): Filter by campaign
- `donor` (optional): Filter by donor

**Response:**
```json
{
  "totalDonations": 1247,
  "totalAmount": 185420,
  "totalBeneficiaries": 3892,
  "impactsByType": {
    "meals_served": {
      "total": 15640,
      "description": "Meals served to students"
    },
    "books_distributed": {
      "total": 4820,
      "description": "Educational books distributed"
    }
  },
  "regionBreakdown": {
    "North America": {
      "donations": 420,
      "amount": 78000,
      "beneficiaries": 1200
    }
  }
}
```

## Error Handling

All API errors follow this format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request - Invalid input
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

**Current Limits:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

When rate limited, API returns:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## CORS Configuration

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: `https://your-app.azurestaticapps.net`

**Allowed Methods:**
- GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:**
- Content-Type, Authorization

## Data Types

### Donation
```typescript
interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  date: string;  // ISO 8601 format
  campaign: string;
  region: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

### Impact Metric
```typescript
interface ImpactMetric {
  id: string;
  donationId: string;
  type: 'meals_served' | 'books_distributed' | 'students_supported' | 'scholarships_provided';
  value: number;
  description: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string;
}
```

### Filter Options
```typescript
interface FilterOptions {
  donor?: string;
  campaign?: string;
  region?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  impactType?: string;
}
```

## Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

// Get donations
const response = await axios.get('/api/donations', {
  params: {
    region: 'North America',
    startDate: '2024-01-01'
  }
});

// Create donation
const newDonation = await axios.post('/api/donations', {
  donorId: 'donor-001',
  amount: 500,
  campaign: 'School Lunch Program',
  region: 'North America'
});
```

### cURL
```bash
# Get donations
curl -X GET "https://your-app.azurestaticapps.net/api/donations?region=North+America"

# Create donation
curl -X POST "https://your-app.azurestaticapps.net/api/donations" \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "donor-001",
    "amount": 500,
    "campaign": "School Lunch Program",
    "region": "North America"
  }'
```

## Security Considerations

### Input Validation
All inputs are validated and sanitized:
- String length limits enforced
- HTML/script tags removed
- Numbers validated for range and type
- Dates validated for format

### SQL Injection Prevention
- Using parameterized queries
- ORM with built-in protection
- Input sanitization

### XSS Prevention
- Output encoding
- Content Security Policy headers
- Input sanitization

## Testing

### Test Endpoints
Development environment includes test data endpoints:

```http
GET /api/test/reset-data
POST /api/test/seed-data
```

**Note:** These endpoints are disabled in production.

## Changelog

### Version 1.0.0 (Current)
- Initial API implementation
- Donations CRUD operations
- Impact summary endpoint
- Filter support
- Input validation

## Future Enhancements

Planned features:
- [ ] Pagination support
- [ ] Bulk operations
- [ ] Webhooks for real-time updates
- [ ] GraphQL endpoint
- [ ] Advanced analytics endpoints
- [ ] Export functionality (CSV, PDF)
- [ ] Batch donation uploads

## Support

For API issues or questions:
- GitHub Issues: [Link to issues]
- Email: api-support@yourorganization.org
- Documentation: This file
