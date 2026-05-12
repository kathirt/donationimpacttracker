import React, { useState, useEffect } from 'react';
import { Donor, Donation } from '../types';
import { ImpactNarrative } from './ImpactNarrative';
import { EmailConfirmation } from './EmailConfirmation';
import { downloadReceipt, downloadYearEndSummary } from '../services/receiptService';
import { mockDonors, mockDonations } from '../data/mockData';
import './DonorView.css';

const CURRENT_YEAR = new Date().getFullYear();

export const DonorView: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailTarget, setEmailTarget] = useState<{ donation: Donation; donor: Donor } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setDonors(mockDonors);
      setLoading(false);
    }, 800);
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

  const getDonorDonations = (donorId: string): Donation[] =>
    mockDonations.filter(d => d.donorId === donorId);

  const getLatestDonation = (donorId: string): Donation | undefined => {
    const donations = getDonorDonations(donorId);
    if (donations.length === 0) return undefined;
    return donations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const handleEmailClick = (donor: Donor) => {
    const latest = getLatestDonation(donor.id);
    if (!latest) return;
    setEmailTarget({ donation: latest, donor });
  };

  const handleDownloadReceipt = (donor: Donor) => {
    const latest = getLatestDonation(donor.id);
    if (!latest) return;
    downloadReceipt(latest, donor);
  };

  const handleDownloadYearEnd = (donor: Donor) => {
    const allDonations = getDonorDonations(donor.id);
    if (allDonations.length === 0) return;

    const currentYearDonations = allDonations.filter(
      d => new Date(d.date).getFullYear() === CURRENT_YEAR
    );
    const targetDonations = currentYearDonations.length > 0 ? currentYearDonations : allDonations;
    const year =
      currentYearDonations.length > 0
        ? CURRENT_YEAR
        : new Date(targetDonations[0].date).getFullYear();
    downloadYearEndSummary(donor, targetDonations, year);
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
        <h1>Donor Community</h1>
        <p>Meet the amazing people making a difference</p>
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
              <div className="donor-actions">
                <button
                  className="donor-action-btn receipt-btn"
                  onClick={() => handleDownloadReceipt(donor)}
                  disabled={getDonorDonations(donor.id).length === 0}
                  title="Download latest receipt"
                >
                  ⬇️ Receipt
                </button>
                <button
                  className="donor-action-btn tax-btn"
                  onClick={() => handleDownloadYearEnd(donor)}
                  disabled={getDonorDonations(donor.id).length === 0}
                  title="Download year-end tax summary"
                >
                  📄 Tax Summary
                </button>
                <button
                  className="donor-action-btn email-btn"
                  onClick={() => handleEmailClick(donor)}
                  disabled={getDonorDonations(donor.id).length === 0}
                  title="Email donation confirmation"
                >
                  📧 Email
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {emailTarget && (
        <EmailConfirmation
          donation={emailTarget.donation}
          donor={emailTarget.donor}
          onClose={() => setEmailTarget(null)}
        />
      )}
    </div>
  );
};