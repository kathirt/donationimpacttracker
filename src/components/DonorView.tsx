import React, { useState, useEffect } from 'react';
import { Donor } from '../types';
import { ImpactNarrative } from './ImpactNarrative';
import { NotificationPreferences } from './NotificationPreferences';
import './DonorView.css';

export const DonorView: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch donors
    const fetchDonors = async () => {
      const mockDonors: Donor[] = [
        {
          id: 'donor-1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          totalDonated: 2500,
          donationCount: 8,
          preferredCampaigns: ['School Lunch Program', 'Digital Learning Initiative'],
          joinDate: '2023-03-15'
        },
        {
          id: 'donor-2',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          totalDonated: 1800,
          donationCount: 6,
          preferredCampaigns: ['Scholarship Fund', 'Library Books Drive'],
          joinDate: '2023-05-22'
        },
        {
          id: 'donor-3',
          name: 'Education Foundation',
          email: 'contact@educfoundation.org',
          totalDonated: 15000,
          donationCount: 25,
          preferredCampaigns: ['School Lunch Program', 'Scholarship Fund', 'Digital Learning Initiative'],
          joinDate: '2022-09-10'
        },
        {
          id: 'donor-4',
          name: 'Tech for Good',
          email: 'donate@techforgood.org',
          totalDonated: 8500,
          donationCount: 15,
          preferredCampaigns: ['Digital Learning Initiative', 'Library Books Drive'],
          joinDate: '2023-01-08'
        }
      ];

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
        <div>
          <h1>Donor Community</h1>
          <p>Meet the amazing people making a difference</p>
        </div>
        <button 
          className="preferences-button"
          onClick={() => setShowPreferences(!showPreferences)}
        >
          {showPreferences ? '← Back to Donors' : '⚙️ Notification Settings'}
        </button>
      </div>

      {showPreferences && (
        <div className="preferences-container">
          <NotificationPreferences 
            donorId="donor-001"
            initialPreferences={donors[0]?.notificationPreferences}
          />
        </div>
      )}

      {!showPreferences && (
        <>
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
              <div key={donor.id} className="donor-card">
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
        </>
      )}
    </div>
  );
};