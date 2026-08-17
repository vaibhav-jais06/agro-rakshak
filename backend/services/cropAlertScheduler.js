const CronJob = require('cron').CronJob;
const User = require('../models/User');
const PushSubscription = require('../models/PushSubscription');
const FarmerActivity = require('../models/FarmerActivity');
const { generateCropAlerts } = require('../controllers/recommendationController');
const webpush = require('web-push');
const axios = require('axios');

// Hardcoded VAPID details subject (must be a valid URL)
// Using a mailto URL as recommended by web-push
const VAPID_SUBJECT = 'mailto:admin@agrorakshak.com';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const sendCropAlertNotification = async (userId, alert, subscriptions) => {
  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title: 'New Crop Recommendation',
    body: alert.title || 'Check recommended crops for your region',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    tag: 'crop-alert',
    data: {
      url: '/',
      alertId: alert._id?.toString()
    }
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

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { sent, failed };
};

const sendWeatherAlertNotification = async (userId, weatherAlert, subscriptions) => {
  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title: weatherAlert.title || 'Weather Alert',
    body: weatherAlert.message || 'Check the weather conditions',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    tag: 'weather-alert',
    data: {
      url: '/weather-intelligence',
      alertType: weatherAlert.type || 'warning'
    }
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

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { sent, failed };
};

const sendFertilizerReminderNotification = async (userId, reminder, subscriptions) => {
  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title: 'Fertilizer Reminder',
    body: `Tomorrow: ${reminder.stage || 'Application'} for ${reminder.cropName}. Dose: ${reminder.dose || ''}`,
    icon: '/logo192.png',
    badge: '/favicon.ico',
    tag: 'fertilizer-reminder',
    data: {
      url: '/pesticide-predictor',
      type: 'fertilizer-reminder'
    }
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: { auth: sub.auth, p256dh: sub.p256dh }
      };

      return webpush.sendNotification(subscription, payload).catch(error => {
        if (error.statusCode === 410) {
          return PushSubscription.deleteOne({ _id: sub._id });
        }
        throw error;
      });
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  return { sent, failed };
};

const fetchWeatherForUser = async (user) => {
  try {
    const lat = user.location?.coordinates?.latitude;
    const lon = user.location?.coordinates?.longitude;

    if (!lat || !lon) {
      return null;
    }

    const OWM_API_KEY = process.env.REACT_APP_OWM_KEY;

    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat,
          lon,
          appid: OWM_API_KEY,
          units: 'metric'
        }
      }
    );

    const data = response.data;
    return {
      temp: data.main?.temp,
      temperature: data.main?.temp,
      humidity: data.main?.humidity,
      condition: data.weather?.[0]?.description,
      windSpeed: data.wind?.speed,
      pressure: data.main?.pressure,
      rainfall: 0
    };
  } catch (error) {
    console.error('Error fetching weather for user:', error);
    return null;
  }
};

const generateWeatherAlertsForAllUsers = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Starting weather alert generation...`);

    const users = await User.find({}, '_id location farmDetails');

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        const weather = await fetchWeatherForUser(user);
        if (!weather) {
          failureCount++;
          continue;
        }

        // Generate weather alerts based on conditions
        const alerts = [];

        // Check for extreme temperatures
        if (weather.temp > 40) {
          alerts.push({
            title: 'High Temperature Alert',
            message: `Temperature is ${weather.temp}°C. Ensure proper irrigation for your crops.`,
            type: 'warning'
          });
        } else if (weather.temp < 5) {
          alerts.push({
            title: 'Low Temperature Alert',
            message: `Temperature is ${weather.temp}°C. Protect frost-sensitive crops.`,
            type: 'warning'
          });
        }

        // Check for high humidity (fungal risk)
        if (weather.humidity > 85) {
          alerts.push({
            title: 'High Humidity Alert',
            message: `Humidity is ${weather.humidity}%. High risk of fungal diseases. Consider preventive measures.`,
            type: 'warning'
          });
        }

        // Check for high wind speed
        if (weather.windSpeed > 30) {
          alerts.push({
            title: 'Strong Wind Alert',
            message: `Wind speed is ${weather.windSpeed} km/h. Secure crops and irrigation systems.`,
            type: 'danger'
          });
        }

        // Send notifications for each alert
        if (alerts.length > 0) {
          const subscriptions = await PushSubscription.find({ userId: user._id, isActive: true });
          for (const alert of alerts) {
            const result = await sendWeatherAlertNotification(user._id, alert, subscriptions);
            console.log(`Sent weather alert to user ${user._id}: ${result.sent} notifications sent`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing weather alerts for user ${user._id}:`, error);
        failureCount++;
      }
    }

    console.log(
      `[${new Date().toISOString()}] Weather alert generation completed. Success: ${successCount}, Failed: ${failureCount}`
    );
  } catch (error) {
    console.error('Error in generateWeatherAlertsForAllUsers:', error);
  }
};

const generateCropAlertsForAllUsers = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Starting crop alert generation...`);

    const users = await User.find({}, '_id location farmDetails');

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        const weather = await fetchWeatherForUser(user);
        if (!weather) {
          failureCount++;
          continue;
        }

        const region = user.location?.district || user.location?.state || 'India';
        const soilType = user.farmDetails?.soilType;

        const result = await generateCropAlerts(user._id, weather, region, soilType);

        if (result.success && result.alert) {
          const subscriptions = await PushSubscription.find({ userId: user._id, isActive: true });
          const notificationResult = await sendCropAlertNotification(
            user._id,
            result.alert,
            subscriptions
          );

          console.log(`Generated alert for user ${user._id}: ${notificationResult.sent} notifications sent`);
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${user._id}:`, error);
        failureCount++;
      }
    }

    console.log(
      `[${new Date().toISOString()}] Crop alert generation completed. Success: ${successCount}, Failed: ${failureCount}`
    );
  } catch (error) {
    console.error('Error in generateCropAlertsForAllUsers:', error);
  }
};

const sendDueFertilizerReminders = async () => {
  try {
    const now = new Date();
    const due = await FarmerActivity.find({ type: 'fertilizer_reminder', sent: false, completed: false, notifyDate: { $lte: now } });

    let success = 0;
    let failure = 0;

    for (const item of due) {
      try {
        const subscriptions = await PushSubscription.find({ userId: item.user, isActive: true });
        const result = await sendFertilizerReminderNotification(item.user, item, subscriptions);
        if (result.sent > 0) {
          item.sent = true;
          await item.save();
          success++;
        } else {
          failure++;
        }
      } catch (e) {
        failure++;
      }
    }

    console.log(`[${now.toISOString()}] Fertilizer reminders processed. Success: ${success}, Failed: ${failure}`);
  } catch (error) {
    console.error('Error processing fertilizer reminders:', error);
  }
};

const initScheduler = () => {
  console.log('Initializing crop and weather alert schedulers...');

  // Crop alerts every 3 hours
  const cropJob = new CronJob('0 */3 * * *', generateCropAlertsForAllUsers, null, true, 'UTC');
  console.log('Crop alert scheduler started (every 3 hours)');

  // Weather alerts every hour
  const weatherJob = new CronJob('0 * * * *', generateWeatherAlertsForAllUsers, null, true, 'UTC');
  const fertilizerJob = new CronJob('0 * * * *', sendDueFertilizerReminders, null, true, 'UTC');
  console.log('Weather alert scheduler started (every 1 hour)');
  console.log('Fertilizer reminder scheduler started (every 1 hour)');

  return { cropJob, weatherJob, fertilizerJob };
};

module.exports = {
  initScheduler,
  generateCropAlertsForAllUsers,
  generateWeatherAlertsForAllUsers,
  sendDueFertilizerReminders,
  sendCropAlertNotification,
  sendWeatherAlertNotification,
  sendFertilizerReminderNotification
};
