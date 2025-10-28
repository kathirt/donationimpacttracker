import React, { useState } from 'react';
import { Feedback } from '../types';
import './FeedbackForm.css';

export const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState({
    beneficiaryName: '',
    email: '',
    campaign: '',
    region: '',
    feedbackType: 'gratitude' as Feedback['feedbackType'],
    message: '',
    rating: 5
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const campaigns = [
    'School Lunch Program',
    'Digital Learning Initiative',
    'Scholarship Fund',
    'Library Books Drive'
  ];

  const regions = [
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Africa',
    'Oceania'
  ];

  const feedbackTypes = [
    { value: 'gratitude', label: 'Gratitude & Thank You' },
    { value: 'testimonial', label: 'Success Story / Testimonial' },
    { value: 'suggestion', label: 'Suggestion for Improvement' },
    { value: 'concern', label: 'Concern or Issue' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call to submit feedback
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Feedback submitted:', formData);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          beneficiaryName: '',
          email: '',
          campaign: '',
          region: '',
          feedbackType: 'gratitude',
          message: '',
          rating: 5
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="star-rating-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className="star-label">
            <input
              type="radio"
              name="rating"
              value={star}
              checked={formData.rating === star}
              onChange={handleChange}
            />
            <span className={formData.rating >= star ? 'star filled' : 'star'}>★</span>
          </label>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="feedback-success">
        <div className="success-icon">✓</div>
        <h2>Thank You!</h2>
        <p>Your feedback has been submitted successfully.</p>
        <p className="success-message">
          We appreciate you taking the time to share your experience with us.
        </p>
      </div>
    );
  }

  return (
    <div className="feedback-form-container">
      <div className="feedback-form-header">
        <h1>Share Your Feedback</h1>
        <p>Help us understand the impact we're making and how we can improve</p>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="beneficiaryName">
              Your Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="beneficiaryName"
              name="beneficiaryName"
              value={formData.beneficiaryName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (Optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="campaign">
              Campaign <span className="required">*</span>
            </label>
            <select
              id="campaign"
              name="campaign"
              value={formData.campaign}
              onChange={handleChange}
              required
            >
              <option value="">Select a campaign</option>
              {campaigns.map(campaign => (
                <option key={campaign} value={campaign}>{campaign}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="region">
              Region <span className="required">*</span>
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
            >
              <option value="">Select your region</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="feedbackType">
            Feedback Type <span className="required">*</span>
          </label>
          <select
            id="feedbackType"
            name="feedbackType"
            value={formData.feedbackType}
            onChange={handleChange}
            required
          >
            {feedbackTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Your Rating <span className="required">*</span>
          </label>
          {renderStarRating()}
        </div>

        <div className="form-group">
          <label htmlFor="message">
            Your Message <span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            placeholder="Share your experience, story, or feedback..."
          />
          <div className="character-count">
            {formData.message.length} characters
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? (
            <>
              <span className="button-spinner"></span>
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </button>
      </form>
    </div>
  );
};
