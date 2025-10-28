import React, { useState, useEffect } from 'react';
import { Testimonial } from '../types';
import { mockTestimonials, getTestimonialsByRegion, getTestimonialsByCampaign } from '../data/mockData';
import './Testimonials.css';

export const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch testimonials
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        setTimeout(() => {
          setTestimonials(mockTestimonials);
          setFilteredTestimonials(mockTestimonials);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = testimonials;

    if (selectedRegion !== 'all') {
      filtered = getTestimonialsByRegion(selectedRegion);
    }

    if (selectedCampaign !== 'all') {
      filtered = getTestimonialsByCampaign(selectedCampaign);
    }

    if (selectedRegion !== 'all' && selectedCampaign !== 'all') {
      filtered = testimonials.filter(
        t => t.region === selectedRegion && t.campaign === selectedCampaign
      );
    }

    setFilteredTestimonials(filtered);
  }, [selectedRegion, selectedCampaign, testimonials]);

  const regions = ['all', ...Array.from(new Set(testimonials.map(t => t.region)))];
  const campaigns = ['all', ...Array.from(new Set(testimonials.map(t => t.campaign)))];

  const renderStars = (rating: number = 5) => {
    const validRating = Math.max(0, Math.min(5, rating)); // Ensure rating is between 0 and 5
    return (
      <div className="testimonial-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < validRating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="testimonials-loading">
        <div className="loading-spinner"></div>
        <p>Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className="testimonials-container">
      <div className="testimonials-header">
        <h1>Beneficiary Testimonials</h1>
        <p>Real stories from people whose lives have been impacted by your donations</p>
      </div>

      <div className="testimonials-filters">
        <div className="filter-group">
          <label htmlFor="region-filter">Region:</label>
          <select
            id="region-filter"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map(region => (
              <option key={region} value={region}>
                {region === 'all' ? 'All Regions' : region}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="campaign-filter">Campaign:</label>
          <select
            id="campaign-filter"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            {campaigns.map(campaign => (
              <option key={campaign} value={campaign}>
                {campaign === 'all' ? 'All Campaigns' : campaign}
              </option>
            ))}
          </select>
        </div>

        <div className="testimonials-count">
          Showing {filteredTestimonials.length} testimonial{filteredTestimonials.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="testimonials-grid">
        {filteredTestimonials.map(testimonial => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="testimonial-header">
              <div className="beneficiary-info">
                <div className="beneficiary-avatar">
                  {testimonial.beneficiaryName.split(/\s+/).filter(n => n).map(n => n[0]).join('')}
                </div>
                <div className="beneficiary-details">
                  <h3>{testimonial.beneficiaryName}</h3>
                  <p className="beneficiary-role">{testimonial.role}</p>
                </div>
              </div>
              {testimonial.verified && (
                <span className="verified-badge" title="Verified Testimonial">
                  ✓ Verified
                </span>
              )}
            </div>

            {renderStars(testimonial.rating)}

            <div className="testimonial-message">
              <p>{testimonial.message}</p>
            </div>

            <div className="testimonial-meta">
              <span className="campaign-tag">{testimonial.campaign}</span>
              <span className="region-tag">{testimonial.region}</span>
              <span className="date">{new Date(testimonial.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="no-testimonials">
          <p>No testimonials found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
