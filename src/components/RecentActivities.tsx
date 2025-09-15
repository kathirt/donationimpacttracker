import React, { useState, useEffect } from 'react';
import { Donation, ImpactMetric, FilterOptions } from '../types';
import './RecentActivities.css';

interface RecentActivitiesProps {
  filters: FilterOptions;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ filters }) => {
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [recentImpacts, setRecentImpacts] = useState<ImpactMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch recent activities
    const fetchRecentActivities = async () => {
      setLoading(true);
      
      // Mock data for recent donations
      const mockDonations: Donation[] = [
        {
          id: '1',
          donorId: 'donor-1',
          donorName: 'John Doe',
          amount: 500,
          date: '2024-01-15',
          campaign: 'School Lunch Program',
          region: 'North America'
        },
        {
          id: '2',
          donorId: 'donor-2',
          donorName: 'Jane Smith',
          amount: 250,
          date: '2024-01-14',
          campaign: 'Digital Learning Initiative',
          region: 'Europe'
        },
        {
          id: '3',
          donorId: 'donor-3',
          donorName: 'Education Foundation',
          amount: 1000,
          date: '2024-01-13',
          campaign: 'Scholarship Fund',
          region: 'Asia'
        },
        {
          id: '4',
          donorId: 'donor-4',
          donorName: 'Tech for Good',
          amount: 750,
          date: '2024-01-12',
          campaign: 'Library Books Drive',
          region: 'Africa'
        }
      ];

      // Mock data for recent impacts
      const mockImpacts: ImpactMetric[] = [
        {
          id: '1',
          donationId: '1',
          type: 'meals_served',
          value: 150,
          description: '150 meals served to students in rural schools',
          region: 'North America',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          date: '2024-01-15'
        },
        {
          id: '2',
          donationId: '2',
          type: 'books_distributed',
          value: 25,
          description: '25 digital learning tablets distributed',
          region: 'Europe',
          coordinates: { latitude: 51.5074, longitude: -0.1278 },
          date: '2024-01-14'
        },
        {
          id: '3',
          donationId: '3',
          type: 'scholarships_provided',
          value: 2,
          description: '2 full scholarships awarded to deserving students',
          region: 'Asia',
          coordinates: { latitude: 35.6762, longitude: 139.6503 },
          date: '2024-01-13'
        },
        {
          id: '4',
          donationId: '4',
          type: 'books_distributed',
          value: 75,
          description: '75 textbooks added to community library',
          region: 'Africa',
          coordinates: { latitude: -1.2921, longitude: 36.8219 },
          date: '2024-01-12'
        }
      ];

      setTimeout(() => {
        setRecentDonations(mockDonations);
        setRecentImpacts(mockImpacts);
        setLoading(false);
      }, 500);
    };

    fetchRecentActivities();
  }, [filters]);

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

  if (loading) {
    return (
      <div className="recent-activities-loading">
        <div className="loading-spinner"></div>
        <p>Loading recent activities...</p>
      </div>
    );
  }

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