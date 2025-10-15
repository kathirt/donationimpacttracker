import {
  mockDonations,
  mockImpactMetrics,
  mockDonors,
  mockCampaigns,
  getDonationsByRegion,
  getDonationsByCampaign,
  getDonationsByDonor,
  getImpactMetricsByType,
  getImpactMetricsByRegion,
  getTotalImpactByType,
  getRegionalBreakdown
} from './mockData';

describe('mockData helper functions', () => {
  // Test getDonationsByRegion
  describe('getDonationsByRegion', () => {
    it('should return all donations when no region is specified', () => {
      const result = getDonationsByRegion();
      expect(result).toEqual(mockDonations);
      expect(result.length).toBe(8);
    });

    it('should filter donations by region correctly', () => {
      const northAmericaDonations = getDonationsByRegion('North America');
      expect(northAmericaDonations.length).toBe(2);
      expect(northAmericaDonations.every(d => d.region === 'North America')).toBe(true);
    });

    it('should return empty array for non-existent region', () => {
      const result = getDonationsByRegion('Antarctica');
      expect(result).toEqual([]);
    });

    it('should filter Europe donations correctly', () => {
      const europeDonations = getDonationsByRegion('Europe');
      expect(europeDonations.length).toBe(2);
      expect(europeDonations.every(d => d.region === 'Europe')).toBe(true);
    });
  });

  // Test getDonationsByCampaign
  describe('getDonationsByCampaign', () => {
    it('should return all donations when no campaign is specified', () => {
      const result = getDonationsByCampaign();
      expect(result).toEqual(mockDonations);
      expect(result.length).toBe(8);
    });

    it('should filter donations by campaign correctly', () => {
      const schoolLunchDonations = getDonationsByCampaign('School Lunch Program');
      expect(schoolLunchDonations.length).toBe(2);
      expect(schoolLunchDonations.every(d => d.campaign === 'School Lunch Program')).toBe(true);
    });

    it('should return empty array for non-existent campaign', () => {
      const result = getDonationsByCampaign('Non-existent Campaign');
      expect(result).toEqual([]);
    });

    it('should filter Digital Learning Initiative donations correctly', () => {
      const digitalLearningDonations = getDonationsByCampaign('Digital Learning Initiative');
      expect(digitalLearningDonations.length).toBe(2);
      expect(digitalLearningDonations.every(d => d.campaign === 'Digital Learning Initiative')).toBe(true);
    });
  });

  // Test getDonationsByDonor
  describe('getDonationsByDonor', () => {
    it('should return all donations when no donor is specified', () => {
      const result = getDonationsByDonor();
      expect(result).toEqual(mockDonations);
      expect(result.length).toBe(8);
    });

    it('should filter donations by donor ID correctly', () => {
      const donorDonations = getDonationsByDonor('donor-001');
      expect(donorDonations.length).toBe(2);
      expect(donorDonations.every(d => d.donorId === 'donor-001')).toBe(true);
    });

    it('should return empty array for non-existent donor', () => {
      const result = getDonationsByDonor('donor-999');
      expect(result).toEqual([]);
    });

    it('should filter single donor correctly', () => {
      const donorDonations = getDonationsByDonor('donor-003');
      expect(donorDonations.length).toBe(1);
      expect(donorDonations[0].donorName).toBe('Education Foundation');
    });
  });

  // Test getImpactMetricsByType
  describe('getImpactMetricsByType', () => {
    it('should return all metrics when no type is specified', () => {
      const result = getImpactMetricsByType();
      expect(result).toEqual(mockImpactMetrics);
      expect(result.length).toBe(8);
    });

    it('should filter metrics by type correctly', () => {
      const mealsServed = getImpactMetricsByType('meals_served');
      expect(mealsServed.length).toBe(2);
      expect(mealsServed.every(m => m.type === 'meals_served')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      const result = getImpactMetricsByType('trees_planted');
      expect(result).toEqual([]);
    });

    it('should filter scholarships correctly', () => {
      const scholarships = getImpactMetricsByType('scholarships_provided');
      expect(scholarships.length).toBe(2);
      expect(scholarships.every(m => m.type === 'scholarships_provided')).toBe(true);
    });
  });

  // Test getImpactMetricsByRegion
  describe('getImpactMetricsByRegion', () => {
    it('should return all metrics when no region is specified', () => {
      const result = getImpactMetricsByRegion();
      expect(result).toEqual(mockImpactMetrics);
      expect(result.length).toBe(8);
    });

    it('should filter metrics by region correctly', () => {
      const asiaCampaigns = getImpactMetricsByRegion('Asia');
      expect(asiaCampaigns.length).toBe(2);
      expect(asiaCampaigns.every(m => m.region === 'Asia')).toBe(true);
    });

    it('should return empty array for non-existent region', () => {
      const result = getImpactMetricsByRegion('Antarctica');
      expect(result).toEqual([]);
    });
  });

  // Test getTotalImpactByType
  describe('getTotalImpactByType', () => {
    it('should calculate total impact correctly for all types', () => {
      const result = getTotalImpactByType();
      
      // Verify structure
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // Check meals_served calculation (150 + 600)
      expect(result['meals_served']).toBeDefined();
      expect(result['meals_served'].total).toBe(750);
      expect(result['meals_served'].description).toBeDefined();
      
      // Check books_distributed calculation (25 + 75 + 15)
      expect(result['books_distributed']).toBeDefined();
      expect(result['books_distributed'].total).toBe(115);
      
      // Check scholarships_provided calculation (2 + 1)
      expect(result['scholarships_provided']).toBeDefined();
      expect(result['scholarships_provided'].total).toBe(3);
      
      // Check students_supported calculation (30)
      expect(result['students_supported']).toBeDefined();
      expect(result['students_supported'].total).toBe(30);
    });

    it('should include description for each impact type', () => {
      const result = getTotalImpactByType();
      
      Object.values(result).forEach(impact => {
        expect(impact.description).toBeDefined();
        expect(typeof impact.description).toBe('string');
      });
    });

    it('should return object with correct number of impact types', () => {
      const result = getTotalImpactByType();
      
      // We have 4 distinct types in mockImpactMetrics
      const types = Object.keys(result);
      expect(types.length).toBe(4);
      expect(types).toContain('meals_served');
      expect(types).toContain('books_distributed');
      expect(types).toContain('scholarships_provided');
      expect(types).toContain('students_supported');
    });
  });

  // Test getRegionalBreakdown
  describe('getRegionalBreakdown', () => {
    it('should calculate regional breakdown correctly', () => {
      const result = getRegionalBreakdown();
      
      // Verify structure
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // Check that all regions from donations are included
      expect(result['North America']).toBeDefined();
      expect(result['Europe']).toBeDefined();
      expect(result['Asia']).toBeDefined();
      expect(result['Africa']).toBeDefined();
      expect(result['South America']).toBeDefined();
    });

    it('should calculate North America correctly', () => {
      const result = getRegionalBreakdown();
      
      // North America has 2 donations (don-001: 500, don-005: 300)
      expect(result['North America'].donations).toBe(2);
      expect(result['North America'].amount).toBe(800);
      // Beneficiaries: imp-001: 150 meals, imp-005: 30 students
      expect(result['North America'].beneficiaries).toBe(180);
    });

    it('should calculate Europe correctly', () => {
      const result = getRegionalBreakdown();
      
      // Europe has 2 donations (don-002: 250, don-007: 150)
      expect(result['Europe'].donations).toBe(2);
      expect(result['Europe'].amount).toBe(400);
      // Beneficiaries: imp-002: 25 books, imp-007: 15 books
      expect(result['Europe'].beneficiaries).toBe(40);
    });

    it('should calculate Asia correctly', () => {
      const result = getRegionalBreakdown();
      
      // Asia has 2 donations (don-003: 1000, don-008: 800)
      expect(result['Asia'].donations).toBe(2);
      expect(result['Asia'].amount).toBe(1800);
      // Beneficiaries: imp-003: 2 scholarships, imp-008: 1 scholarship
      expect(result['Asia'].beneficiaries).toBe(3);
    });

    it('should return correct structure for each region', () => {
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

    it('should calculate total donations and amounts correctly', () => {
      const result = getRegionalBreakdown();
      
      let totalDonations = 0;
      let totalAmount = 0;
      
      Object.values(result).forEach(region => {
        totalDonations += region.donations;
        totalAmount += region.amount;
      });
      
      // We have 8 donations total
      expect(totalDonations).toBe(8);
      // Total amount: 500+250+1000+750+300+2000+150+800 = 5750
      expect(totalAmount).toBe(5750);
    });
  });
});
