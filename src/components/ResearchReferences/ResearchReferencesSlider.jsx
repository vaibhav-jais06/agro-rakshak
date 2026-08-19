import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ResearchReferencesSlider() {
  const { t } = useTranslation();
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [page, setPage] = useState(0);
  const [hover, setHover] = useState(false);
  const intervalRef = useRef(null);

  const entries = useMemo(() => [
    {
      _id: 't1',
      name: t('testimonials.t1_name', 'Rajesh Patil'),
      role: t('testimonials.t1_role', 'Cotton Farmer, Maharashtra'),
      description: t('testimonials.t1_desc', 'The market trends feature helped me hold my harvest for an extra two weeks, allowing me to sell when prices peaked at the local mandi.'),
      avatar: '/assets/images/farmer_rajesh.jpg',
      metrics: [{ label: t('testimonials.t1_metric_label', 'Profit'), value: t('testimonials.t1_metric_value', '+22%'), color: '#15803d' }]
    },
    {
      _id: 't2',
      name: t('testimonials.t2_name', 'Manish Sharma'),
      role: t('testimonials.t2_role', 'Wheat Farmer, Punjab'),
      description: t('testimonials.t2_desc', 'Agro Rakshak helped me identify brown rust early on. The recommended organic treatment saved my entire crop and increased my overall yield compared to last year.'),
      avatar: '/assets/images/farmer_manish.jpg',
      metrics: [{ label: t('testimonials.t2_metric_label', 'Yield'), value: t('testimonials.t2_metric_value', '+30%'), color: '#15803d' }]
    },
    {
      _id: 't3',
      name: t('testimonials.t3_name', 'Kavita Devi'),
      role: t('testimonials.t3_role', 'Vegetable Farmer, UP'),
      description: t('testimonials.t3_desc', "The soil analysis feature showed I was overusing nitrogen. By adjusting my fertilizers based on the app's recommendation, I saved ₹15,000 this season."),
      avatar: '/assets/images/farmer_kavita.jpg',
      metrics: [{ label: t('testimonials.t3_metric_label', 'Savings'), value: t('testimonials.t3_metric_value', '₹15k'), color: '#15803d' }]
    }
  ], [t]);

  const pages = useMemo(() => {
    const size = Math.max(1, itemsPerSlide);
    const total = Math.ceil(entries.length / size);
    return total;
  }, [entries.length, itemsPerSlide]);

  const visible = useMemo(() => {
    const start = page * itemsPerSlide;
    return entries.slice(start, start + itemsPerSlide);
  }, [entries, page, itemsPerSlide]);

  useEffect(() => {
    const updatePerSlide = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsPerSlide(1);
      else if (w < 1024) setItemsPerSlide(2);
      else setItemsPerSlide(3);
    };
    updatePerSlide();
    window.addEventListener('resize', updatePerSlide);
    return () => window.removeEventListener('resize', updatePerSlide);
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!hover && pages > 1) {
      intervalRef.current = setInterval(() => {
        setPage((p) => (p + 1) % pages);
      }, 4000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hover, pages]);

  const prev = () => {
    setPage((p) => (p - 1 + pages) % pages);
  };

  const next = () => {
    setPage((p) => (p + 1) % pages);
  };


  if (!entries.length) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
            {t('realFarmerResult.title')}
          </h2>
          <p className="text-center text-gray-600">
            {t('common.noData')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
          {t('realFarmerResult.title')}
        </h2>
        <p className="text-center text-gray-600 mb-12">
          {t('realFarmerResult.subtitle')}
        </p>

        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous" 
            onClick={prev} 
            className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full shadow z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next" 
            onClick={next} 
            className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full shadow z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {visible.map((e, idx) => (
                <motion.article 
                  key={`${e._id || idx}-${page}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-md"
                >
                <div className="flex items-center gap-3 mb-4">
                  <img src={e.avatar} alt={e.name} loading="lazy" className="w-10 h-10 rounded-full object-cover border" onError={(ev) => { ev.currentTarget.style.display='none'; }} />
                  <div>
                    <div className="font-semibold text-gray-800">{e.name}</div>
                    <div className="text-sm text-gray-500">{e.role}</div>
                  </div>
                </div>
                <div className="mb-3">
                  {e.photo && (
                    <img src={e.photo} alt="" loading="lazy" className="w-full h-40 object-cover rounded-md" />
                  )}
                </div>
                {e.description && (
                  <p className="text-gray-700 italic mb-4">"{e.description}"</p>
                )}
                {(e.metrics || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {e.metrics.slice(0,3).map((m, i) => (
                      <span key={i} className="text-sm font-semibold px-2 py-1 rounded-md border" style={{ color: m.color || '#15803d', borderColor: m.color || '#d1fae5', background: '#f0fdf4' }}>{m.label ? `${m.label} ${m.value || ''}` : m.value}</span>
                    ))}
                  </div>
                )}
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-2 mt-6">
            {Array.from({ length: pages }).map((_, i) => (
              <motion.button 
                key={i} 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPage(i)} 
                className={`w-2.5 h-2.5 rounded-full ${i === page ? 'bg-green-600' : 'bg-gray-300'}`} 
                aria-label={`Go to slide ${i+1}`}
                animate={{ scale: i === page ? 1.2 : 1 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
