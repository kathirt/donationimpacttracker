import { ImpactDataSource, ImpactMetric } from '../types';
import { aggregateImpactMetrics } from '../data/impactData';

type NarrativeMetric = Pick<ImpactMetric, 'type' | 'value' | 'description'>;

// Azure OpenAI service for generating impact narratives and donor communications
export interface NarrativeRequest {
  type: 'impact_summary' | 'donor_story' | 'campaign_update';
  data: {
    donorName?: string;
    donationAmount?: number;
    campaign?: string;
    region?: string;
    impactMetrics?: NarrativeMetric[];
    dataSource?: ImpactDataSource;
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
          narrative: this.getImpactNarrative(data),
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
          narrative: this.getImpactNarrative(data),
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

  private static getImpactNarrative(data: NarrativeRequest['data']): string {
    const totals = Object.values(aggregateImpactMetrics(data.impactMetrics || []));
    if (!data.dataSource || data.dataSource === 'unavailable' || totals.length === 0) {
      return 'Not enough verified impact data is available to generate a narrative for the selected filters.';
    }

    const source = data.dataSource === 'sample'
      ? 'Sample data only — illustrative, not verified impact.'
      : 'Based on verified activity data.';
    const counts = totals.map(metric => `${metric.total.toLocaleString()} ${metric.description}`).join('; ');
    return `${source} For ${data.campaign ? `${data.campaign} in ` : ''}${data.region || 'all regions'}, the selected records show: ${counts}. These activity counts are not a count of unique beneficiaries.`;
  }

  private static getImpactDescription(metrics?: NarrativeMetric[]): string {
    if (!metrics || metrics.length === 0) {
      return 'provide educational resources and support to students in need';
    }

    const descriptions = metrics.map(metric => {
      switch (metric.type) {
        case 'meals_served':
          return `serve ${metric.value.toLocaleString()} nutritious meals`;
        case 'books_distributed':
          return `distribute ${metric.value.toLocaleString()} educational books`;
        case 'tablets_distributed':
          return `distribute ${metric.value.toLocaleString()} learning tablets`;
        case 'students_supported':
          return `support ${metric.value.toLocaleString()} students`;
        case 'scholarships_provided':
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
  static async generateCampaignUpdate(campaign: string, region: string, metrics: NarrativeMetric[], dataSource: ImpactDataSource = 'unavailable'): Promise<string> {
    const request: NarrativeRequest = {
      type: 'campaign_update',
      data: {
        campaign,
        region,
        impactMetrics: metrics,
        dataSource
      }
    };

    const response = await this.generateNarrative(request);
    return response.narrative;
  }

  // Generate overall impact summary
  static async generateImpactSummary(region: string, metrics: NarrativeMetric[], dataSource: ImpactDataSource = 'unavailable'): Promise<string> {
    const request: NarrativeRequest = {
      type: 'impact_summary',
      data: {
        region,
        dataSource,
        impactMetrics: metrics
      }
    };

    const response = await this.generateNarrative(request);
    return response.narrative;
  }
}