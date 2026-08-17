import axios from 'axios';

const DEFAULT_BASE = 'https://agro-rakshak.onrender.com';
const ENV_BASE = process.env.REACT_APP_API_BASE;
const API_BASE = ENV_BASE || DEFAULT_BASE;

const notificationService = {
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  subscribeToPushNotifications: async (userId) => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return null;
      }

      let vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      
      if (!vapidKey) {
        const response = await axios.get(`${API_BASE}/api/notifications/vapid-key`);
        vapidKey = response.data.publicKey;
      }

      if (!vapidKey) {
        console.error('VAPID public key not available');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      await axios.post(`${API_BASE}/api/notifications/subscribe`, {
        userId,
        subscription: subscription.toJSON()
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  },

  unsubscribeFromPushNotifications: async (userId) => {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await axios.post(`${API_BASE}/api/notifications/unsubscribe`, { userId });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  },

  showLocalNotification: async (title, options = {}) => {
    try {
      if (!('Notification' in window)) {
        return null;
      }

      const hasPermission = Notification.permission === 'granted';
      if (!hasPermission) {
        return null;
      }

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        return registration.showNotification(title, {
          icon: '/logo.png',
          badge: '/favicon.ico',
          ...options
        });
      } else {
        return new Notification(title, {
          icon: '/logo.png',
          badge: '/favicon.ico',
          ...options
        });
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  },

  getCropAlerts: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/recommendations/crop-alerts/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch crop alerts:', error);
      return { alerts: [] };
    }
  },

  markAlertAsRead: async (alertId) => {
    try {
      const response = await axios.patch(`${API_BASE}/api/recommendations/crop-alerts/${alertId}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
      return null;
    }
  },

  dismissAlert: async (alertId) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/recommendations/crop-alerts/${alertId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      return null;
    }
  },

  subscribeNotificationUpdates: (onMessage) => {
    try {
      const es = new EventSource(`${API_BASE}/api/notifications/stream`);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onMessage && onMessage(data);
        } catch (_) {}
      };
      es.onerror = () => {};
      return es;
    } catch (error) {
      console.error('Failed to subscribe to notification updates:', error);
      return null;
    }
  }
};

function urlBase64ToUint8Array(base64String) {
  try {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('Error converting VAPID key:', error);
    return null;
  }
}

export default notificationService;

