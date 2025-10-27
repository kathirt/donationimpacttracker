import {
  mockDonations,
  mockImpactMetrics,
  getDonationsByRegion,
  getDonationsByCampaign,
  getDonationsByDonor,
  getImpactMetricsByType,
  getImpactMetricsByRegion,
  getTotalImpactByType,
  getRegionalBreakdown
} from './mockData';

describe('mockData helper functions', () => {
  describe('getDonationsByRegion', () => {
    it('should return all donations when no region is specified', () => {
      const result = getDonationsByRegion();
      expect(result).toEqual(mockDonations);
      expect(result.length).toBe(8);
    });

    it('should filter donations by North America region', () => {
      const result = getDonationsByRegion('North America');
      expect(result.length).toBe(2);
      expect(result.every(d => d.region === 'North America')).toBe(true);
    });

    it('should filter donations by Europe region', () => {
      const result = getDonationsByRegion('Europe');
      expect(result.length).toBe(2);
      expect(result.every(d => d.region === 'Europe')).toBe(true);
    });

    it('should return empty array for non-existent region', () => {
      const result = getDonationsByRegion('Antarctica');
      expect(result).toEqual([]);
    });
  });

  describe('getDonationsByCampaign', () => {
    it('should return all donations when no campaign is specified', () => {
      const result = getDonationsByCampaign();
      expect(result).toEqual(mockDonations);
    });

    it('should filter donations by School Lunch Program campaign', () => {
      const result = getDonationsByCampaign('School Lunch Program');
      expect(result.length).toBe(2);
      expect(result.every(d => d.campaign === 'School Lunch Program')).toBe(true);
    });

    it('should filter donations by Scholarship Fund campaign', () => {
      const result = getDonationsByCampaign('Scholarship Fund');
      expect(result.length).toBe(2);
      expect(result.every(d => d.campaign === 'Scholarship Fund')).toBe(true);
    });

    it('should return empty array for non-existent campaign', () => {
      const result = getDonationsByCampaign('Non-existent Campaign');
      expect(result).toEqual([]);
    });
  });

  describe('getDonationsByDonor', () => {
    it('should return all donations when no donor is specified', () => {
      const result = getDonationsByDonor();
      expect(result).toEqual(mockDonations);
    });

    it('should filter donations by specific donor', () => {
      const result = getDonationsByDonor('donor-001');
      expect(result.length).toBe(2);
      expect(result.every(d => d.donorId === 'donor-001')).toBe(true);
      expect(result.every(d => d.donorName === 'John Doe')).toBe(true);
    });

    it('should return empty array for non-existent donor', () => {
      const result = getDonationsByDonor('donor-999');
      expect(result).toEqual([]);
    });
  });

  describe('getImpactMetricsByType', () => {
    it('should return all impact metrics when no type is specified', () => {
      const result = getImpactMetricsByType();
      expect(result).toEqual(mockImpactMetrics);
      expect(result.length).toBe(8);
    });

    it('should filter metrics by meals_served type', () => {
      const result = getImpactMetricsByType('meals_served');
      expect(result.length).toBe(2);
      expect(result.every(m => m.type === 'meals_served')).toBe(true);
    });

    it('should filter metrics by books_distributed type', () => {
      const result = getImpactMetricsByType('books_distributed');
      expect(result.length).toBe(3);
      expect(result.every(m => m.type === 'books_distributed')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      const result = getImpactMetricsByType('non_existent_type');
      expect(result).toEqual([]);
    });
  });

  describe('getImpactMetricsByRegion', () => {
    it('should return all metrics when no region is specified', () => {
      const result = getImpactMetricsByRegion();
      expect(result).toEqual(mockImpactMetrics);
    });

    it('should filter metrics by Asia region', () => {
      const result = getImpactMetricsByRegion('Asia');
      expect(result.length).toBe(2);
      expect(result.every(m => m.region === 'Asia')).toBe(true);
    });

    it('should return empty array for non-existent region', () => {
      const result = getImpactMetricsByRegion('Antarctica');
      expect(result).toEqual([]);
    });
  });

  describe('getTotalImpactByType', () => {
    it('should calculate total impact for all types', () => {
      const result = getTotalImpactByType();
      
      expect(result).toHaveProperty('meals_served');
      expect(result).toHaveProperty('books_distributed');
      expect(result).toHaveProperty('scholarships_provided');
      expect(result).toHaveProperty('students_supported');
    });

    it('should correctly sum meals_served', () => {
      const result = getTotalImpactByType();
      // 150 (imp-001) + 600 (imp-006) = 750
      expect(result.meals_served.total).toBe(750);
    });

    it('should correctly sum books_distributed', () => {
      const result = getTotalImpactByType();
      // 25 (imp-002) + 75 (imp-004) + 15 (imp-007) = 115
      expect(result.books_distributed.total).toBe(115);
    });

    it('should correctly sum scholarships_provided', () => {
      const result = getTotalImpactByType();
      // 2 (imp-003) + 1 (imp-008) = 3
      expect(result.scholarships_provided.total).toBe(3);
    });

    it('should include description for each type', () => {
      const result = getTotalImpactByType();
      
      Object.values(result).forEach(impact => {
        expect(impact).toHaveProperty('description');
        expect(typeof impact.description).toBe('string');
        expect(impact.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getRegionalBreakdown', () => {
    it('should return breakdown for all regions', () => {
      const result = getRegionalBreakdown();
      
      expect(result).toHaveProperty('North America');
      expect(result).toHaveProperty('Europe');
      expect(result).toHaveProperty('Asia');
      expect(result).toHaveProperty('Africa');
      expect(result).toHaveProperty('South America');
    });

    it('should correctly count donations per region', () => {
      const result = getRegionalBreakdown();
      
      expect(result['North America'].donations).toBe(2);
      expect(result['Europe'].donations).toBe(2);
      expect(result['Asia'].donations).toBe(2);
      expect(result['Africa'].donations).toBe(1);
      expect(result['South America'].donations).toBe(1);
    });

    it('should correctly sum donation amounts per region', () => {
      const result = getRegionalBreakdown();
      
      // North America: 500 + 300 = 800
      expect(result['North America'].amount).toBe(800);
      // Europe: 250 + 150 = 400
      expect(result['Europe'].amount).toBe(400);
      // Asia: 1000 + 800 = 1800
      expect(result['Asia'].amount).toBe(1800);
    });

    it('should correctly count beneficiaries per region', () => {
      const result = getRegionalBreakdown();
      
      // North America: 150 (meals) + 30 (students) = 180
      expect(result['North America'].beneficiaries).toBe(180);
      // South America: 600 (meals) = 600
      expect(result['South America'].beneficiaries).toBe(600);
    });

    it('should have all required properties for each region', () => {
      const result = getRegionalBreakdown();
      
      Object.values(result).forEach(region => {
        expect(region).toHaveProperty('donations');
        expect(region).toHaveProperty('amount');
        expect(region).toHaveProperty('beneficiaries');
        expect(typeof region.donations).toBe('number');
        expect(typeof region.amount).toBe('number');
        expect(typeof region.beneficiaries).toBe('number');
      });
    });
  });
});
