import React, { useState } from 'react';
import { Donor, Donation } from '../types';
import { mockDonors, mockDonations } from '../data/mockData';
import { downloadYearEndSummary } from '../services/receiptService';
import './TaxDocuments.css';

const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const TaxDocuments: React.FC = () => {
  const [selectedDonorId, setSelectedDonorId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const selectedDonor: Donor | undefined = mockDonors.find(d => d.id === selectedDonorId);

  const donorDonations: Donation[] = selectedDonorId
    ? mockDonations.filter(
        d => d.donorId === selectedDonorId && new Date(d.date).getFullYear() === selectedYear
      )
    : [];

  const totalAmount = donorDonations.reduce((sum, d) => sum + d.amount, 0);

  const campaignBreakdown: { [key: string]: number } = {};
  donorDonations.forEach(d => {
    campaignBreakdown[d.campaign] = (campaignBreakdown[d.campaign] || 0) + d.amount;
  });

  const handleDownload = async () => {
    if (!selectedDonor) return;
    setDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    downloadYearEndSummary(selectedDonor, donorDonations, selectedYear);
    setDownloading(false);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="tax-documents">
      <div className="tax-header">
        <h1>📄 Tax Documents</h1>
        <p>Download year-end donation summaries for your tax records</p>
      </div>

      <div className="tax-controls">
        <div className="control-group">
          <label htmlFor="donor-select" className="control-label">Donor</label>
          <select
            id="donor-select"
            className="control-select"
            value={selectedDonorId}
            onChange={e => {
              setSelectedDonorId(e.target.value);
              setDownloaded(false);
            }}
          >
            <option value="">-- Select a donor --</option>
            {mockDonors.map(donor => (
              <option key={donor.id} value={donor.id}>
                {donor.name} ({donor.email})
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="year-select" className="control-label">Tax Year</label>
          <select
            id="year-select"
            className="control-select"
            value={selectedYear}
            onChange={e => {
              setSelectedYear(Number(e.target.value));
              setDownloaded(false);
            }}
          >
            {AVAILABLE_YEARS.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDonorId && (
        <div className="tax-summary-card">
          <div className="summary-card-header">
            <div className="summary-donor-info">
              <div className="summary-avatar">
                {selectedDonor?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2>{selectedDonor?.name}</h2>
                <p className="summary-email">{selectedDonor?.email}</p>
              </div>
            </div>
            <div className="summary-year-badge">{selectedYear}</div>
          </div>

          {donorDonations.length === 0 ? (
            <div className="no-donations">
              <span>📭</span>
              <p>No donations found for {selectedYear}.</p>
            </div>
          ) : (
            <>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="summary-stat-value">{formatCurrency(totalAmount)}</span>
                  <span className="summary-stat-label">Total Donated</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-stat-value">{donorDonations.length}</span>
                  <span className="summary-stat-label">Donations</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-stat-value">{Object.keys(campaignBreakdown).length}</span>
                  <span className="summary-stat-label">Campaigns</span>
                </div>
              </div>

              <div className="summary-breakdown">
                <h3>Campaign Breakdown</h3>
                <div className="breakdown-list">
                  {Object.entries(campaignBreakdown).map(([campaign, amount]) => (
                    <div key={campaign} className="breakdown-item">
                      <span className="breakdown-campaign">{campaign}</span>
                      <span className="breakdown-amount">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="donations-table-wrapper">
                <h3>Donation History ({selectedYear})</h3>
                <table className="donations-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Campaign</th>
                      <th>Region</th>
                      <th className="amount-col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorDonations
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(d => (
                        <tr key={d.id}>
                          <td>{formatDate(d.date)}</td>
                          <td>{d.campaign}</td>
                          <td>{d.region}</td>
                          <td className="amount-col">{formatCurrency(d.amount)}</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}><strong>Total</strong></td>
                      <td className="amount-col"><strong>{formatCurrency(totalAmount)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="tax-notice-box">
                <span className="tax-notice-icon">ℹ️</span>
                <p>
                  All donations are tax-deductible to the extent allowed by law. No goods or services were provided
                  in exchange for these donations. EIN: 12-3456789.
                </p>
              </div>

              <div className="summary-actions">
                <button
                  className="download-btn"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>⏳ Generating…</>
                  ) : downloaded ? (
                    <>✅ Downloaded!</>
                  ) : (
                    <>⬇️ Download {selectedYear} Tax Summary</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!selectedDonorId && (
        <div className="tax-placeholder">
          <div className="placeholder-icon">📋</div>
          <h3>Select a Donor</h3>
          <p>Choose a donor and tax year above to view and download their year-end donation summary.</p>
        </div>
      )}
    </div>
  );
};
