import { Donation, ImpactMetric, Donor, Campaign } from '../types';

// Mock donation data
export const mockDonations: Donation[] = [
  {
    id: 'don-001',
    donorId: 'donor-001',
    donorName: 'John Doe',
    amount: 500,
    date: '2024-01-15',
    campaign: 'School Lunch Program',
    region: 'North America',
    coordinates: { latitude: 40.7128, longitude: -74.0060 }
  },
  {
    id: 'don-002',
    donorId: 'donor-002',
    donorName: 'Jane Smith',
    amount: 250,
    date: '2024-01-14',
    campaign: 'Digital Learning Initiative',
    region: 'Europe',
    coordinates: { latitude: 51.5074, longitude: -0.1278 }
  },
  {
    id: 'don-003',
    donorId: 'donor-003',
    donorName: 'Education Foundation',
    amount: 1000,
    date: '2024-01-13',
    campaign: 'Scholarship Fund',
    region: 'Asia',
    coordinates: { latitude: 35.6762, longitude: 139.6503 }
  },
  {
    id: 'don-004',
    donorId: 'donor-004',
    donorName: 'Tech for Good',
    amount: 750,
    date: '2024-01-12',
    campaign: 'Library Books Drive',
    region: 'Africa',
    coordinates: { latitude: -1.2921, longitude: 36.8219 }
  },
  {
    id: 'don-005',
    donorId: 'donor-001',
    donorName: 'John Doe',
    amount: 300,
    date: '2024-01-10',
    campaign: 'Digital Learning Initiative',
    region: 'North America',
    coordinates: { latitude: 34.0522, longitude: -118.2437 }
  },
  {
    id: 'don-006',
    donorId: 'donor-005',
    donorName: 'Global Impact Corp',
    amount: 2000,
    date: '2024-01-08',
    campaign: 'School Lunch Program',
    region: 'South America',
    coordinates: { latitude: -23.5505, longitude: -46.6333 }
  },
  {
    id: 'don-007',
    donorId: 'donor-002',
    donorName: 'Jane Smith',
    amount: 150,
    date: '2024-01-05',
    campaign: 'Library Books Drive',
    region: 'Europe',
    coordinates: { latitude: 48.8566, longitude: 2.3522 }
  },
  {
    id: 'don-008',
    donorId: 'donor-006',
    donorName: 'Learning Together NGO',
    amount: 800,
    date: '2024-01-03',
    campaign: 'Scholarship Fund',
    region: 'Asia',
    coordinates: { latitude: 28.6139, longitude: 77.2090 }
  }
];

// Mock impact metrics data
export const mockImpactMetrics: ImpactMetric[] = [
  {
    id: 'imp-001',
    donationId: 'don-001',
    type: 'meals_served',
    value: 150,
    description: '150 nutritious meals served to elementary school students',
    region: 'North America',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    date: '2024-01-15'
  },
  {
    id: 'imp-002',
    donationId: 'don-002',
    type: 'books_distributed',
    value: 25,
    description: '25 digital learning tablets distributed to rural schools',
    region: 'Europe',
    coordinates: { latitude: 51.5074, longitude: -0.1278 },
    date: '2024-01-14'
  },
  {
    id: 'imp-003',
    donationId: 'don-003',
    type: 'scholarships_provided',
    value: 2,
    description: '2 full scholarships awarded to deserving students',
    region: 'Asia',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
    date: '2024-01-13'
  },
  {
    id: 'imp-004',
    donationId: 'don-004',
    type: 'books_distributed',
    value: 75,
    description: '75 educational textbooks added to community library',
    region: 'Africa',
    coordinates: { latitude: -1.2921, longitude: 36.8219 },
    date: '2024-01-12'
  },
  {
    id: 'imp-005',
    donationId: 'don-005',
    type: 'students_supported',
    value: 30,
    description: '30 students provided with digital learning access',
    region: 'North America',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    date: '2024-01-10'
  },
  {
    id: 'imp-006',
    donationId: 'don-006',
    type: 'meals_served',
    value: 600,
    description: '600 meals provided through school feeding program',
    region: 'South America',
    coordinates: { latitude: -23.5505, longitude: -46.6333 },
    date: '2024-01-08'
  },
  {
    id: 'imp-007',
    donationId: 'don-007',
    type: 'books_distributed',
    value: 15,
    description: '15 children\'s storybooks donated to local library',
    region: 'Europe',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
    date: '2024-01-05'
  },
  {
    id: 'imp-008',
    donationId: 'don-008',
    type: 'scholarships_provided',
    value: 1,
    description: '1 scholarship covering full university tuition',
    region: 'Asia',
    coordinates: { latitude: 28.6139, longitude: 77.2090 },
    date: '2024-01-03'
  }
];

// Mock donor data
export const mockDonors: Donor[] = [
  {
    id: 'donor-001',
    name: 'John Doe',
    email: 'john.doe@email.com',
    totalDonated: 2500,
    donationCount: 8,
    preferredCampaigns: ['School Lunch Program', 'Digital Learning Initiative'],
    joinDate: '2023-03-15'
  },
  {
    id: 'donor-002',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    totalDonated: 1800,
    donationCount: 6,
    preferredCampaigns: ['Scholarship Fund', 'Library Books Drive'],
    joinDate: '2023-05-22'
  },
  {
    id: 'donor-003',
    name: 'Education Foundation',
    email: 'contact@educfoundation.org',
    totalDonated: 15000,
    donationCount: 25,
    preferredCampaigns: ['School Lunch Program', 'Scholarship Fund', 'Digital Learning Initiative'],
    joinDate: '2022-09-10'
  },
  {
    id: 'donor-004',
    name: 'Tech for Good',
    email: 'donate@techforgood.org',
    totalDonated: 8500,
    donationCount: 15,
    preferredCampaigns: ['Digital Learning Initiative', 'Library Books Drive'],
    joinDate: '2023-01-08'
  },
  {
    id: 'donor-005',
    name: 'Global Impact Corp',
    email: 'csr@globalimpact.com',
    totalDonated: 12000,
    donationCount: 20,
    preferredCampaigns: ['School Lunch Program', 'Scholarship Fund'],
    joinDate: '2022-11-20'
  },
  {
    id: 'donor-006',
    name: 'Learning Together NGO',
    email: 'info@learningtogether.org',
    totalDonated: 5500,
    donationCount: 12,
    preferredCampaigns: ['Scholarship Fund', 'Digital Learning Initiative'],
    joinDate: '2023-07-14'
  }
];

// Mock campaign data
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'School Lunch Program',
    description: 'Providing nutritious meals to students in underserved communities to improve their health and academic performance.',
    goal: 50000,
    raised: 42500,
    region: 'Global',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    impactTypes: ['meals_served', 'students_supported']
  },
  {
    id: 'camp-002',
    name: 'Digital Learning Initiative',
    description: 'Equipping schools with technology and digital resources to enhance modern education and prepare students for the digital age.',
    goal: 75000,
    raised: 58200,
    region: 'Global',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    impactTypes: ['books_distributed', 'students_supported']
  },
  {
    id: 'camp-003',
    name: 'Scholarship Fund',
    description: 'Supporting talented students from low-income families with scholarships to pursue higher education and break the cycle of poverty.',
    goal: 100000,
    raised: 89500,
    region: 'Global',
    startDate: '2023-09-01',
    endDate: '2024-08-31',
    impactTypes: ['scholarships_provided', 'students_supported']
  },
  {
    id: 'camp-004',
    name: 'Library Books Drive',
    description: 'Building and stocking community libraries with books and educational materials to promote literacy and lifelong learning.',
    goal: 30000,
    raised: 28750,
    region: 'Global',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    impactTypes: ['books_distributed']
  }
];

// Helper functions for data filtering and aggregation
export const getDonationsByRegion = (region?: string): Donation[] => {
  if (!region) return mockDonations;
  return mockDonations.filter(donation => donation.region === region);
};

export const getDonationsByCampaign = (campaign?: string): Donation[] => {
  if (!campaign) return mockDonations;
  return mockDonations.filter(donation => donation.campaign === campaign);
};

export const getDonationsByDonor = (donorId?: string): Donation[] => {
  if (!donorId) return mockDonations;
  return mockDonations.filter(donation => donation.donorId === donorId);
};

export const getImpactMetricsByType = (type?: string): ImpactMetric[] => {
  if (!type) return mockImpactMetrics;
  return mockImpactMetrics.filter(metric => metric.type === type);
};

export const getImpactMetricsByRegion = (region?: string): ImpactMetric[] => {
  if (!region) return mockImpactMetrics;
  return mockImpactMetrics.filter(metric => metric.region === region);
};

export const getTotalImpactByType = () => {
  const impactSummary: { [key: string]: { total: number; description: string } } = {};
  
  mockImpactMetrics.forEach(metric => {
    if (!impactSummary[metric.type]) {
      impactSummary[metric.type] = {
        total: 0,
        description: metric.description.split(' ').slice(2).join(' ')
      };
    }
    impactSummary[metric.type].total += metric.value;
  });
  
  return impactSummary;
};

export const getRegionalBreakdown = () => {
  const regionBreakdown: { [region: string]: { donations: number; amount: number; beneficiaries: number } } = {};
  
  mockDonations.forEach(donation => {
    if (!regionBreakdown[donation.region]) {
      regionBreakdown[donation.region] = {
        donations: 0,
        amount: 0,
        beneficiaries: 0
      };
    }
    regionBreakdown[donation.region].donations += 1;
    regionBreakdown[donation.region].amount += donation.amount;
  });
  
  mockImpactMetrics.forEach(metric => {
    if (regionBreakdown[metric.region]) {
      regionBreakdown[metric.region].beneficiaries += metric.value;
    }
  });
  
  return regionBreakdown;
};