import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import './CampaignView.css';

export const CampaignView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch campaigns
    const fetchCampaigns = async () => {
      const mockCampaigns: Campaign[] = [
        {
          id: 'camp-1',
          name: 'School Lunch Program',
          description: 'Providing nutritious meals to students in underserved communities to improve their health and academic performance.',
          goal: 50000,
          raised: 42500,
          region: 'North America',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          impactTypes: ['meals_served', 'students_supported']
        },
        {
          id: 'camp-2',
          name: 'Digital Learning Initiative',
          description: 'Equipping schools with technology and digital resources to enhance modern education and prepare students for the digital age.',
          goal: 75000,
          raised: 58200,
          region: 'Europe',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          impactTypes: ['books_distributed', 'students_supported']
        },
        {
          id: 'camp-3',
          name: 'Scholarship Fund',
          description: 'Supporting talented students from low-income families with scholarships to pursue higher education and break the cycle of poverty.',
          goal: 100000,
          raised: 89500,
          region: 'Asia',
          startDate: '2023-09-01',
          endDate: '2024-08-31',
          impactTypes: ['scholarships_provided', 'students_supported']
        },
        {
          id: 'camp-4',
          name: 'Library Books Drive',
          description: 'Building and stocking community libraries with books and educational materials to promote literacy and lifelong learning.',
          goal: 30000,
          raised: 28750,
          region: 'Africa',
          startDate: '2024-03-01',
          endDate: '2024-09-30',
          impactTypes: ['books_distributed']
        }
      ];

      setTimeout(() => {
        setCampaigns(mockCampaigns);
        setLoading(false);
      }, 800);
    };

    fetchCampaigns();
  }, []);

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

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getImpactIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'meals_served': '🍽️',
      'books_distributed': '📚',
      'students_supported': '🎓',
      'scholarships_provided': '🏆'
    };
    return icons[type] || '💝';
  };

  if (loading) {
    return (
      <div className="campaign-view-loading">
        <div className="loading-spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="campaign-view">
      <div className="campaign-header">
        <h1>Active Campaigns</h1>
        <p>Supporting education and making lasting impact worldwide</p>
      </div>

      <div className="campaign-summary">
        <div className="summary-card">
          <h3>Total Campaigns</h3>
          <p className="summary-number">{campaigns.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Goal</h3>
          <p className="summary-number">
            {formatCurrency(campaigns.reduce((sum, campaign) => sum + campaign.goal, 0))}
          </p>
        </div>
        <div className="summary-card">
          <h3>Total Raised</h3>
          <p className="summary-number">
            {formatCurrency(campaigns.reduce((sum, campaign) => sum + campaign.raised, 0))}
          </p>
        </div>
        <div className="summary-card">
          <h3>Average Progress</h3>
          <p className="summary-number">
            {Math.round(
              campaigns.reduce((sum, campaign) => sum + calculateProgress(campaign.raised, campaign.goal), 0) / campaigns.length
            )}%
          </p>
        </div>
      </div>

      <div className="campaign-grid">
        {campaigns.map((campaign) => {
          const progress = calculateProgress(campaign.raised, campaign.goal);
          const isCompleted = progress >= 100;
          
          return (
            <div key={campaign.id} className={`campaign-card ${isCompleted ? 'completed' : ''}`}>
              <div className="campaign-card-header">
                <h3>{campaign.name}</h3>
                <span className={`campaign-status ${isCompleted ? 'completed' : 'active'}`}>
                  {isCompleted ? '✅ Completed' : '🎯 Active'}
                </span>
              </div>
              
              <p className="campaign-description">{campaign.description}</p>
              
              <div className="campaign-progress">
                <div className="progress-header">
                  <span className="progress-text">
                    {formatCurrency(campaign.raised)} of {formatCurrency(campaign.goal)}
                  </span>
                  <span className="progress-percentage">{progress.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: isCompleted ? '#059669' : '#4f46e5'
                    }}
                  ></div>
                </div>
              </div>

              <div className="campaign-details">
                <div className="detail-item">
                  <span className="detail-label">Region:</span>
                  <span className="detail-value">{campaign.region}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </span>
                </div>
              </div>

              <div className="campaign-impact">
                <h4>Impact Types</h4>
                <div className="impact-types">
                  {campaign.impactTypes.map((type, index) => (
                    <span key={index} className="impact-type-tag">
                      {getImpactIcon(type)} {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};