import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Donor, Donation, ImpactMetric } from '../types';
import { mockDonors, mockDonations, mockImpactMetrics } from '../data/mockData';
import { ImpactNarrative } from './ImpactNarrative';
import './DonorProfile.css';

export const DonorProfile: React.FC = () => {
  const { donorId } = useParams<{ donorId: string }>();
  const navigate = useNavigate();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Donor>>({});

  useEffect(() => {
    // Simulate API call to fetch donor data
    const fetchDonorData = async () => {
      if (!donorId) {
        setLoading(false);
        return;
      }

      // Find donor
      const foundDonor = mockDonors.find(d => d.id === donorId);
      if (!foundDonor) {
        setLoading(false);
        return;
      }

      // Get donor's donations
      const donorDonations = mockDonations.filter(d => d.donorId === donorId);
      
      // Get impact metrics for donor's donations
      const donationIds = donorDonations.map(d => d.id);
      const donorImpact = mockImpactMetrics.filter(m => donationIds.includes(m.donationId));

      setTimeout(() => {
        setDonor(foundDonor);
        setDonations(donorDonations);
        setImpactMetrics(donorImpact);
        setEditForm(foundDonor);
        setLoading(false);
      }, 500);
    };

    fetchDonorData();
  }, [donorId]);

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app, this would call an API to update the donor
    if (donor) {
      const updatedDonor = { ...donor, ...editForm };
      setDonor(updatedDonor);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(donor || {});
    setIsEditing(false);
  };

  const getCumulativeImpact = () => {
    const impact: { [key: string]: number } = {};
    impactMetrics.forEach(metric => {
      const key = metric.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      impact[key] = (impact[key] || 0) + metric.value;
    });
    return impact;
  };

  if (loading) {
    return (
      <div className="donor-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading donor profile...</p>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="donor-profile-error">
        <h2>Donor Not Found</h2>
        <p>The donor profile you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/donors')}>Back to Donors</button>
      </div>
    );
  }

  const cumulativeImpact = getCumulativeImpact();

  return (
    <div className="donor-profile">
      <button className="back-button" onClick={() => navigate('/donors')}>
        ← Back to Donors
      </button>

      <div className="profile-header">
        <div className="profile-avatar">
          <span>{donor.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Name"
                className="edit-input"
              />
              <input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Email"
                className="edit-input"
              />
              <div className="edit-actions">
                <button onClick={handleSave} className="save-button">Save</button>
                <button onClick={handleCancel} className="cancel-button">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{donor.name}</h1>
              <p className="profile-email">{donor.email}</p>
              <button onClick={handleEdit} className="edit-button">Edit Profile</button>
            </>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>Total Donated</h3>
          <p className="stat-value">{formatCurrency(donor.totalDonated)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Donations</h3>
          <p className="stat-value">{donor.donationCount}</p>
        </div>
        <div className="stat-card">
          <h3>Average Donation</h3>
          <p className="stat-value">
            {formatCurrency(donor.totalDonated / donor.donationCount)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Member Since</h3>
          <p className="stat-value-date">{formatDate(donor.joinDate)}</p>
        </div>
      </div>

      {/* Personalized AI Thank You Message */}
      <div className="profile-narrative">
        <ImpactNarrative 
          type="donor"
          donorName={donor.name}
          donationAmount={donor.totalDonated}
          campaign={donor.preferredCampaigns[0]}
        />
      </div>

      {/* Cumulative Impact Section */}
      <div className="cumulative-impact">
        <h2>Your Cumulative Impact</h2>
        <p className="impact-description">
          Here's the tangible difference your {donor.donationCount} donations have made
        </p>
        {Object.keys(cumulativeImpact).length > 0 ? (
          <div className="impact-grid">
            {Object.entries(cumulativeImpact).map(([type, value]) => (
              <div key={type} className="impact-card">
                <div className="impact-icon">
                  {type.includes('Meals') && '🍽️'}
                  {type.includes('Books') && '📚'}
                  {type.includes('Students') && '🎓'}
                  {type.includes('Scholarships') && '🏆'}
                  {!type.includes('Meals') && !type.includes('Books') && 
                   !type.includes('Students') && !type.includes('Scholarships') && '✨'}
                </div>
                <div className="impact-details">
                  <h3>{value.toLocaleString()}</h3>
                  <p>{type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-impact">No impact metrics recorded yet for your donations.</p>
        )}
      </div>

      {/* Donation History Section */}
      <div className="donation-history">
        <h2>Donation History</h2>
        {donations.length > 0 ? (
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td>{formatDate(donation.date)}</td>
                    <td>{donation.campaign}</td>
                    <td className="amount">{formatCurrency(donation.amount)}</td>
                    <td>{donation.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-donations">No donation history available.</p>
        )}
      </div>

      {/* Preferred Campaigns */}
      <div className="preferred-campaigns">
        <h2>Preferred Campaigns</h2>
        <div className="campaign-tags">
          {donor.preferredCampaigns.map((campaign, index) => (
            <span key={index} className="campaign-tag">{campaign}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
