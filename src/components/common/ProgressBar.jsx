import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function ProgressBar({ percentage, applied, total }) {
  const { t } = useTranslation();

  let barColor = 'bg-green-500'; // 0-50%
  if (percentage > 50 && percentage <= 80) {
    barColor = 'bg-yellow-500'; // 51-80%
  } else if (percentage > 80 && percentage < 100) {
    barColor = 'bg-blue-500'; // 81-99%
  } else if (percentage === 100) {
    barColor = 'bg-green-700'; // 100% dark green
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
      <motion.div
        className={`h-full rounded-full flex items-center justify-center text-white text-sm font-bold ${barColor}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {t('progressBar.status', { percentage: Math.round(percentage), applied, total })}
      </motion.div>
    </div>
  );
}
