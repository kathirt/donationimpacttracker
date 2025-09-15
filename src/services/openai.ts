// Azure OpenAI service for generating impact narratives and donor communications
export interface NarrativeRequest {
  type: 'impact_summary' | 'donor_story' | 'campaign_update';
  data: {
    donorName?: string;
    donationAmount?: number;
    campaign?: string;
    region?: string;
    impactMetrics?: {
      type: string;
      value: number;
      description: string;
    }[];
    totalBeneficiaries?: number;
  };
}

export interface NarrativeResponse {
  narrative: string;
  tone: 'grateful' | 'inspiring' | 'informative';
  length: 'short' | 'medium' | 'long';
}

// Mock Azure OpenAI service - in production this would call Azure OpenAI API
export class AzureOpenAIService {
  private static baseUrl = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT || 'https://your-openai-resource.openai.azure.com';
  private static apiKey = process.env.REACT_APP_AZURE_OPENAI_KEY || 'your-api-key';
  private static deploymentName = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4';

  static async generateNarrative(request: NarrativeRequest): Promise<NarrativeResponse> {
    // For demo purposes, we'll return mock responses
    // In production, this would call Azure OpenAI API
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
      
      return this.getMockNarrative(request);
    } catch (error) {
      console.error('Error generating narrative:', error);
      throw new Error('Failed to generate narrative');
    }
  }

  private static getMockNarrative(request: NarrativeRequest): NarrativeResponse {
    const { type, data } = request;

    switch (type) {
      case 'impact_summary':
        return {
          narrative: `Through the generosity of donors like you, we've achieved remarkable impact in ${data.region || 'communities worldwide'}. Your collective contributions have reached ${data.totalBeneficiaries?.toLocaleString() || '2,500'} beneficiaries across our education programs. From providing essential school supplies to funding nutrition programs, every donation creates a ripple effect of positive change. The children and families we serve are not just statistics – they're individuals whose lives are being transformed through education and support.`,
          tone: 'inspiring',
          length: 'medium'
        };

      case 'donor_story':
        return {
          narrative: `Dear ${data.donorName || 'Valued Donor'}, your generous contribution of $${data.donationAmount?.toLocaleString() || '500'} to the ${data.campaign || 'Education Initiative'} is making a real difference. Thanks to supporters like you, we've been able to ${this.getImpactDescription(data.impactMetrics)}. Your donation represents hope, opportunity, and a brighter future for the children we serve. We're grateful for your trust in our mission and excited to share more updates about the impact you're helping to create.`,
          tone: 'grateful',
          length: 'medium'
        };

      case 'campaign_update':
        return {
          narrative: `The ${data.campaign || 'Education Campaign'} continues to show incredible progress in ${data.region || 'our target communities'}. Since launch, we've seen ${data.totalBeneficiaries?.toLocaleString() || '450'} students directly benefit from this initiative. Our recent achievements include ${this.getImpactDescription(data.impactMetrics)}. As we move forward, we remain committed to transparency and accountability, ensuring every dollar donated creates maximum impact for the children and families we serve.`,
          tone: 'informative',
          length: 'long'
        };

      default:
        return {
          narrative: 'Thank you for your continued support of our education initiatives.',
          tone: 'grateful',
          length: 'short'
        };
    }
  }

  private static getImpactDescription(metrics?: { type: string; value: number; description: string }[]): string {
    if (!metrics || metrics.length === 0) {
      return 'provide educational resources and support to students in need';
    }

    const descriptions = metrics.map(metric => {
      switch (metric.type) {
        case 'meals':
          return `serve ${metric.value.toLocaleString()} nutritious meals`;
        case 'books':
          return `distribute ${metric.value.toLocaleString()} educational books`;
        case 'students':
          return `support ${metric.value.toLocaleString()} students`;
        case 'scholarships':
          return `provide ${metric.value.toLocaleString()} scholarships`;
        default:
          return metric.description;
      }
    });

    if (descriptions.length === 1) {
      return descriptions[0];
    } else if (descriptions.length === 2) {
      return `${descriptions[0]} and ${descriptions[1]}`;
    } else {
      const lastDescription = descriptions.pop();
      return `${descriptions.join(', ')}, and ${lastDescription}`;
    }
  }

  // Generate personalized thank you message
  static async generateThankYouMessage(donorName: string, amount: number, campaign: string): Promise<string> {
    const request: NarrativeRequest = {
      type: 'donor_story',
      data: {
        donorName,
        donationAmount: amount,
        campaign
      }
    };

    const response = await this.generateNarrative(request);
    return response.narrative;
  }

  // Generate campaign progress update
  static async generateCampaignUpdate(campaign: string, region: string, metrics: any[]): Promise<string> {
    const request: NarrativeRequest = {
      type: 'campaign_update',
      data: {
        campaign,
        region,
        impactMetrics: metrics,
        totalBeneficiaries: metrics.reduce((sum, m) => sum + m.value, 0)
      }
    };

    const response = await this.generateNarrative(request);
    return response.narrative;
  }

  // Generate overall impact summary
  static async generateImpactSummary(region: string, totalBeneficiaries: number, metrics: any[]): Promise<string> {
    const request: NarrativeRequest = {
      type: 'impact_summary',
      data: {
        region,
        totalBeneficiaries,
        impactMetrics: metrics
      }
    };

    const response = await this.generateNarrative(request);
    return response.narrative;
  }
}