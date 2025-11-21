# 🔌 Donation Impact Tracker API Documentation

## Overview

The Donation Impact Tracker API provides programmatic access to donation data, impact metrics, donor information, and campaigns. Organizations and developers can use this API to sync data, integrate with their systems, and build custom applications.

## Base URL

```
https://your-app.azurewebsites.net/api
```

For local development:
```
http://localhost:7071/api
```

## Authentication

All API requests require authentication using an API key. Include your API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

### Demo API Key

For testing purposes, use this demo key:
```
demo_key_12345678901234567890123456789012
```

This key has read-only access to all endpoints.

## Rate Limiting

API requests are rate-limited per organization:
- Default: 1000 requests per hour
- Rate limit information is returned in response headers:
  - `X-RateLimit-Limit`: Total requests allowed per hour
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## API Endpoints

### Donations

#### Get All Donations
```
GET /api/donations
```

**Query Parameters:**
- `donor` (string): Filter by donor ID or name
- `campaign` (string): Filter by campaign name
- `region` (string): Filter by region
- `startDate` (string): Filter by start date (YYYY-MM-DD)
- `endDate` (string): Filter by end date (YYYY-MM-DD)

**Required Permission:** `donations:read`

**Example Request:**
```bash
curl -X GET "https://your-app.azurewebsites.net/api/donations?region=North%20America" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response:**
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
```
POST /api/donations
```

**Required Permission:** `donations:write`

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

---

### Donors

#### Get All Donors
```
GET /api/donors
```

**Query Parameters:**
- `name` (string): Filter by donor name
- `email` (string): Filter by email
- `minDonated` (number): Filter by minimum donation amount
- `campaign` (string): Filter by preferred campaign

**Required Permission:** `donors:read`

**Example Request:**
```bash
curl -X GET "https://your-app.azurewebsites.net/api/donors?minDonated=1000" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response:**
```json
{
  "count": 3,
  "donors": [
    {
      "id": "donor-003",
      "name": "Education Foundation",
      "email": "contact@educfoundation.org",
      "totalDonated": 15000,
      "donationCount": 25,
      "preferredCampaigns": ["School Lunch Program", "Scholarship Fund"],
      "joinDate": "2022-09-10"
    }
  ]
}
```

#### Get Donor by ID
```
GET /api/donors/{id}
```

**Required Permission:** `donors:read`

#### Create Donor
```
POST /api/donors
```

**Required Permission:** `donors:write`

**Request Body:**
```json
{
  "name": "New Donor",
  "email": "donor@example.com",
  "preferredCampaigns": ["School Lunch Program"]
}
```

#### Update Donor
```
PUT /api/donors/{id}
```

**Required Permission:** `donors:write`

---

### Campaigns

#### Get All Campaigns
```
GET /api/campaigns
```

**Query Parameters:**
- `region` (string): Filter by region
- `active` (boolean): Filter active campaigns only
- `impactType` (string): Filter by impact type

**Required Permission:** `campaigns:read`

**Example Request:**
```bash
curl -X GET "https://your-app.azurewebsites.net/api/campaigns?active=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response:**
```json
{
  "count": 4,
  "campaigns": [
    {
      "id": "camp-001",
      "name": "School Lunch Program",
      "description": "Providing nutritious meals...",
      "goal": 50000,
      "raised": 42500,
      "region": "Global",
      "startDate": "2024-01-01",
      "endDate": "2024-06-30",
      "impactTypes": ["meals_served", "students_supported"],
      "isActive": true
    }
  ]
}
```

#### Get Campaign by ID
```
GET /api/campaigns/{id}
```

**Required Permission:** `campaigns:read`

**Response includes additional stats:**
```json
{
  "id": "camp-001",
  "name": "School Lunch Program",
  "stats": {
    "progress": 85.0,
    "remaining": 7500,
    "daysRemaining": 45
  }
}
```

---

### Impact Metrics

#### Get All Impact Metrics
```
GET /api/impact-metrics
```

**Query Parameters:**
- `region` (string): Filter by region
- `type` (string): Filter by impact type (meals_served, books_distributed, etc.)
- `donationId` (string): Filter by donation ID
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date
- `aggregated` (boolean): Return aggregated summary instead of individual metrics

**Required Permission:** `impact:read`

**Example Request:**
```bash
curl -X GET "https://your-app.azurewebsites.net/api/impact-metrics?type=meals_served&aggregated=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response (Individual Metrics):**
```json
{
  "count": 2,
  "metrics": [
    {
      "id": "imp-001",
      "donationId": "don-001",
      "type": "meals_served",
      "value": 150,
      "description": "150 nutritious meals served",
      "region": "North America",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "date": "2024-01-15"
    }
  ]
}
```

**Example Response (Aggregated):**
```json
{
  "aggregated": true,
  "summary": {
    "totalImpact": 750,
    "totalMetrics": 2,
    "byType": {
      "meals_served": {
        "total": 750,
        "count": 2
      }
    },
    "byRegion": {
      "North America": {
        "total": 150,
        "count": 1
      },
      "South America": {
        "total": 600,
        "count": 1
      }
    }
  }
}
```

#### Get Impact Metric by ID
```
GET /api/impact-metrics/{id}
```

**Required Permission:** `impact:read`

---

### Impact Summary

#### Get Overall Impact Summary
```
GET /api/impact-summary
```

**Query Parameters:**
- `region` (string): Filter by region
- `campaign` (string): Filter by campaign
- `donor` (string): Filter by donor

**Required Permission:** `impact:read`

**Example Response:**
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
    },
    "students_supported": {
      "total": 2150,
      "description": "Students receiving support"
    },
    "scholarships_provided": {
      "total": 89,
      "description": "Full scholarships awarded"
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

---

### Webhooks

Webhooks allow you to receive real-time notifications when events occur in the system.

#### List Webhooks
```
GET /api/webhooks
```

**Required Permission:** `webhooks:manage`

#### Get Webhook by ID
```
GET /api/webhooks/{id}
```

**Required Permission:** `webhooks:manage`

#### Create Webhook
```
POST /api/webhooks
```

**Required Permission:** `webhooks:manage`

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": [
    "donation.created",
    "donation.updated",
    "campaign.created",
    "campaign.updated",
    "impact.recorded"
  ]
}
```

**Response:**
```json
{
  "id": "wh-abc123",
  "url": "https://your-app.com/webhook",
  "events": ["donation.created"],
  "secret": "whsec_xxxxxx",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "message": "Webhook created successfully. Save the secret for verifying webhook payloads."
}
```

**Important:** Save the `secret` value. You'll need it to verify webhook signatures.

#### Delete Webhook
```
DELETE /api/webhooks/{id}
```

**Required Permission:** `webhooks:manage`

---

## Webhook Events

When a subscribed event occurs, a POST request is sent to your webhook URL with the following structure:

```json
{
  "event": "donation.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "id": "don-001",
    "donorId": "donor-001",
    "amount": 500,
    "campaign": "School Lunch Program"
  }
}
```

### Verifying Webhook Signatures

Each webhook request includes a `X-Webhook-Signature` header. Verify it using HMAC SHA-256:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid API key
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Permissions

Each API key can be assigned the following permissions:

| Permission | Description |
|------------|-------------|
| `donations:read` | Read donation data |
| `donations:write` | Create and update donations |
| `donors:read` | Read donor information |
| `donors:write` | Create and update donors |
| `campaigns:read` | Read campaign information |
| `campaigns:write` | Create and update campaigns |
| `impact:read` | Read impact metrics |
| `impact:write` | Record impact metrics |
| `webhooks:manage` | Manage webhook subscriptions |

---

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://your-app.azurewebsites.net/api',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Get all donations
async function getDonations() {
  try {
    const response = await apiClient.get('/donations');
    console.log('Donations:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Create a donation
async function createDonation(donationData) {
  try {
    const response = await apiClient.post('/donations', donationData);
    console.log('Created:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Python

```python
import requests

API_BASE = 'https://your-app.azurewebsites.net/api'
API_KEY = 'YOUR_API_KEY'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Get all donations
def get_donations():
    response = requests.get(f'{API_BASE}/donations', headers=headers)
    if response.status_code == 200:
        print('Donations:', response.json())
    else:
        print('Error:', response.json())

# Create a donation
def create_donation(donation_data):
    response = requests.post(
        f'{API_BASE}/donations',
        json=donation_data,
        headers=headers
    )
    if response.status_code == 201:
        print('Created:', response.json())
    else:
        print('Error:', response.json())
```

### cURL

```bash
# Get all donations
curl -X GET "https://your-app.azurewebsites.net/api/donations" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Create a donation
curl -X POST "https://your-app.azurewebsites.net/api/donations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "donor-001",
    "amount": 500,
    "campaign": "School Lunch Program",
    "region": "North America"
  }'

# Get impact summary
curl -X GET "https://your-app.azurewebsites.net/api/impact-summary?region=Asia" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Getting Started

1. **Request an API Key**: Contact your administrator to receive an API key for your organization.

2. **Test with Demo Key**: Use the demo key for initial testing:
   ```
   demo_key_12345678901234567890123456789012
   ```

3. **Make Your First Request**:
   ```bash
   curl -X GET "https://your-app.azurewebsites.net/api/donors" \
     -H "Authorization: Bearer demo_key_12345678901234567890123456789012"
   ```

4. **Set Up Webhooks** (optional): Configure webhooks to receive real-time updates.

5. **Integrate**: Start integrating the API into your application.

---

## Support

For API support:
- Create an issue on GitHub
- Contact the development team
- Review the source code for implementation details

---

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Donations, Donors, Campaigns, and Impact Metrics endpoints
- API key authentication
- Rate limiting
- Webhook support
- Comprehensive documentation
