import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BarChart3, Settings, Shield, TrendingUp, Package, FileText, Edit, Trash, ScrollText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import LanguageSwitcher from '../LanguageSwitcher';

export default function AdminPanel({ user, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDiagnoses: 0,
    totalOrders: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const res = await apiService.api.get('/api/auth/users', { params: { page: 1, size: 1000 } });
        const records = res.data?.records || res.data?.data || res.data?.users || [];
        const total = typeof res.data?.total === 'number' ? res.data.total : (typeof res.data?.count === 'number' ? res.data.count : (Array.isArray(records) ? records.length : 0));
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const activeCount = Array.isArray(records)
          ? records.filter((u) => {
              const isActiveFlag = u?.active || u?.isActive;
              const lastLogin = u?.lastLogin || u?.lastSeen || u?.updatedAt || u?.createdAt;
              const recent = lastLogin ? (now - new Date(lastLogin).getTime() < sevenDays) : false;
              return isActiveFlag || recent;
            }).length
          : 0;
        setStats((s) => ({ ...s, totalUsers: total, activeUsers: activeCount }));
      } catch (_) {
        setStats((s) => ({ ...s, totalUsers: 0, activeUsers: 0 }));
      }
    };
    loadUserStats();
  }, []);

  const statCards = [
    { icon: Users, label: t('admin.totalUsers'), value: stats.totalUsers, color: 'bg-blue-500' },
    { icon: FileText, label: t('admin.diagnoses'), value: stats.totalDiagnoses, color: 'bg-green-500' },
    { icon: Package, label: t('admin.orders'), value: stats.totalOrders, color: 'bg-purple-500' },
    { icon: TrendingUp, label: t('admin.activeUsers'), value: stats.activeUsers, color: 'bg-orange-500' }
  ];

  const [researchEntries, setResearchEntries] = useState([]);
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: '',
    headline: '',
    description: '',
    avatar: '',
    photo: '',
    metrics: [],
    published: true,
    featured: false
  });

  const [notificationForm, setNotificationForm] = useState({
    message: '',
    url: '',
    type: 'general',
    active: true
  });
  const [notificationList, setNotificationList] = useState([]);
  const [schemeForm, setSchemeForm] = useState({ message: '', url: '', active: true });
  const [schemeList, setSchemeList] = useState([]);
  const [editingSchemeId, setEditingSchemeId] = useState(null);
  const [schemeEdit, setSchemeEdit] = useState({ message: '', url: '', active: true });
  const [farmers, setFarmers] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [farmerQuery, setFarmerQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingResearch(true);
        const res = await apiService.api.get('/api/research?all=true');
        setResearchEntries(res.data.data || []);
      } catch (_) {
        setResearchEntries([]);
      } finally {
        setLoadingResearch(false);
      }
    };
    load();
    const es = apiService.subscribeResearchUpdates(() => load());
    return () => es && es.close();
  }, []);

  useEffect(() => {
    const loadFarmers = async () => {
      try {
        setFarmersLoading(true);
        const res = await apiService.api.get('/api/auth/users', { params: { role: 'user', q: farmerQuery } });
        setFarmers(res.data?.records || []);
      } catch (_) {
        setFarmers([]);
      } finally {
        setFarmersLoading(false);
      }
    };
    loadFarmers();
  }, [farmerQuery]);

  useEffect(() => {
    const loadNotification = async () => {
      try {
        const res = await apiService.getNotifications();
        setNotificationList(Array.isArray(res.data) ? res.data : []);
      } catch (_) {}
    };
    loadNotification();
    const es = apiService.subscribeNotificationUpdates(() => loadNotification());
    return () => es && es.close();
  }, []);

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const res = await apiService.api.get('/api/notifications/list', { params: { type: 'scheme', limit: 50 } });
        setSchemeList(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (_) {
        setSchemeList([]);
      }
    };
    loadSchemes();
    const es = apiService.subscribeNotificationUpdates(() => loadSchemes());
    return () => es && es.close();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', role: '', headline: '', description: '', avatar: '', photo: '', metrics: [], published: true, featured: false });
  };

  const saveEntry = async () => {
    const payload = { ...form };
    if (editingId) {
      const res = await apiService.updateResearch(editingId, payload);
      if (res.success) resetForm();
    } else {
      const res = await apiService.createResearch(payload);
      if (res.success) resetForm();
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry._id);
    const photo = entry.photo || (entry.afterImages || [])[0] || (entry.beforeImages || [])[0] || '';
    setForm({
      name: entry.name || '',
      role: entry.role || '',
      headline: entry.headline || '',
      description: entry.description || '',
      avatar: entry.avatar || '',
      photo: photo,
      metrics: entry.metrics || [],
      published: !!entry.published,
      featured: !!entry.featured
    });
  };

  const removeEntry = async (id) => {
    await apiService.deleteResearch(id);
    if (editingId === id) resetForm();
  };

  const uploadImages = async (files, target) => {
    try {
      setUploadError('');
      setIsUploading(true);
      if (!files || files.length === 0) return;
      const res = await apiService.uploadResearchImages(Array.from(files));
      const urls = (res.files || []).map((f) => f.url);
      if (target === 'avatar') {
        const nextAvatar = urls[0] || form.avatar;
        setForm((f) => ({ ...f, avatar: nextAvatar }));
        if (editingId) {
          await apiService.updateResearch(editingId, { avatar: nextAvatar });
        }
      } else if (target === 'photo') {
        const nextPhoto = urls[0] || form.photo;
        setForm((f) => ({ ...f, photo: nextPhoto }));
        if (editingId) {
          await apiService.updateResearch(editingId, { photo: nextPhoto });
        }
      }
    } catch (e) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (target, url) => {
    try {
      setUploadError('');
      setIsUploading(true);
      const filename = (url || '').split('/').pop();
      let payload;
      if (target === 'avatar') {
        setForm((f) => ({ ...f, avatar: '' }));
        payload = { avatar: '' };
      } else if (target === 'photo') {
        setForm((f) => ({ ...f, photo: '' }));
        payload = { photo: '' };
      }
      if (editingId) {
        await apiService.updateResearch(editingId, payload);
      }
      if (filename) {
        await apiService.deleteResearchUpload(filename);
      }
    } catch (e) {
      setUploadError(e.message || 'Delete failed');
    } finally {
      setIsUploading(false);
    }
  };


  const updateMetric = (idx, field, value) => {
    setForm((f) => {
      const m = f.metrics.slice();
      m[idx] = { ...m[idx], [field]: value };
      return { ...f, metrics: m };
    });
  };

  const removeMetric = (idx) => {
    setForm((f) => {
      const m = f.metrics.slice();
      m.splice(idx, 1);
      return { ...f, metrics: m };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/logo.png" 
                alt="Agro Rakshak" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-green-800">{t('common.appNameDevanagari')}</h1>
                <p className="text-sm text-gray-600">{t('admin.dashboard')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.name || ''}</p>
                <p className="text-xs text-gray-500">{user?.role || ''}</p>
              </div>
              <LanguageSwitcher />
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('auth.logout')}</span>
              </button>
          </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('admin.welcome', { name: user?.name || '' })}</h2>
          <p className="text-gray-600">{t('admin.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <motion.p 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
                      className="text-3xl font-bold text-gray-800 mt-2"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`${stat.color} p-3 rounded-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">{t('admin.userManagement')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('admin.viewManageUsers')}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/users')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('admin.manageUsers')}
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">{t('admin.analytics')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('admin.viewPlatformAnalytics')}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('admin.viewAnalytics')}
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ScrollText className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">{t('admin.schemes')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('admin.manageSchemeNotifications')}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/schemes')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('admin.manageSchemes')}
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">{t('admin.notifications')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('admin.manageNotificationsForUsers')}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/notifications')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('admin.manageNotifications')}
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Package className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-800">{t('admin.orders')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('admin.manageMarketplaceOrders')}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/orders')}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {t('admin.viewOrders')}
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-teal-600" />
              <h3 className="text-xl font-semibold text-gray-800">{t('admin.researchReferences')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('admin.manageResearchReferences')}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/research')}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {t('admin.researchReferences')}
            </motion.button>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
