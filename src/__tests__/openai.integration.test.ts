import { AzureOpenAIService, NarrativeRequest } from '../services/openai';

describe('Azure OpenAI Service Integration Tests', () => {
  describe('generateNarrative', () => {
    it('should generate impact summary narrative', async () => {
      const request: NarrativeRequest = {
        type: 'impact_summary',
        data: {
          region: 'North America',
          totalBeneficiaries: 2500,
          impactMetrics: [
            { type: 'meals', value: 5000, description: 'Meals served' },
            { type: 'books', value: 1000, description: 'Books distributed' }
          ]
        }
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result).toBeDefined();
      expect(result.narrative).toBeTruthy();
      expect(result.tone).toBe('inspiring');
      expect(result.length).toBe('medium');
      expect(result.narrative).toContain('North America');
      expect(result.narrative.length).toBeGreaterThan(50);
    });

    it('should generate donor story narrative', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'John Doe',
          donationAmount: 1000,
          campaign: 'Education Initiative',
          impactMetrics: [
            { type: 'students', value: 50, description: 'Students supported' }
          ]
        }
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result).toBeDefined();
      expect(result.narrative).toBeTruthy();
      expect(result.tone).toBe('grateful');
      expect(result.length).toBe('medium');
      expect(result.narrative).toContain('John Doe');
      expect(result.narrative).toContain('1,000');
      expect(result.narrative).toContain('Education Initiative');
    });

    it('should generate campaign update narrative', async () => {
      const request: NarrativeRequest = {
        type: 'campaign_update',
        data: {
          campaign: 'School Supplies Drive',
          region: 'Asia',
          totalBeneficiaries: 450,
          impactMetrics: [
            { type: 'books', value: 2000, description: 'Books distributed' },
            { type: 'students', value: 450, description: 'Students reached' }
          ]
        }
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result).toBeDefined();
      expect(result.narrative).toBeTruthy();
      expect(result.tone).toBe('informative');
      expect(result.length).toBe('long');
      expect(result.narrative).toContain('School Supplies Drive');
      expect(result.narrative).toContain('Asia');
    });

    it('should handle narrative generation with minimal data', async () => {
      const request: NarrativeRequest = {
        type: 'impact_summary',
        data: {}
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result).toBeDefined();
      expect(result.narrative).toBeTruthy();
      expect(['grateful', 'inspiring', 'informative']).toContain(result.tone);
      expect(['short', 'medium', 'long']).toContain(result.length);
    });

    it('should simulate API call delay', async () => {
      const request: NarrativeRequest = {
        type: 'impact_summary',
        data: {
          region: 'Europe',
          totalBeneficiaries: 1000
        }
      };

      const startTime = Date.now();
      await AzureOpenAIService.generateNarrative(request);
      const endTime = Date.now();

      // Should take at least 1 second due to simulated delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(900);
    });
  });

  describe('generateThankYouMessage', () => {
    it('should generate personalized thank you message', async () => {
      const result = await AzureOpenAIService.generateThankYouMessage(
        'Jane Smith',
        500,
        'Digital Learning Initiative'
      );

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Jane Smith');
      expect(result).toContain('500');
      expect(result).toContain('Digital Learning Initiative');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should handle large donation amounts', async () => {
      const result = await AzureOpenAIService.generateThankYouMessage(
        'Bill Gates',
        1000000,
        'Global Education Fund'
      );

      expect(result).toBeTruthy();
      expect(result).toContain('Bill Gates');
      expect(result).toContain('1,000,000');
    });

    it('should handle small donation amounts', async () => {
      const result = await AzureOpenAIService.generateThankYouMessage(
        'Student Donor',
        10,
        'Micro Donations'
      );

      expect(result).toBeTruthy();
      expect(result).toContain('Student Donor');
      expect(result).toContain('10');
    });
  });

  describe('generateCampaignUpdate', () => {
    it('should generate campaign progress update', async () => {
      const metrics = [
        { type: 'meals', value: 5000, description: 'Meals served' },
        { type: 'books', value: 2000, description: 'Books distributed' },
        { type: 'students', value: 1000, description: 'Students supported' }
      ];

      const result = await AzureOpenAIService.generateCampaignUpdate(
        'Education for All',
        'Africa',
        metrics
      );

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Education for All');
      expect(result).toContain('Africa');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should handle campaign update with single metric', async () => {
      const metrics = [
        { type: 'scholarships', value: 50, description: 'Scholarships provided' }
      ];

      const result = await AzureOpenAIService.generateCampaignUpdate(
        'Scholarship Fund',
        'South America',
        metrics
      );

      expect(result).toBeTruthy();
      expect(result).toContain('Scholarship Fund');
    });

    it('should handle empty metrics array', async () => {
      const result = await AzureOpenAIService.generateCampaignUpdate(
        'New Campaign',
        'Australia',
        []
      );

      expect(result).toBeTruthy();
      expect(result).toContain('New Campaign');
      expect(result).toContain('Australia');
    });
  });

  describe('generateImpactSummary', () => {
    it('should generate overall impact summary', async () => {
      const metrics = [
        { type: 'meals', value: 10000, description: 'Meals served' },
        { type: 'books', value: 5000, description: 'Books distributed' }
      ];

      const result = await AzureOpenAIService.generateImpactSummary(
        'Global',
        5000,
        metrics
      );

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Global');
      expect(result).toContain('5,000');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should handle regional impact summary', async () => {
      const metrics = [
        { type: 'students', value: 2000, description: 'Students supported' }
      ];

      const result = await AzureOpenAIService.generateImpactSummary(
        'Southeast Asia',
        2000,
        metrics
      );

      expect(result).toBeTruthy();
      expect(result).toContain('Southeast Asia');
    });
  });

  describe('Impact descriptions formatting', () => {
    it('should format meals impact correctly', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Test Donor',
          donationAmount: 500,
          campaign: 'Feeding Program',
          impactMetrics: [
            { type: 'meals', value: 1000, description: 'Meals served' }
          ]
        }
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result.narrative).toContain('1,000');
    });

    it('should format books impact correctly', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Test Donor',
          donationAmount: 300,
          campaign: 'Library Project',
          impactMetrics: [
            { type: 'books', value: 500, description: 'Books distributed' }
          ]
        }
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result.narrative).toBeTruthy();
    });

    it('should format students impact correctly', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Test Donor',
          donationAmount: 2000,
          campaign: 'Student Support',
          impactMetrics: [
            { type: 'students', value: 100, description: 'Students supported' }
          ]
        }
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result.narrative).toBeTruthy();
    });

    it('should format scholarships impact correctly', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Test Donor',
          donationAmount: 10000,
          campaign: 'Scholarship Fund',
          impactMetrics: [
            { type: 'scholarships', value: 5, description: 'Scholarships provided' }
          ]
        }
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result.narrative).toBeTruthy();
    });

    it('should handle multiple impact types with proper formatting', async () => {
      const request: NarrativeRequest = {
        type: 'campaign_update',
        data: {
          campaign: 'Multi-Impact Campaign',
          region: 'Global',
          totalBeneficiaries: 10000,
          impactMetrics: [
            { type: 'meals', value: 5000, description: 'Meals served' },
            { type: 'books', value: 2000, description: 'Books distributed' },
            { type: 'students', value: 1000, description: 'Students supported' },
            { type: 'scholarships', value: 50, description: 'Scholarships provided' }
          ]
        }
      };

      const result = await AzureOpenAIService.generateNarrative(request);

      expect(result.narrative).toBeTruthy();
      expect(result.narrative.length).toBeGreaterThan(100);
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      // This test verifies the service handles errors without crashing
      const request: NarrativeRequest = {
        type: 'impact_summary',
        data: {
          region: 'Test Region'
        }
      };

      // Should not throw error
      await expect(AzureOpenAIService.generateNarrative(request)).resolves.toBeDefined();
    });
  });

  describe('Narrative consistency', () => {
    it('should generate consistent structure for similar requests', async () => {
      const request1: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Alice',
          donationAmount: 500,
          campaign: 'Campaign A'
        }
      };

      const request2: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Bob',
          donationAmount: 600,
          campaign: 'Campaign B'
        }
      };

      const result1 = await AzureOpenAIService.generateNarrative(request1);
      const result2 = await AzureOpenAIService.generateNarrative(request2);

      expect(result1.tone).toBe(result2.tone);
      expect(result1.length).toBe(result2.length);
      expect(result1.narrative).toContain('Alice');
      expect(result2.narrative).toContain('Bob');
    });
  });
});
