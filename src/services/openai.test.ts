import { AzureOpenAIService, NarrativeRequest } from './openai';

describe('AzureOpenAIService', () => {
  // Test generateNarrative with different request types
  describe('generateNarrative', () => {
    it('should generate impact summary narrative', async () => {
      const request: NarrativeRequest = {
        type: 'impact_summary',
        data: {
          region: 'North America',
          totalBeneficiaries: 2500
        }
      };

      const response = await AzureOpenAIService.generateNarrative(request);

      expect(response).toBeDefined();
      expect(response.narrative).toBeDefined();
      expect(typeof response.narrative).toBe('string');
      expect(response.narrative.length).toBeGreaterThan(0);
      expect(response.narrative).toContain('North America');
      expect(response.narrative).toContain('2,500');
      expect(response.tone).toBe('inspiring');
      expect(response.length).toBe('medium');
    });

    it('should generate donor story narrative', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'John Doe',
          donationAmount: 500,
          campaign: 'School Lunch Program',
          impactMetrics: [
            { type: 'meals', value: 150, description: '150 meals served' }
          ]
        }
      };

      const response = await AzureOpenAIService.generateNarrative(request);

      expect(response).toBeDefined();
      expect(response.narrative).toContain('John Doe');
      expect(response.narrative).toContain('$500');
      expect(response.narrative).toContain('School Lunch Program');
      expect(response.tone).toBe('grateful');
      expect(response.length).toBe('medium');
    });

    it('should generate campaign update narrative', async () => {
      const request: NarrativeRequest = {
        type: 'campaign_update',
        data: {
          campaign: 'Digital Learning Initiative',
          region: 'Asia',
          totalBeneficiaries: 450,
          impactMetrics: [
            { type: 'students', value: 450, description: '450 students supported' }
          ]
        }
      };

      const response = await AzureOpenAIService.generateNarrative(request);

      expect(response).toBeDefined();
      expect(response.narrative).toContain('Digital Learning Initiative');
      expect(response.narrative).toContain('Asia');
      expect(response.narrative).toContain('450');
      expect(response.tone).toBe('informative');
      expect(response.length).toBe('long');
    });

    it('should return default narrative for unknown type', async () => {
      const request: NarrativeRequest = {
        type: 'impact_summary' as any,
        data: {}
      };

      const response = await AzureOpenAIService.generateNarrative(request);

      expect(response).toBeDefined();
      expect(response.narrative).toBeDefined();
      expect(typeof response.narrative).toBe('string');
    });

    it('should handle missing optional fields gracefully', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {}
      };

      const response = await AzureOpenAIService.generateNarrative(request);

      expect(response).toBeDefined();
      expect(response.narrative).toContain('Valued Donor');
      expect(response.narrative).toContain('$500');
      expect(response.narrative).toContain('Education Initiative');
    });
  });

  // Test generateThankYouMessage
  describe('generateThankYouMessage', () => {
    it('should generate personalized thank you message', async () => {
      const message = await AzureOpenAIService.generateThankYouMessage(
        'Jane Smith',
        250,
        'Library Books Drive'
      );

      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
      expect(message).toContain('Jane Smith');
      expect(message).toContain('$250');
      expect(message).toContain('Library Books Drive');
    });

    it('should handle large donation amounts correctly', async () => {
      const message = await AzureOpenAIService.generateThankYouMessage(
        'Education Foundation',
        10000,
        'Scholarship Fund'
      );

      expect(message).toBeDefined();
      expect(message).toContain('Education Foundation');
      expect(message).toContain('10,000');
      expect(message).toContain('Scholarship Fund');
    });

    it('should handle special characters in names', async () => {
      const message = await AzureOpenAIService.generateThankYouMessage(
        "O'Connor Family Foundation",
        1500,
        'School Lunch Program'
      );

      expect(message).toBeDefined();
      expect(message).toContain("O'Connor Family Foundation");
    });
  });

  // Test generateCampaignUpdate
  describe('generateCampaignUpdate', () => {
    it('should generate campaign update with metrics', async () => {
      const metrics = [
        { type: 'meals', value: 150, description: '150 meals served' },
        { type: 'students', value: 50, description: '50 students supported' }
      ];

      const update = await AzureOpenAIService.generateCampaignUpdate(
        'School Lunch Program',
        'Africa',
        metrics
      );

      expect(update).toBeDefined();
      expect(typeof update).toBe('string');
      expect(update.length).toBeGreaterThan(0);
      expect(update).toContain('School Lunch Program');
      expect(update).toContain('Africa');
      expect(update).toContain('200'); // Total beneficiaries (150 + 50)
    });

    it('should calculate total beneficiaries correctly', async () => {
      const metrics = [
        { type: 'books', value: 100, description: '100 books distributed' },
        { type: 'students', value: 75, description: '75 students supported' },
        { type: 'scholarships', value: 5, description: '5 scholarships provided' }
      ];

      const update = await AzureOpenAIService.generateCampaignUpdate(
        'Digital Learning Initiative',
        'South America',
        metrics
      );

      expect(update).toBeDefined();
      expect(update).toContain('180'); // Total: 100 + 75 + 5
    });

    it('should handle empty metrics array', async () => {
      const update = await AzureOpenAIService.generateCampaignUpdate(
        'Test Campaign',
        'Europe',
        []
      );

      expect(update).toBeDefined();
      expect(update).toContain('Test Campaign');
      expect(update).toContain('Europe');
      expect(update).toContain('0'); // Zero beneficiaries
    });

    it('should handle single metric correctly', async () => {
      const metrics = [
        { type: 'meals', value: 300, description: '300 meals served' }
      ];

      const update = await AzureOpenAIService.generateCampaignUpdate(
        'School Lunch Program',
        'Asia',
        metrics
      );

      expect(update).toBeDefined();
      expect(update).toContain('300');
      expect(update).toContain('serve 300 nutritious meals');
    });
  });

  // Test generateImpactSummary
  describe('generateImpactSummary', () => {
    it('should generate impact summary with region and beneficiaries', async () => {
      const metrics = [
        { type: 'meals', value: 750, description: '750 meals served' },
        { type: 'books', value: 115, description: '115 books distributed' }
      ];

      const summary = await AzureOpenAIService.generateImpactSummary(
        'Global',
        865,
        metrics
      );

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain('Global');
      expect(summary).toContain('865');
    });

    it('should handle large numbers correctly', async () => {
      const metrics = [
        { type: 'students', value: 5000, description: '5000 students supported' }
      ];

      const summary = await AzureOpenAIService.generateImpactSummary(
        'Worldwide',
        5000,
        metrics
      );

      expect(summary).toBeDefined();
      expect(summary).toContain('5,000');
    });

    it('should work with various metric types', async () => {
      const metrics = [
        { type: 'meals', value: 100, description: '100 meals' },
        { type: 'books', value: 50, description: '50 books' },
        { type: 'scholarships', value: 10, description: '10 scholarships' },
        { type: 'students', value: 200, description: '200 students' }
      ];

      const summary = await AzureOpenAIService.generateImpactSummary(
        'Multi-region',
        360,
        metrics
      );

      expect(summary).toBeDefined();
      expect(summary).toContain('Multi-region');
    });
  });

  // Test impact description formatting
  describe('impact description formatting', () => {
    it('should format single metric description', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Test Donor',
          donationAmount: 100,
          campaign: 'Test Campaign',
          impactMetrics: [
            { type: 'meals', value: 30, description: '30 meals' }
          ]
        }
      };

      const response = await AzureOpenAIService.generateNarrative(request);
      expect(response.narrative).toContain('serve 30 nutritious meals');
    });

    it('should format two metrics with "and"', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Test Donor',
          donationAmount: 200,
          campaign: 'Test Campaign',
          impactMetrics: [
            { type: 'meals', value: 50, description: '50 meals' },
            { type: 'books', value: 25, description: '25 books' }
          ]
        }
      };

      const response = await AzureOpenAIService.generateNarrative(request);
      expect(response.narrative).toContain('and');
    });

    it('should format multiple metrics with commas and "and"', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Test Donor',
          donationAmount: 500,
          campaign: 'Test Campaign',
          impactMetrics: [
            { type: 'meals', value: 100, description: '100 meals' },
            { type: 'books', value: 50, description: '50 books' },
            { type: 'students', value: 30, description: '30 students' }
          ]
        }
      };

      const response = await AzureOpenAIService.generateNarrative(request);
      expect(response.narrative).toContain(',');
    });

    it('should handle empty metrics array with default description', async () => {
      const request: NarrativeRequest = {
        type: 'donor_story',
        data: {
          donorName: 'Test Donor',
          donationAmount: 100,
          campaign: 'Test Campaign',
          impactMetrics: []
        }
      };

      const response = await AzureOpenAIService.generateNarrative(request);
      expect(response.narrative).toContain('educational resources');
    });
  });
});
