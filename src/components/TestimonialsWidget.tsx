import React, { useState, useEffect } from 'react';
import { Testimonial } from '../types';
import { getVerifiedTestimonials } from '../data/mockData';
import { Link } from 'react-router-dom';
import './TestimonialsWidget.css';

interface TestimonialsWidgetProps {
  limit?: number;
}

export const TestimonialsWidget: React.FC<TestimonialsWidgetProps> = ({ limit = 3 }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const verified = getVerifiedTestimonials().slice(0, limit);
    setTestimonials(verified);
  }, [limit]);

  const renderStars = (rating: number = 5) => {
    return (
      <div className="widget-rating">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="star filled">★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="testimonials-widget">
      <div className="widget-header">
        <h2>Recent Testimonials</h2>
        <Link to="/testimonials" className="view-all-link">View All →</Link>
      </div>
      
      <div className="widget-testimonials">
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className="widget-testimonial-card">
            <div className="widget-beneficiary">
              <div className="widget-avatar">
                {testimonial.beneficiaryName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="widget-info">
                <h4>{testimonial.beneficiaryName}</h4>
                <p className="widget-role">{testimonial.role}</p>
              </div>
              {renderStars(testimonial.rating)}
            </div>
            <p className="widget-message">{testimonial.message.substring(0, 150)}...</p>
            <div className="widget-meta">
              <span className="widget-campaign">{testimonial.campaign}</span>
            </div>
          </div>
        ))}
      </div>
      
      <Link to="/feedback" className="share-feedback-btn">
        ✍️ Share Your Feedback
      </Link>
    </div>
  );
};
