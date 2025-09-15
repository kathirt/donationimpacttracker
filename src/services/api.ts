import axios from 'axios';
import { Donation, ImpactMetric, Donor, Campaign, ImpactSummary, FilterOptions } from '../types';

// Base API URL - will be replaced with actual Azure Functions URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// API client configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication (if needed)
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Donations API
export const donationsApi = {
  // Get all donations with optional filters
  getDonations: async (filters?: FilterOptions): Promise<Donation[]> => {
    const params = new URLSearchParams();
    if (filters?.donor) params.append('donor', filters.donor);
    if (filters?.campaign) params.append('campaign', filters.campaign);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);
    
    const response = await apiClient.get(`/donations?${params.toString()}`);
    return response.data;
  },

  // Get donation by ID
  getDonationById: async (id: string): Promise<Donation> => {
    const response = await apiClient.get(`/donations/${id}`);
    return response.data;
  },

  // Get donations by donor
  getDonationsByDonor: async (donorId: string): Promise<Donation[]> => {
    const response = await apiClient.get(`/donations/donor/${donorId}`);
    return response.data;
  },

  // Get donations by campaign
  getDonationsByCampaign: async (campaignId: string): Promise<Donation[]> => {
    const response = await apiClient.get(`/donations/campaign/${campaignId}`);
    return response.data;
  },

  // Create new donation
  createDonation: async (donation: Omit<Donation, 'id'>): Promise<Donation> => {
    const response = await apiClient.post('/donations', donation);
    return response.data;
  }
};

// Impact Metrics API
export const impactApi = {
  // Get all impact metrics with optional filters
  getImpactMetrics: async (filters?: FilterOptions): Promise<ImpactMetric[]> => {
    const params = new URLSearchParams();
    if (filters?.region) params.append('region', filters.region);
    if (filters?.impactType) params.append('type', filters.impactType);
    if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);
    
    const response = await apiClient.get(`/impact?${params.toString()}`);
    return response.data;
  },

  // Get impact metrics by donation ID
  getImpactByDonation: async (donationId: string): Promise<ImpactMetric[]> => {
    const response = await apiClient.get(`/impact/donation/${donationId}`);
    return response.data;
  },

  // Get impact summary
  getImpactSummary: async (filters?: FilterOptions): Promise<ImpactSummary> => {
    const params = new URLSearchParams();
    if (filters?.region) params.append('region', filters.region);
    if (filters?.campaign) params.append('campaign', filters.campaign);
    if (filters?.donor) params.append('donor', filters.donor);
    
    const response = await apiClient.get(`/impact/summary?${params.toString()}`);
    return response.data;
  },

  // Get impact metrics by type
  getImpactByType: async (type: string): Promise<ImpactMetric[]> => {
    const response = await apiClient.get(`/impact/type/${type}`);
    return response.data;
  },

  // Get impact metrics by region
  getImpactByRegion: async (region: string): Promise<ImpactMetric[]> => {
    const response = await apiClient.get(`/impact/region/${region}`);
    return response.data;
  }
};

// Donors API
export const donorsApi = {
  // Get all donors
  getDonors: async (): Promise<Donor[]> => {
    const response = await apiClient.get('/donors');
    return response.data;
  },

  // Get donor by ID
  getDonorById: async (id: string): Promise<Donor> => {
    const response = await apiClient.get(`/donors/${id}`);
    return response.data;
  },

  // Update donor information
  updateDonor: async (id: string, donor: Partial<Donor>): Promise<Donor> => {
    const response = await apiClient.put(`/donors/${id}`, donor);
    return response.data;
  },

  // Get donor statistics
  getDonorStats: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/donors/${id}/stats`);
    return response.data;
  }
};

// Campaigns API
export const campaignsApi = {
  // Get all campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await apiClient.get('/campaigns');
    return response.data;
  },

  // Get campaign by ID
  getCampaignById: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
  },

  // Get active campaigns
  getActiveCampaigns: async (): Promise<Campaign[]> => {
    const response = await apiClient.get('/campaigns/active');
    return response.data;
  },

  // Get campaign statistics
  getCampaignStats: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/campaigns/${id}/stats`);
    return response.data;
  }
};

// Azure OpenAI API for narrative generation
export const narrativeApi = {
  // Generate impact story summary
  generateImpactSummary: async (donationId: string): Promise<{ summary: string }> => {
    const response = await apiClient.post('/narrative/impact-summary', { donationId });
    return response.data;
  },

  // Generate donor communication
  generateDonorCommunication: async (donorId: string, template: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/narrative/donor-communication', { donorId, template });
    return response.data;
  },

  // Generate campaign update
  generateCampaignUpdate: async (campaignId: string): Promise<{ update: string }> => {
    const response = await apiClient.post('/narrative/campaign-update', { campaignId });
    return response.data;
  }
};

// Maps API for geospatial data
export const mapsApi = {
  // Get map data for impact visualization
  getMapData: async (filters?: FilterOptions): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.region) params.append('region', filters.region);
    if (filters?.campaign) params.append('campaign', filters.campaign);
    
    const response = await apiClient.get(`/maps/impact-data?${params.toString()}`);
    return response.data;
  },

  // Get regional boundaries
  getRegionalBoundaries: async (): Promise<any> => {
    const response = await apiClient.get('/maps/boundaries');
    return response.data;
  }
};

// Analytics API
export const analyticsApi = {
  // Get dashboard analytics
  getDashboardAnalytics: async (filters?: FilterOptions): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);
    
    const response = await apiClient.get(`/analytics/dashboard?${params.toString()}`);
    return response.data;
  },

  // Get trend data
  getTrendData: async (metric: string, period: string): Promise<any> => {
    const response = await apiClient.get(`/analytics/trends/${metric}?period=${period}`);
    return response.data;
  }
};

// Export all APIs as a single object
export const api = {
  donations: donationsApi,
  impact: impactApi,
  donors: donorsApi,
  campaigns: campaignsApi,
  narrative: narrativeApi,
  maps: mapsApi,
  analytics: analyticsApi
};

export default api;