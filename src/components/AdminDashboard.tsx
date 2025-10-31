import React, { useState, useEffect } from 'react';
import { AdminAnalytics } from '../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    // Simulate API call to fetch admin analytics
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Generate mock donation trends based on time range
        const generateTrends = (days: number) => {
          const trends = [];
          const now = new Date();
          for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            trends.push({
              date: date.toISOString().split('T')[0],
              amount: Math.floor(Math.random() * 8000) + 2000,
              count: Math.floor(Math.random() * 15) + 5,
            });
          }
          return trends;
        };

        const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
        
        const mockAnalytics: AdminAnalytics = {
          donorEngagement: {
            totalDonors: 247,
            activeDonors: 189,
            newDonors: 34,
            retentionRate: 76.5,
            averageDonation: 485.50,
            topDonors: [
              { id: 'd1', name: 'Education Foundation', totalDonated: 15000, lastDonation: '2024-10-28' },
              { id: 'd2', name: 'Tech for Good', totalDonated: 8500, lastDonation: '2024-10-25' },
              { id: 'd3', name: 'Community Trust', totalDonated: 6200, lastDonation: '2024-10-30' },
              { id: 'd4', name: 'Green Future Fund', totalDonated: 5800, lastDonation: '2024-10-27' },
              { id: 'd5', name: 'Hope Foundation', totalDonated: 4500, lastDonation: '2024-10-29' },
            ],
          },
          donationTrends: generateTrends(daysMap[timeRange]),
          campaignPerformance: [
            { campaignId: 'c1', name: 'School Lunch Program', raised: 42500, goal: 50000, donorCount: 85, avgDonation: 500 },
            { campaignId: 'c2', name: 'Digital Learning', raised: 58200, goal: 75000, donorCount: 102, avgDonation: 570 },
            { campaignId: 'c3', name: 'Scholarship Fund', raised: 89500, goal: 100000, donorCount: 145, avgDonation: 617 },
            { campaignId: 'c4', name: 'Library Books', raised: 28750, goal: 30000, donorCount: 68, avgDonation: 423 },
          ],
          regionalBreakdown: [
            { region: 'North America', donations: 420, amount: 78000, donors: 125 },
            { region: 'Europe', donations: 315, amount: 52000, donors: 89 },
            { region: 'Asia', donations: 298, amount: 35000, donors: 67 },
            { region: 'Africa', donations: 214, amount: 20420, donors: 45 },
          ],
        };
        
        setTimeout(() => {
          setAnalytics(mockAnalytics);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching admin analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleExportData = () => {
    if (!analytics) return;
    
    const data = JSON.stringify(analytics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="admin-dashboard-error">
        <p>Failed to load analytics data. Please try again later.</p>
      </div>
    );
  }

  const COLORS = ['#4f46e5', '#059669', '#dc2626', '#f59e0b', '#8b5cf6'];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🔧 Admin & Analytics Dashboard</h1>
          <p>Advanced insights for tracking donations, donor engagement, and overall impact</p>
        </div>
        <div className="admin-header-actions">
          <select 
            className="time-range-selector"
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="export-button" onClick={handleExportData}>
            📥 Export Data
          </button>
        </div>
      </div>

      {/* Donor Engagement Section */}
      <div className="analytics-section">
        <h2>👥 Donor Engagement Metrics</h2>
        <div className="engagement-grid">
          <div className="engagement-card">
            <div className="card-icon">👤</div>
            <div className="card-content">
              <h3>Total Donors</h3>
              <p className="metric-value">{formatNumber(analytics.donorEngagement.totalDonors)}</p>
              <span className="metric-sublabel">All time</span>
            </div>
          </div>
          <div className="engagement-card">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>Active Donors</h3>
              <p className="metric-value">{formatNumber(analytics.donorEngagement.activeDonors)}</p>
              <span className="metric-sublabel">Last 90 days</span>
            </div>
          </div>
          <div className="engagement-card">
            <div className="card-icon">🌟</div>
            <div className="card-content">
              <h3>New Donors</h3>
              <p className="metric-value">{formatNumber(analytics.donorEngagement.newDonors)}</p>
              <span className="metric-sublabel">This month</span>
            </div>
          </div>
          <div className="engagement-card highlight">
            <div className="card-icon">🔄</div>
            <div className="card-content">
              <h3>Retention Rate</h3>
              <p className="metric-value">{analytics.donorEngagement.retentionRate}%</p>
              <span className="metric-sublabel">Excellent</span>
            </div>
          </div>
          <div className="engagement-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Avg Donation</h3>
              <p className="metric-value">{formatCurrency(analytics.donorEngagement.averageDonation)}</p>
              <span className="metric-sublabel">Per donor</span>
            </div>
          </div>
        </div>

        {/* Top Donors Table */}
        <div className="top-donors-section">
          <h3>🏆 Top Donors</h3>
          <div className="donors-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Donor Name</th>
                  <th>Total Donated</th>
                  <th>Last Donation</th>
                </tr>
              </thead>
              <tbody>
                {analytics.donorEngagement.topDonors.map((donor, index) => (
                  <tr key={donor.id}>
                    <td className="rank-cell">
                      <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                    </td>
                    <td className="donor-name">{donor.name}</td>
                    <td className="amount">{formatCurrency(donor.totalDonated)}</td>
                    <td className="date">{formatDate(donor.lastDonation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Donation Trends Section */}
      <div className="analytics-section">
        <h2>📈 Donation Trends</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.donationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const CHART_KEYS = { AMOUNT: 'amount', COUNT: 'count' } as const;
                  if (name === CHART_KEYS.AMOUNT) return [formatCurrency(value), 'Amount'];
                  return [value, 'Count'];
                }}
                labelFormatter={formatDate}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="amount" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={false}
                name="Amount"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="count" 
                stroke="#059669" 
                strokeWidth={2}
                dot={false}
                name="Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Performance Section */}
      <div className="analytics-section">
        <h2>🎯 Campaign Performance</h2>
        <div className="campaigns-grid">
          {analytics.campaignPerformance.map((campaign) => {
            const progress = (campaign.raised / campaign.goal) * 100;
            return (
              <div key={campaign.campaignId} className="campaign-analytics-card">
                <h3>{campaign.name}</h3>
                <div className="campaign-stats">
                  <div className="stat">
                    <span className="stat-label">Raised</span>
                    <span className="stat-value">{formatCurrency(campaign.raised)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Goal</span>
                    <span className="stat-value">{formatCurrency(campaign.goal)}</span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <span className="progress-label">{progress.toFixed(1)}%</span>
                </div>
                <div className="campaign-metrics">
                  <div className="metric-item">
                    <span className="metric-icon">👥</span>
                    <span>{campaign.donorCount} donors</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-icon">💵</span>
                    <span>{formatCurrency(campaign.avgDonation)} avg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Breakdown Section */}
      <div className="analytics-section">
        <h2>🌍 Regional Breakdown</h2>
        <div className="regional-container">
          <div className="chart-wrapper">
            <h3>Donations by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.regionalBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, donations }) => `${region}: ${donations}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="donations"
                >
                  {analytics.regionalBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-wrapper">
            <h3>Amount by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.regionalBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Stats Table */}
        <div className="regional-table">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Donations</th>
                <th>Total Amount</th>
                <th>Unique Donors</th>
                <th>Avg Donation</th>
              </tr>
            </thead>
            <tbody>
              {analytics.regionalBreakdown.map((region) => (
                <tr key={region.region}>
                  <td className="region-name">{region.region}</td>
                  <td>{formatNumber(region.donations)}</td>
                  <td className="amount">{formatCurrency(region.amount)}</td>
                  <td>{formatNumber(region.donors)}</td>
                  <td>{formatCurrency(region.amount / region.donations)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      <div className="analytics-section summary-section">
        <h2>📊 Executive Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Impact</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="summary-icon">💰</span>
                <div>
                  <p className="summary-value">
                    {formatCurrency(analytics.regionalBreakdown.reduce((sum, r) => sum + r.amount, 0))}
                  </p>
                  <p className="summary-label">Total Raised</p>
                </div>
              </div>
              <div className="summary-stat">
                <span className="summary-icon">🎁</span>
                <div>
                  <p className="summary-value">
                    {formatNumber(analytics.regionalBreakdown.reduce((sum, r) => sum + r.donations, 0))}
                  </p>
                  <p className="summary-label">Total Donations</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <h3>Top Performers</h3>
            <div className="summary-highlights">
              <div className="highlight-item">
                <span className="highlight-label">Best Campaign:</span>
                <span className="highlight-value">
                  {analytics.campaignPerformance.reduce((best, curr) => 
                    curr.raised > best.raised ? curr : best
                  ).name}
                </span>
              </div>
              <div className="highlight-item">
                <span className="highlight-label">Top Region:</span>
                <span className="highlight-value">
                  {analytics.regionalBreakdown.reduce((best, curr) => 
                    curr.amount > best.amount ? curr : best
                  ).region}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
