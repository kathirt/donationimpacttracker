import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Donor } from '../types';
import { mockDonors } from '../data/mockData';
import { ImpactNarrative } from './ImpactNarrative';
import './DonorView.css';

export const DonorView: React.FC = () => {
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch donors
    const fetchDonors = async () => {
      setTimeout(() => {
        setDonors(mockDonors);
        setLoading(false);
      }, 800);
    };

    fetchDonors();
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="donor-view-loading">
        <div className="loading-spinner"></div>
        <p>Loading donor information...</p>
      </div>
    );
  }

  return (
    <div className="donor-view">
      <div className="donor-header">
        <div className="header-content">
          <h1>Donor Community</h1>
          <p>Meet the amazing people making a difference</p>
        </div>
        <button 
          className="create-profile-button"
          onClick={() => navigate('/donors/create')}
        >
          + Create Profile
        </button>
      </div>

      <div className="donor-stats">
        <div className="stat-card">
          <h3>Total Donors</h3>
          <p className="stat-number">{donors.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Donated</h3>
          <p className="stat-number">
            {formatCurrency(donors.reduce((sum, donor) => sum + donor.totalDonated, 0))}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Donations</h3>
          <p className="stat-number">
            {donors.reduce((sum, donor) => sum + donor.donationCount, 0)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Average Donation</h3>
          <p className="stat-number">
            {formatCurrency(
              donors.reduce((sum, donor) => sum + donor.totalDonated, 0) /
              donors.reduce((sum, donor) => sum + donor.donationCount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Featured Donor Thank You Message */}
      {donors.length > 0 && (
        <div className="featured-donor-narrative">
          <ImpactNarrative 
            type="donor"
            donorName={donors[0].name}
            donationAmount={donors[0].totalDonated}
            campaign={donors[0].preferredCampaigns[0]}
          />
        </div>
      )}

      <div className="donor-grid">
        {donors.map((donor) => (
          <div 
            key={donor.id} 
            className="donor-card" 
            onClick={() => navigate(`/donors/${donor.id}`)}
          >
            <div className="donor-avatar">
              <span>{donor.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="donor-info">
              <h3>{donor.name}</h3>
              <p className="donor-email">{donor.email}</p>
              <div className="donor-metrics">
                <div className="metric">
                  <span className="metric-value">{formatCurrency(donor.totalDonated)}</span>
                  <span className="metric-label">Total Donated</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{donor.donationCount}</span>
                  <span className="metric-label">Donations</span>
                </div>
              </div>
              <div className="donor-campaigns">
                <h4>Preferred Campaigns</h4>
                <div className="campaign-tags">
                  {donor.preferredCampaigns.map((campaign, index) => (
                    <span key={index} className="campaign-tag">{campaign}</span>
                  ))}
                </div>
              </div>
              <div className="donor-join-date">
                <span>Member since {formatDate(donor.joinDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};