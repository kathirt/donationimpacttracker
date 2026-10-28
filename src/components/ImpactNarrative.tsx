import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AzureOpenAIService } from '../services/openai';
import { ImpactDataSource, ImpactMetric } from '../types';
import './ImpactNarrative.css';

interface ImpactNarrativeProps {
  type: 'summary' | 'donor' | 'campaign';
  donorName?: string;
  donationAmount?: number;
  campaign?: string;
  region?: string;
  metrics?: ImpactMetric[];
  dataSource?: ImpactDataSource;
}

const emptyMetrics: ImpactMetric[] = [];

export const ImpactNarrative: React.FC<ImpactNarrativeProps> = ({
  type,
  donorName,
  donationAmount,
  campaign,
  region,
  metrics = emptyMetrics,
  dataSource = 'unavailable'
}) => {
  const [narrative, setNarrative] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const requestId = useRef(0);

  const generateNarrative = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError('');
    setNarrative('');

    if (type !== 'donor' && (dataSource === 'unavailable' || metrics.length === 0)) {
      setNarrative('Not enough verified impact data is available to generate a narrative for the selected filters.');
      setLoading(false);
      return;
    }
    
    try {
      let generatedNarrative = '';
      
      switch (type) {
        case 'summary':
          generatedNarrative = await AzureOpenAIService.generateImpactSummary(
            region || 'global communities',
            metrics,
            dataSource
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
            generatedNarrative = await AzureOpenAIService.generateCampaignUpdate(
              campaign,
              region,
              metrics,
              dataSource
            );
          }
          break;
      }
      
      if (currentRequest === requestId.current) setNarrative(generatedNarrative);
    } catch (err) {
      if (currentRequest === requestId.current) setError('Failed to generate narrative. Please try again.');
      console.error('Narrative generation error:', err);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [type, donorName, donationAmount, campaign, region, metrics, dataSource]);

  useEffect(() => {
    generateNarrative();
    return () => { requestId.current += 1; };
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
          <span className="ai-badge">Demo narrative</span>
        </div>
      </div>
      
      <div className="narrative-content">
        <p>{dataSource === 'sample'
          ? 'Sample data — not verified impact'
          : dataSource === 'verified' && metrics.length > 0
            ? 'Verified activity data'
            : 'Impact data unavailable'}</p>
        <p>{narrative}</p>
      </div>
      
      <div className="narrative-footer">
        <div className="narrative-meta">
          <span className="powered-by">Template-generated preview</span>
          <button onClick={generateNarrative} className="regenerate-button">
            🔄 Regenerate
          </button>
        </div>
      </div>
    </div>
  );
};