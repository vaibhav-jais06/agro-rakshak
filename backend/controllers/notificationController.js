const PushSubscription = require('../models/PushSubscription');
const User = require('../models/User');
const webpush = require('web-push');
const FarmerActivity = require('../models/FarmerActivity');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
// Hardcoded VAPID subject; must be a valid URL (mailto: recommended)
const VAPID_SUBJECT = 'mailto:admin@agrorakshak.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

exports.subscribeToPushNotifications = async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({
        success: false,
        message: 'userId and subscription are required'
      });
    }

    let pushSub = await PushSubscription.findOne({ endpoint: subscription.endpoint });

    if (pushSub) {
      pushSub.userId = userId;
      pushSub.auth = subscription.keys?.auth;
      pushSub.p256dh = subscription.keys?.p256dh;
      pushSub.updatedAt = new Date();
      await pushSub.save();
    } else {
      pushSub = new PushSubscription({
        userId,
        endpoint: subscription.endpoint,
        auth: subscription.keys?.auth,
        p256dh: subscription.keys?.p256dh,
        userAgent: req.headers['user-agent']
      });
      await pushSub.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to push notifications',
      subscription: pushSub
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications',
      error: error.message
    });
  }
};

exports.unsubscribeFromPushNotifications = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    await PushSubscription.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from push notifications',
      error: error.message
    });
  }
};

exports.sendPushNotification = async (req, res) => {
  try {
    const { userId, title, body, data = {} } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and body are required'
      });
    }

    const subscriptions = await PushSubscription.find({ userId, isActive: true });

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active push subscriptions found for this user'
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: data.tag || 'notification',
      data: data
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh
          }
        };

        return webpush.sendNotification(subscription, payload).catch(error => {
          if (error.statusCode === 410) {
            return PushSubscription.deleteOne({ _id: sub._id });
          }
          throw error;
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      message: 'Push notification sent',
      results: {
        total: subscriptions.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send push notification',
      error: error.message
    });
  }
};

exports.sendBulkPushNotification = async (req, res) => {
  try {
    const { userIds, title, body, data = {} } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0 || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userIds (array), title, and body are required'
      });
    }

    const subscriptions = await PushSubscription.find({
      userId: { $in: userIds },
      isActive: true
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active push subscriptions found for these users'
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: data.tag || 'notification',
      data: data
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh
          }
        };

        return webpush.sendNotification(subscription, payload).catch(error => {
          if (error.statusCode === 410) {
            return PushSubscription.deleteOne({ _id: sub._id });
          }
          throw error;
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      message: 'Bulk push notification sent',
      results: {
        total: subscriptions.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Error sending bulk push notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send bulk push notification',
      error: error.message
    });
  }
};

exports.getVAPIDPublicKey = async (req, res) => {
  try {
    if (!VAPID_PUBLIC_KEY) {
      return res.status(500).json({
        success: false,
        message: 'VAPID_PUBLIC_KEY not configured'
      });
    }

    return res.status(200).json({
      success: true,
      publicKey: VAPID_PUBLIC_KEY
    });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get VAPID public key',
      error: error.message
    });
  }
};

exports.createFertilizerReminder = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { cropName, soilType, stage, dose, instruction, day, startDate } = req.body;

    if (!userId || !cropName || typeof day !== 'number' || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'cropName, day (number), startDate required'
      });
    }

    const start = new Date(startDate);
    const scheduled = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
    const notify = new Date(scheduled.getTime() - 24 * 60 * 60 * 1000);

    const activity = await FarmerActivity.create({
      user: userId,
      type: 'fertilizer_reminder',
      cropName,
      soilType,
      scheduleDay: day,
      startDate: start,
      scheduledDate: scheduled,
      notifyDate: notify,
      stage,
      dose,
      instruction,
      sent: false
    });

    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeFertilizerReminder = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { cropName, day, startDate } = req.body;

    if (!userId || !cropName || typeof day !== 'number' || !startDate) {
      return res.status(400).json({ success: false, message: 'cropName, day, startDate required' });
    }

    const start = new Date(startDate);
    const scheduled = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
    const notify = new Date(scheduled.getTime() - 24 * 60 * 60 * 1000);

    let activity = await FarmerActivity.findOne({
      user: userId,
      type: 'fertilizer_reminder',
      cropName,
      scheduleDay: day,
      startDate: start
    });

    if (!activity) {
      activity = await FarmerActivity.create({
        user: userId,
        type: 'fertilizer_reminder',
        cropName,
        scheduleDay: day,
        startDate: start,
        scheduledDate: scheduled,
        notifyDate: notify,
        sent: true
      });
    }

    activity.completed = true;
    activity.completedAt = new Date();
    activity.sent = true;
    await activity.save();

    return res.status(200).json({ success: true, data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
