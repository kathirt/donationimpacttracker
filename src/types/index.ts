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

export interface Testimonial {
  id: string;
  beneficiaryName: string;
  role: string;
  campaign: string;
  region: string;
  message: string;
  date: string;
  impactType?: string;
  rating?: number;
  verified: boolean;
}

export interface Feedback {
  id: string;
  beneficiaryName: string;
  email?: string;
  campaign: string;
  region: string;
  feedbackType: 'testimonial' | 'suggestion' | 'concern' | 'gratitude';
  message: string;
  rating?: number;
  date: string;
  status: 'pending' | 'approved' | 'published';
}