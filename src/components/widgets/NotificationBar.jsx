import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';

export default function NotificationBar() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    let es;
    const load = async () => {
      try {
        const res = await apiService.api.get('/api/notifications/list', { params: { type: 'general', limit: 5 } });
        setNotices(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (_) {
        setNotices([]);
      }
    };
    load();
    es = apiService.subscribeNotificationUpdates(() => load());
    return () => es && es.close();
  }, []);

  if (!notices || notices.length === 0) return null;

  const items = notices.slice(0, 5);

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-green-100 border-t border-b border-green-200 py-2 px-4"
    >
      <div className="w-full flex items-center gap-4">
        <div className="shrink-0 text-green-900 font-bold">Government Schemes:</div>
        <div className="flex-1 overflow-hidden">
          <marquee behavior="scroll" direction="left" scrollamount="6">
            {items.map((n, idx) => (
              <motion.span 
                key={n._id || idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="mr-8"
              >
                {n.url ? (
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    href={n.url} 
                    className="text-green-800 font-medium hover:underline"
                  >
                    {n.message}
                  </motion.a>
                ) : (
                  <span className="text-green-800 font-medium">{n.message}</span>
                )}
              </motion.span>
            ))}
          </marquee>
        </div>
      </div>
    </motion.div>
  );
}
