import React, { useState, useEffect } from 'react';
import { BeneficiaryUpdate } from '../types';
import { mockBeneficiaryUpdates, getBeneficiaryUpdatesByCampaign } from '../data/mockData';
import './BeneficiaryUpdates.css';

export const BeneficiaryUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<BeneficiaryUpdate[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<BeneficiaryUpdate[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch beneficiary updates
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        // In production, this would be an API call
        setTimeout(() => {
          const publicUpdates = mockBeneficiaryUpdates.filter(update => update.isPublic);
          setUpdates(publicUpdates);
          setFilteredUpdates(publicUpdates);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching beneficiary updates:', error);
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = updates;

    if (selectedCampaign !== 'all') {
      filtered = getBeneficiaryUpdatesByCampaign(selectedCampaign).filter(u => 
        updates.some(update => update.id === u.id)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(update => update.impactType === selectedType);
    }

    setFilteredUpdates(filtered);
  }, [selectedCampaign, selectedType, updates]);

  const campaigns = ['all', ...Array.from(new Set(updates.map(u => u.relatedCampaign)))];
  const impactTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'meals_served', label: 'Meals Served' },
    { value: 'books_distributed', label: 'Books Distributed' },
    { value: 'students_supported', label: 'Students Supported' },
    { value: 'scholarships_provided', label: 'Scholarships' },
    { value: 'trees_planted', label: 'Trees Planted' }
  ];

  const getImpactIcon = (type: string) => {
    switch (type) {
      case 'meals_served': return '🍽️';
      case 'books_distributed': return '📚';
      case 'students_supported': return '👨‍🎓';
      case 'scholarships_provided': return '🎓';
      case 'trees_planted': return '🌳';
      default: return '💝';
    }
  };

  const getImpactLabel = (type: string) => {
    switch (type) {
      case 'meals_served': return 'Meals Program';
      case 'books_distributed': return 'Books & Learning';
      case 'students_supported': return 'Student Support';
      case 'scholarships_provided': return 'Scholarship';
      case 'trees_planted': return 'Environmental';
      default: return 'Impact';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="beneficiary-updates-container">
        <div className="updates-header">
          <h1>💬 Beneficiary Stories</h1>
          <p>Loading inspiring stories from those we serve...</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="beneficiary-updates-container">
      <div className="updates-header">
        <div className="header-content">
          <h1>💬 Beneficiary Stories</h1>
          <p className="header-subtitle">
            Real stories from the people whose lives have been transformed by your generosity
          </p>
        </div>
        <div className="updates-stats">
          <div className="stat-card">
            <span className="stat-number">{updates.length}</span>
            <span className="stat-label">Stories Shared</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{new Set(updates.map(u => u.relatedCampaign)).size}</span>
            <span className="stat-label">Campaigns</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{new Set(updates.map(u => u.beneficiaryLocation)).size}</span>
            <span className="stat-label">Locations</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="campaign-filter">Campaign:</label>
          <select 
            id="campaign-filter"
            value={selectedCampaign} 
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="filter-select"
          >
            {campaigns.map(campaign => (
              <option key={campaign} value={campaign}>
                {campaign === 'all' ? 'All Campaigns' : campaign}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type-filter">Impact Type:</label>
          <select 
            id="type-filter"
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            {impactTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="results-count">
          Showing {filteredUpdates.length} {filteredUpdates.length === 1 ? 'story' : 'stories'}
        </div>
      </div>

      <div className="updates-grid">
        {filteredUpdates.length === 0 ? (
          <div className="no-updates">
            <p>No stories match your selected filters.</p>
            <button 
              onClick={() => {
                setSelectedCampaign('all');
                setSelectedType('all');
              }}
              className="reset-filters-button"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredUpdates.map((update) => (
            <div key={update.id} className="update-card">
              <div className="update-header">
                <div className="beneficiary-info">
                  <div className="beneficiary-avatar">
                    {update.beneficiaryName.charAt(0)}
                  </div>
                  <div className="beneficiary-details">
                    <h3 className="beneficiary-name">{update.beneficiaryName}</h3>
                    <p className="beneficiary-location">
                      📍 {update.beneficiaryLocation}
                      {update.beneficiaryAge && ` • ${update.beneficiaryAge} years old`}
                    </p>
                  </div>
                </div>
                <div className="impact-badge">
                  <span className="impact-icon">{getImpactIcon(update.impactType)}</span>
                  <span className="impact-type">{getImpactLabel(update.impactType)}</span>
                </div>
              </div>

              <div className="update-content">
                <div className="story-quote">"</div>
                <p className="story-text">{update.story}</p>
                <div className="story-quote-end">"</div>
              </div>

              <div className="update-footer">
                <div className="campaign-tag">
                  🎯 {update.relatedCampaign}
                </div>
                <div className="update-date">
                  {formatDate(update.date)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredUpdates.length > 0 && (
        <div className="updates-cta">
          <div className="cta-content">
            <h2>Your Donation Makes a Difference</h2>
            <p>Every contribution, no matter the size, creates real impact in someone's life. Join us in making a difference today.</p>
          </div>
        </div>
      )}
    </div>
  );
};
