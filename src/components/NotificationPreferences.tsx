import React, { useState } from 'react';
import { NotificationPreferences as NotificationPreferencesType } from '../types';
import { notificationService } from '../services/notifications';
import './NotificationPreferences.css';

interface NotificationPreferencesProps {
  donorId: string;
  initialPreferences?: NotificationPreferencesType;
}

const defaultPreferences: NotificationPreferencesType = {
  email: true,
  inApp: true,
  frequency: 'immediate',
  types: {
    donationReceived: true,
    impactUpdates: true,
    milestoneReached: true
  }
};

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  donorId,
  initialPreferences
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferencesType>(
    initialPreferences || defaultPreferences
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (field: keyof NotificationPreferencesType, value?: any) => {
    if (field === 'types') {
      setPreferences(prev => ({
        ...prev,
        types: { ...prev.types, ...value }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [field]: value !== undefined ? value : !prev[field]
      }));
    }
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await notificationService.updatePreferences(donorId, preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notification-preferences">
      <div className="preferences-header">
        <h3>Notification Preferences</h3>
        <p>Choose how you want to receive updates about your donations</p>
      </div>

      <div className="preferences-section">
        <h4>Delivery Methods</h4>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.email}
              onChange={() => handleToggle('email')}
            />
            <span className="preference-label">
              <strong>Email Notifications</strong>
              <small>Receive updates via email</small>
            </span>
          </label>
        </div>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.inApp}
              onChange={() => handleToggle('inApp')}
            />
            <span className="preference-label">
              <strong>In-App Notifications</strong>
              <small>See notifications when you're logged in</small>
            </span>
          </label>
        </div>
      </div>

      <div className="preferences-section">
        <h4>Notification Frequency</h4>
        <div className="preference-radio-group">
          {[
            { value: 'immediate', label: 'Immediate', description: 'Get notified right away' },
            { value: 'daily', label: 'Daily Digest', description: 'Once per day summary' },
            { value: 'weekly', label: 'Weekly Digest', description: 'Once per week summary' },
            { value: 'monthly', label: 'Monthly Digest', description: 'Once per month summary' }
          ].map(option => (
            <div key={option.value} className="preference-item">
              <label>
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={preferences.frequency === option.value}
                  onChange={() => handleToggle('frequency', option.value)}
                />
                <span className="preference-label">
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="preferences-section">
        <h4>Notification Types</h4>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.types.donationReceived}
              onChange={() => handleToggle('types', { donationReceived: !preferences.types.donationReceived })}
            />
            <span className="preference-label">
              <strong>Donation Received</strong>
              <small>Confirmation when we receive your donation</small>
            </span>
          </label>
        </div>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.types.impactUpdates}
              onChange={() => handleToggle('types', { impactUpdates: !preferences.types.impactUpdates })}
            />
            <span className="preference-label">
              <strong>Impact Updates</strong>
              <small>Updates on how your donations are making a difference</small>
            </span>
          </label>
        </div>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.types.milestoneReached}
              onChange={() => handleToggle('types', { milestoneReached: !preferences.types.milestoneReached })}
            />
            <span className="preference-label">
              <strong>Milestone Reached</strong>
              <small>When campaigns reach important milestones</small>
            </span>
          </label>
        </div>
      </div>

      <div className="preferences-actions">
        <button 
          className="save-preferences-button"
          onClick={handleSave}
          disabled={saving || saved}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};
