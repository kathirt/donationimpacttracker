import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Donor } from '../types';
import './CreateDonorProfile.css';

export const CreateDonorProfile: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferredCampaigns: [] as string[],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const availableCampaigns = [
    'School Lunch Program',
    'Digital Learning Initiative',
    'Scholarship Fund',
    'Library Books Drive'
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // In a real app, this would call an API to create the donor
    const newDonor: Donor = {
      id: `donor-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      totalDonated: 0,
      donationCount: 0,
      preferredCampaigns: formData.preferredCampaigns,
      joinDate: new Date().toISOString().split('T')[0]
    };

    console.log('Creating new donor:', newDonor);
    
    // Simulate success and redirect
    alert('Donor profile created successfully!');
    navigate('/donors');
  };

  const handleCampaignToggle = (campaign: string) => {
    setFormData(prev => ({
      ...prev,
      preferredCampaigns: prev.preferredCampaigns.includes(campaign)
        ? prev.preferredCampaigns.filter(c => c !== campaign)
        : [...prev.preferredCampaigns, campaign]
    }));
  };

  return (
    <div className="create-donor-profile">
      <button className="back-button" onClick={() => navigate('/donors')}>
        ← Back to Donors
      </button>

      <div className="create-profile-container">
        <h1>Create Donor Profile</h1>
        <p className="subtitle">Join our community of donors making a difference</p>

        <form onSubmit={handleSubmit} className="donor-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Preferred Campaigns (Optional)</label>
            <p className="field-description">Select campaigns you're interested in supporting</p>
            <div className="campaign-checkboxes">
              {availableCampaigns.map((campaign) => (
                <label key={campaign} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.preferredCampaigns.includes(campaign)}
                    onChange={() => handleCampaignToggle(campaign)}
                  />
                  <span>{campaign}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Create Profile
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/donors')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
