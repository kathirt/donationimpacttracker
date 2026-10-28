import React, { useState, useEffect } from 'react';
import { ImpactSummary, FilterOptions } from '../types';
import { ImpactMetrics } from './ImpactMetrics';
import { FilterBar } from './FilterBar';
import { ImpactChart } from './ImpactChart';
import { RecentActivities } from './RecentActivities';
import { ImpactNarrative } from './ImpactNarrative';
import { impactApi } from '../services/api';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [impactSummary, setImpactSummary] = useState<ImpactSummary | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchImpactSummary = async () => {
      setLoading(true);
      setError(false);
      try {
        const summary = await impactApi.getImpactSummary(filters);
        if (active) setImpactSummary(summary);
      } catch (error) {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchImpactSummary();
    return () => { active = false; };
  }, [filters, retryCount]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Impact Dashboard</h1>
        <p>Track the real-world impact of your donations</p>
      </div>
      
      <FilterBar onFilterChange={handleFilterChange} />

      {loading && (
        <div className="dashboard-loading" role="status">
          <div className="loading-spinner"></div>
          <p>Loading impact data...</p>
        </div>
      )}
      {error && (
        <div className="dashboard-error" role="alert">
          <p>Failed to load impact data. Please retry or change the region.</p>
          <button onClick={() => setRetryCount(count => count + 1)}>Retry</button>
        </div>
      )}
      {!loading && !error && impactSummary && (
        <div className="dashboard-content">
          {/* AI-Generated Impact Narrative */}
          <div className="dashboard-section full-width">
            <ImpactNarrative
              type="summary"
              region={filters.region || 'global'}
            />
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-section">
              <ImpactMetrics summary={impactSummary} />
            </div>

            <div className="dashboard-section">
              <ImpactChart summary={impactSummary} />
            </div>

            <div className="dashboard-section full-width">
              <RecentActivities filters={filters} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};