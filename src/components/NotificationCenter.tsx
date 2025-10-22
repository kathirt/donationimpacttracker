import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { notificationService } from '../services/notifications';
import './NotificationCenter.css';

interface NotificationCenterProps {
  donorId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  donorId, 
  isOpen, 
  onClose 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          const data = await notificationService.getNotifications(donorId);
          setNotifications(data.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ));
        } catch (error) {
          console.error('Error loading notifications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [isOpen, donorId]);



  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(donorId);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'donation_received':
        return '💝';
      case 'impact_update':
        return '📊';
      case 'milestone_reached':
        return '🎉';
      case 'thank_you':
        return '🙏';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h2>Notifications</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="notification-controls">
          <div className="notification-filters">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-button"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notification-empty">
              <p>
                {filter === 'unread' 
                  ? 'No unread notifications' 
                  : 'No notifications yet'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''} priority-${notification.priority}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-date">
                    {formatDate(notification.date)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
