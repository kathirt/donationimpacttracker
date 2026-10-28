import React from 'react';
import { Donation, ImpactMetric } from '../types';
import './RecentActivities.css';

interface RecentActivitiesProps {
  donations: Donation[];
  metrics: ImpactMetric[];
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ donations, metrics }) => {
  const recentDonations = donations.slice(0, 4);
  const recentImpacts = metrics.slice(0, 4);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImpactIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'meals_served': '🍽️',
      'books_distributed': '📚',
      'students_supported': '🎓',
      'scholarships_provided': '🏆',
      'trees_planted': '🌱'
    };
    return icons[type] || '💝';
  };

  return (
    <div className="recent-activities">
      <h2>Recent Activities</h2>
      
      <div className="activities-grid">
        <div className="activity-section">
          <h3>Recent Donations</h3>
          <div className="activity-list">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="activity-item donation-item">
                <div className="activity-icon">💰</div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-title">{donation.donorName}</span>
                    <span className="activity-amount">{formatCurrency(donation.amount)}</span>
                  </div>
                  <div className="activity-details">
                    <span className="activity-campaign">{donation.campaign}</span>
                    <span className="activity-region">{donation.region}</span>
                  </div>
                  <div className="activity-date">{formatDate(donation.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-section">
          <h3>Recent Impact</h3>
          <div className="activity-list">
            {recentImpacts.map((impact) => (
              <div key={impact.id} className="activity-item impact-item">
                <div className="activity-icon">{getImpactIcon(impact.type)}</div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-title">{impact.type.replace('_', ' ').toUpperCase()}</span>
                    <span className="activity-value">{impact.value.toLocaleString()}</span>
                  </div>
                  <div className="activity-description">{impact.description}</div>
                  <div className="activity-details">
                    <span className="activity-region">{impact.region}</span>
                    <span className="activity-date">{formatDate(impact.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};