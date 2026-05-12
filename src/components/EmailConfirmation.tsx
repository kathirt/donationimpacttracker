import React, { useState } from 'react';
import { Donation, Donor } from '../types';
import { generateEmailContent } from '../services/receiptService';
import './EmailConfirmation.css';

interface EmailConfirmationProps {
  donation: Donation;
  donor?: Donor;
  onClose: () => void;
}

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ donation, donor, onClose }) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { subject, body } = generateEmailContent(donation, donor);
  const recipientEmail = donor?.email || 'donor@email.com';

  const handleSend = async () => {
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="email-modal-overlay" onClick={onClose}>
      <div className="email-modal" onClick={e => e.stopPropagation()}>
        <div className="email-modal-header">
          <h2>📧 Email Confirmation</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {sent ? (
          <div className="email-sent-success">
            <div className="success-icon">✅</div>
            <h3>Email Sent!</h3>
            <p>Confirmation sent to <strong>{recipientEmail}</strong></p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <div className="email-modal-body">
            <div className="email-field">
              <span className="email-field-label">To:</span>
              <span className="email-field-value">{recipientEmail}</span>
            </div>
            <div className="email-field">
              <span className="email-field-label">Subject:</span>
              <span className="email-field-value">{subject}</span>
            </div>
            <div className="email-body-preview">
              <pre>{body}</pre>
            </div>
            <div className="email-modal-actions">
              <button className="btn-secondary" onClick={onClose} disabled={sending}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSend} disabled={sending}>
                {sending ? (
                  <>
                    <span className="btn-spinner"></span> Sending…
                  </>
                ) : (
                  '📤 Send Email'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
