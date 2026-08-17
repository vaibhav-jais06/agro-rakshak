import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, TrendingUp } from 'lucide-react';
import notificationService from '../../services/notificationService';
import weatherToCropService from '../../services/weatherToCropRecommendation';

export default function NotificationBanner({ userId, user }) {
  const [alerts, setAlerts] = useState([]);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    fetchCropAlerts();
    const interval = setInterval(fetchCropAlerts, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (alerts.length > 0) {
      setIsVisible(true);
      setIsBlinking(true);
      const blinkTimer = setTimeout(() => setIsBlinking(false), 6000);
      return () => clearTimeout(blinkTimer);
    }
  }, [alerts]);

  const fetchCropAlerts = async () => {
    try {
      const response = await notificationService.getCropAlerts(userId);
      if (response.alerts && response.alerts.length > 0) {
        setAlerts(response.alerts);
        setActiveAlertIndex(0);

        if (Notification.permission === 'granted') {
          const alert = response.alerts[0];
          await notificationService.showLocalNotification(
            'New Crop Recommendation Available',
            {
              body: alert.title || 'Check recommended crops for your region',
              tag: 'crop-alert',
              requireInteraction: true,
              data: { url: '/' }
            }
          );
        }
      }
    } catch (error) {
      console.error('Error fetching crop alerts:', error);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await notificationService.dismissAlert(alertId);
      setAlerts(alerts.filter(alert => alert._id !== alertId));
      if (alerts.length <= 1) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await notificationService.markAlertAsRead(alertId);
      setAlerts(alerts.map(alert =>
        alert._id === alertId ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (!isVisible || alerts.length === 0) {
    return null;
  }

  const currentAlert = alerts[activeAlertIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-0 left-0 right-0 z-50 ${isBlinking ? 'animate-pulse' : ''}`}
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-1">
                  <motion.div
                    animate={{ rotate: isBlinking ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isBlinking ? Infinity : 0 }}
                  >
                    <TrendingUp size={24} className="text-white" />
                  </motion.div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">
                      {currentAlert.title || 'New Crop Recommendation'}
                    </h3>
                    {!currentAlert.read && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-green-50 text-sm mb-2 line-clamp-2">
                    {currentAlert.description || currentAlert.message || 'Weather-based crop recommendations for your region are ready'}
                  </p>

                  {currentAlert.recommendations && currentAlert.recommendations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentAlert.recommendations.slice(0, 3).map((crop, idx) => (
                        <span key={idx} className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                          {typeof crop === 'string' ? crop : crop.name || crop}
                        </span>
                      ))}
                      {currentAlert.recommendations.length > 3 && (
                        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                          +{currentAlert.recommendations.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 text-xs">
                    {alerts.length > 1 && (
                      <div className="flex gap-1">
                        {alerts.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveAlertIndex(idx);
                              handleMarkAsRead(alerts[idx]._id);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === activeAlertIndex
                                ? 'bg-white'
                                : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleMarkAsRead(currentAlert._id)}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleDismiss(currentAlert._id)}
                  className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
