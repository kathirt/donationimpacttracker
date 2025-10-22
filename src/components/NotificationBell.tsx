import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notifications';
import './NotificationBell.css';

interface NotificationBellProps {
  donorId: string;
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ donorId, onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCountData = async () => {
      try {
        const count = await notificationService.getUnreadCount(donorId);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCountData();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCountData, 30000);
    return () => clearInterval(interval);
  }, [donorId]);

  return (
    <button className="notification-bell" onClick={onClick} aria-label="Notifications">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
