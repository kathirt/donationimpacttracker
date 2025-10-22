import { Notification, NotificationPreferences } from '../types';
import { 
  mockNotifications, 
  getNotificationsByDonor, 
  getUnreadNotificationCount,
  markNotificationAsRead as markAsRead,
  markAllNotificationsAsRead as markAllAsRead
} from '../data/mockData';

/**
 * Service for managing donor notifications
 */
class NotificationService {
  /**
   * Get all notifications for a specific donor
   */
  async getNotifications(donorId: string): Promise<Notification[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getNotificationsByDonor(donorId));
      }, 300);
    });
  }

  /**
   * Get count of unread notifications for a donor
   */
  async getUnreadCount(donorId: string): Promise<number> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getUnreadNotificationCount(donorId));
      }, 100);
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        markAsRead(notificationId);
        resolve();
      }, 200);
    });
  }

  /**
   * Mark all notifications as read for a donor
   */
  async markAllAsRead(donorId: string): Promise<void> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        markAllAsRead(donorId);
        resolve();
      }, 200);
    });
  }

  /**
   * Send a notification (for testing purposes)
   */
  async sendNotification(notification: Omit<Notification, 'id'>): Promise<Notification> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          ...notification
        };
        mockNotifications.unshift(newNotification);
        resolve(newNotification);
      }, 300);
    });
  }

  /**
   * Update notification preferences for a donor
   */
  async updatePreferences(
    donorId: string, 
    preferences: NotificationPreferences
  ): Promise<NotificationPreferences> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would update the database
        resolve(preferences);
      }, 300);
    });
  }

  /**
   * Simulate sending an email notification
   */
  async sendEmailNotification(
    email: string,
    subject: string,
    body: string
  ): Promise<{ success: boolean; message: string }> {
    // Simulate API call to email service (e.g., SendGrid, Azure Communication Services)
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Email Notification] To: ${email}, Subject: ${subject}`);
        resolve({
          success: true,
          message: 'Email notification sent successfully'
        });
      }, 500);
    });
  }
}

export const notificationService = new NotificationService();
