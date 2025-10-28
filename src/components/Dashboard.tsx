import React, { useState, useEffect } from 'react';
import { ImpactSummary, FilterOptions } from '../types';
import { ImpactMetrics } from './ImpactMetrics';
import { FilterBar } from './FilterBar';
import { ImpactChart } from './ImpactChart';
import { RecentActivities } from './RecentActivities';
import { ImpactNarrative } from './ImpactNarrative';
import { TestimonialsWidget } from './TestimonialsWidget';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [impactSummary, setImpactSummary] = useState<ImpactSummary | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch impact summary
    const fetchImpactSummary = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockSummary: ImpactSummary = {
          totalDonations: 1247,
          totalAmount: 185420,
          totalBeneficiaries: 3892,
          impactsByType: {
            meals_served: { total: 15640, description: "Meals served to students" },
            books_distributed: { total: 4820, description: "Educational books distributed" },
            students_supported: { total: 2150, description: "Students receiving scholarships" },
            scholarships_provided: { total: 89, description: "Full scholarships awarded" }
          },
          regionBreakdown: {
            "North America": { donations: 420, amount: 78000, beneficiaries: 1200 },
            "Europe": { donations: 315, amount: 52000, beneficiaries: 890 },
            "Asia": { donations: 298, amount: 35000, beneficiaries: 980 },
            "Africa": { donations: 214, amount: 20420, beneficiaries: 822 }
          }
        };
        
        setTimeout(() => {
          setImpactSummary(mockSummary);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching impact summary:', error);
        setLoading(false);
      }
    };

    fetchImpactSummary();
  }, [filters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading impact data...</p>
      </div>
    );
  }

  if (!impactSummary) {
    return (
      <div className="dashboard-error">
        <p>Failed to load impact data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Impact Dashboard</h1>
        <p>Track the real-world impact of your donations</p>
      </div>
      
      <FilterBar onFilterChange={handleFilterChange} />
      
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
          
          <div className="dashboard-section full-width">
            <TestimonialsWidget limit={3} />
          </div>
        </div>
      </div>
    </div>
  );
};