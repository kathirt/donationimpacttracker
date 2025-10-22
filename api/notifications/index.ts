import { AzureFunction, Context, HttpRequest } from "@azure/functions";

// Mock notification data (in production, this would come from a database)
interface Notification {
  id: string;
  donorId: string;
  type: 'donation_received' | 'impact_update' | 'milestone_reached' | 'thank_you';
  title: string;
  message: string;
  donationId?: string;
  impactMetricId?: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    donorId: 'donor-001',
    type: 'donation_received',
    title: 'Thank you for your donation!',
    message: 'We received your $500 donation to the School Lunch Program. Your generosity is making a real difference!',
    donationId: 'don-001',
    date: '2024-01-15T10:30:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: 'notif-002',
    donorId: 'donor-001',
    type: 'impact_update',
    title: 'Your donation is making an impact!',
    message: 'Your contribution helped serve 150 nutritious meals to elementary school students in North America.',
    donationId: 'don-001',
    impactMetricId: 'imp-001',
    date: '2024-01-16T14:20:00Z',
    read: true,
    priority: 'medium'
  }
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Notifications HTTP trigger function processed a request.');

  // Enable CORS
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  try {
    const action = context.bindingData.action;
    
    switch (req.method) {
      case 'GET':
        if (action === 'unread-count') {
          await handleGetUnreadCount(context, req);
        } else {
          await handleGetNotifications(context, req);
        }
        break;
      case 'POST':
        await handleSendNotification(context, req);
        break;
      case 'PUT':
        if (action === 'mark-read') {
          await handleMarkAsRead(context, req);
        } else if (action === 'mark-all-read') {
          await handleMarkAllAsRead(context, req);
        }
        break;
      default:
        context.res = {
          ...context.res,
          status: 405,
          body: { error: 'Method not allowed' }
        };
    }
  } catch (error) {
    context.log.error('Error in notifications function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleGetNotifications(context: Context, req: HttpRequest): Promise<void> {
  const { donorId } = req.query;

  if (!donorId) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'donorId is required' }
    };
    return;
  }

  const notifications = mockNotifications
    .filter(n => n.donorId === donorId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  context.res = {
    ...context.res,
    status: 200,
    body: notifications
  };
}

async function handleGetUnreadCount(context: Context, req: HttpRequest): Promise<void> {
  const { donorId } = req.query;

  if (!donorId) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'donorId is required' }
    };
    return;
  }

  const count = mockNotifications.filter(n => 
    n.donorId === donorId && !n.read
  ).length;

  context.res = {
    ...context.res,
    status: 200,
    body: { count }
  };
}

async function handleSendNotification(context: Context, req: HttpRequest): Promise<void> {
  const notification = req.body;

  // Validate required fields
  if (!notification.donorId || !notification.type || !notification.title || !notification.message) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'Missing required fields' }
    };
    return;
  }

  // Generate new notification
  const newNotification: Notification = {
    id: `notif-${Date.now()}`,
    donorId: notification.donorId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    donationId: notification.donationId,
    impactMetricId: notification.impactMetricId,
    date: new Date().toISOString(),
    read: false,
    priority: notification.priority || 'medium'
  };

  // In production, save to database and send email/push notification
  mockNotifications.push(newNotification);

  // Simulate sending email notification
  if (notification.sendEmail) {
    context.log(`Would send email to donor ${notification.donorId}: ${notification.title}`);
    // In production, integrate with Azure Communication Services or SendGrid:
    // await sendEmail(donorEmail, notification.title, notification.message);
  }

  context.res = {
    ...context.res,
    status: 201,
    body: newNotification
  };
}

async function handleMarkAsRead(context: Context, req: HttpRequest): Promise<void> {
  const { notificationId } = req.body;

  if (!notificationId) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'notificationId is required' }
    };
    return;
  }

  const notification = mockNotifications.find(n => n.id === notificationId);
  
  if (!notification) {
    context.res = {
      ...context.res,
      status: 404,
      body: { error: 'Notification not found' }
    };
    return;
  }

  notification.read = true;

  context.res = {
    ...context.res,
    status: 200,
    body: { success: true }
  };
}

async function handleMarkAllAsRead(context: Context, req: HttpRequest): Promise<void> {
  const { donorId } = req.body;

  if (!donorId) {
    context.res = {
      ...context.res,
      status: 400,
      body: { error: 'donorId is required' }
    };
    return;
  }

  mockNotifications.forEach(notification => {
    if (notification.donorId === donorId) {
      notification.read = true;
    }
  });

  context.res = {
    ...context.res,
    status: 200,
    body: { success: true }
  };
}

export default httpTrigger;
