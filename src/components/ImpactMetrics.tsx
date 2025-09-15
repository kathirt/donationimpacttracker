import React from 'react';
import { ImpactSummary } from '../types';
import './ImpactMetrics.css';

interface ImpactMetricsProps {
  summary: ImpactSummary;
}

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const impactCards = [
    {
      title: 'Total Donations',
      value: formatNumber(summary.totalDonations),
      icon: '💰',
      color: '#4f46e5'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(summary.totalAmount),
      icon: '💵',
      color: '#059669'
    },
    {
      title: 'Beneficiaries',
      value: formatNumber(summary.totalBeneficiaries),
      icon: '👥',
      color: '#dc2626'
    }
  ];

  return (
    <div className="impact-metrics">
      <h2>Overall Impact</h2>
      <div className="metrics-grid">
        {impactCards.map((card, index) => (
          <div key={index} className="metric-card" style={{ borderLeftColor: card.color }}>
            <div className="metric-icon">{card.icon}</div>
            <div className="metric-content">
              <h3>{card.title}</h3>
              <p className="metric-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="impact-breakdown">
        <h3>Impact Breakdown</h3>
        <div className="impact-items">
          {Object.entries(summary.impactsByType).map(([type, data]) => (
            <div key={type} className="impact-item">
              <div className="impact-item-header">
                <span className="impact-type">{type.replace('_', ' ').toUpperCase()}</span>
                <span className="impact-count">{formatNumber(data.total)}</span>
              </div>
              <p className="impact-description">{data.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};