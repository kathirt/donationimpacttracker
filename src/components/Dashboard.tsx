import React, { useState, useMemo } from 'react';
import { FilterOptions } from '../types';
import { mockDonations, mockImpactMetrics } from '../data/mockData';
import { filterImpactData, summarizeImpactData } from '../data/impactData';
import { ImpactMetrics } from './ImpactMetrics';
import { FilterBar } from './FilterBar';
import { ImpactChart } from './ImpactChart';
import { RecentActivities } from './RecentActivities';
import { ImpactNarrative } from './ImpactNarrative';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const filteredData = useMemo(
    () => filterImpactData(mockDonations, mockImpactMetrics, filters),
    [filters]
  );
  const impactSummary = useMemo(
    () => summarizeImpactData(filteredData.donations, filteredData.metrics),
    [filteredData]
  );

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Impact Dashboard</h1>
        <p>Track the real-world impact of your donations</p>
        <p>Sample data — these figures are illustrative, not verified impact. Unique beneficiary counts are unavailable.</p>
      </div>
      
      <FilterBar onFilterChange={handleFilterChange} />
      
      <div className="dashboard-content">
        {/* AI-Generated Impact Narrative */}
        <div className="dashboard-section full-width">
          <ImpactNarrative 
            type="summary"
            region={filters.region || 'global'}
            metrics={filteredData.metrics}
            dataSource="sample"
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
            <RecentActivities donations={filteredData.donations} metrics={filteredData.metrics} />
          </div>
        </div>
      </div>
    </div>
  );
};