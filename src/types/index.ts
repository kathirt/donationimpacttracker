export interface Donation {
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

export interface ImpactMetric {
  id: string;
  donationId: string;
  type: 'meals_served' | 'books_distributed' | 'students_supported' | 'trees_planted' | 'scholarships_provided';
  value: number;
  description: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  totalDonated: number;
  donationCount: number;
  preferredCampaigns: string[];
  joinDate: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  region: string;
  startDate: string;
  endDate: string;
  impactTypes: string[];
}

export interface ImpactSummary {
  totalDonations: number;
  totalAmount: number;
  totalBeneficiaries: number;
  impactsByType: {
    [key: string]: {
      total: number;
      description: string;
    };
  };
  regionBreakdown: {
    [region: string]: {
      donations: number;
      amount: number;
      beneficiaries: number;
    };
  };
}

export interface FilterOptions {
  donor?: string;
  campaign?: string;
  region?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  impactType?: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  organizationId: string;
  organizationName: string;
  permissions: ApiPermission[];
  rateLimit: number; // requests per hour
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
}

export type ApiPermission = 
  | 'donations:read'
  | 'donations:write'
  | 'donors:read'
  | 'donors:write'
  | 'campaigns:read'
  | 'campaigns:write'
  | 'impact:read'
  | 'impact:write'
  | 'webhooks:manage';

export interface Organization {
  id: string;
  name: string;
  email: string;
  type: 'nonprofit' | 'corporate' | 'developer';
  apiKeys: string[]; // API key IDs
  createdAt: string;
  isVerified: boolean;
}

export interface WebhookSubscription {
  id: string;
  organizationId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export type WebhookEvent = 
  | 'donation.created'
  | 'donation.updated'
  | 'campaign.created'
  | 'campaign.updated'
  | 'impact.recorded';

export interface ApiRequest {
  apiKeyId: string;
  endpoint: string;
  method: string;
  timestamp: string;
  responseStatus: number;
  responseTime: number;
}