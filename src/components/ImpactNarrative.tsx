import React, { useState, useEffect, useCallback } from 'react';
import { AzureOpenAIService } from '../services/openai';
import { mockImpactMetrics, getImpactMetricsByRegion } from '../data/mockData';
import './ImpactNarrative.css';

interface ImpactNarrativeProps {
  type: 'summary' | 'donor' | 'campaign';
  donorName?: string;
  donationAmount?: number;
  campaign?: string;
  region?: string;
}

export const ImpactNarrative: React.FC<ImpactNarrativeProps> = ({
  type,
  donorName,
  donationAmount,
  campaign,
  region
}) => {
  const [narrative, setNarrative] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const generateNarrative = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      let generatedNarrative = '';
      
      switch (type) {
        case 'summary':
          const allMetrics = mockImpactMetrics;
          const totalBeneficiaries = allMetrics.reduce((sum, metric) => sum + metric.value, 0);
          generatedNarrative = await AzureOpenAIService.generateImpactSummary(
            region || 'global communities',
            totalBeneficiaries,
            allMetrics
          );
          break;
          
        case 'donor':
          if (donorName && donationAmount && campaign) {
            generatedNarrative = await AzureOpenAIService.generateThankYouMessage(
              donorName,
              donationAmount,
              campaign
            );
          }
          break;
          
        case 'campaign':
          if (campaign && region) {
            const regionMetrics = getImpactMetricsByRegion(region);
            generatedNarrative = await AzureOpenAIService.generateCampaignUpdate(
              campaign,
              region,
              regionMetrics
            );
          }
          break;
      }
      
      setNarrative(generatedNarrative);
    } catch (err) {
      setError('Failed to generate narrative. Please try again.');
      console.error('Narrative generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [type, donorName, donationAmount, campaign, region]);

  useEffect(() => {
    generateNarrative();
  }, [generateNarrative]);

  if (loading) {
    return (
      <div className="impact-narrative loading">
        <div className="narrative-header">
          <div className="ai-icon">🤖</div>
          <h3>Generating Impact Story...</h3>
        </div>
        <div className="loading-animation">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>AI is crafting your personalized impact narrative</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="impact-narrative error">
        <div className="narrative-header">
          <div className="ai-icon error">⚠️</div>
          <h3>Narrative Generation Failed</h3>
        </div>
        <p className="error-message">{error}</p>
        <button onClick={generateNarrative} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  const getTitle = () => {
    switch (type) {
      case 'summary':
        return 'Impact Summary';
      case 'donor':
        return `Thank You, ${donorName || 'Valued Donor'}`;
      case 'campaign':
        return `${campaign || 'Campaign'} Update`;
      default:
        return 'Impact Story';
    }
  };

  return (
    <div className="impact-narrative">
      <div className="narrative-header">
        <div className="ai-icon">🤖</div>
        <div className="narrative-title">
          <h3>{getTitle()}</h3>
          <span className="ai-badge">AI-Generated</span>
        </div>
      </div>
      
      <div className="narrative-content">
        <p>{narrative}</p>
      </div>
      
      <div className="narrative-footer">
        <div className="narrative-meta">
          <span className="powered-by">Powered by Azure OpenAI</span>
          <button onClick={generateNarrative} className="regenerate-button">
            🔄 Regenerate
          </button>
        </div>
      </div>
    </div>
  );
};