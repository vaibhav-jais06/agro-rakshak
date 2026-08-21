import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Activity, Calendar, AlertCircle, Syringe, Heart, Settings, Plus, Info, X, Trash2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LivestockManagementPage({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'sick', 'vaccination'

  const getTranslation = (key, defaultText) => {
    const translation = t(key);
    return translation === key ? defaultText : translation;
  };

  // Mock data for livestock
  const [livestockStats, setLivestockStats] = useState({
    totalCattle: 15,
    totalPoultry: 120,
    totalGoats: 8,
    sickAnimals: 2,
    upcomingVaccinations: 3
  });

  const [recentRecords, setRecentRecords] = useState([
    { id: 1, type: 'Cattle', tag: 'C-104', status: 'Sick - Fever', date: '2026-08-20', action: 'Vet Consult Scheduled' },
    { id: 2, type: 'Poultry', tag: 'Flock A', status: 'Healthy', date: '2026-08-19', action: 'Vaccinated (Fowl Pox)' },
    { id: 3, type: 'Goat', tag: 'G-02', status: 'Healthy', date: '2026-08-15', action: 'Routine Checkup' },
    { id: 4, type: 'Cattle', tag: 'C-088', status: 'Healthy - Pregnant', date: '2026-08-10', action: 'Diet Adjusted' },
    { id: 5, type: 'Poultry', tag: 'Flock B', status: 'Healthy', date: '2026-08-08', action: 'Vaccination Due' }
  ]);

  const [newRecord, setNewRecord] = useState({
    type: 'Cattle',
    tag: '',
    status: 'Healthy',
    date: new Date().toISOString().split('T')[0],
    action: ''
  });

  const getImageForType = (type) => {
    switch (type.toLowerCase()) {
      case 'cattle': return 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=100&h=100&fit=crop';
      case 'poultry': return 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=100&h=100&fit=crop'; // Fixed image
      case 'goat': return 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=100&h=100&fit=crop';
      default: return 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=100&h=100&fit=crop';
    }
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newRecord.tag || !newRecord.action) return;

    setRecentRecords([
      { ...newRecord, id: Date.now() },
      ...recentRecords
    ]);
    
    // Update stats conditionally based on status
    if (newRecord.status.toLowerCase().includes('sick')) {
      setLivestockStats(prev => ({ ...prev, sickAnimals: prev.sickAnimals + 1 }));
    }
    if (newRecord.action.toLowerCase().includes('vaccin')) {
      setLivestockStats(prev => ({ ...prev, upcomingVaccinations: Math.max(0, prev.upcomingVaccinations - 1) }));
    }

    setIsAddModalOpen(false);
    setNewRecord({
      type: 'Cattle',
      tag: '',
      status: 'Healthy',
      date: new Date().toISOString().split('T')[0],
      action: ''
    });
  };

  const deleteRecord = (id) => {
    setRecentRecords(recentRecords.filter(r => r.id !== id));
  };

  const filteredRecords = recentRecords.filter(record => {
    if (filterType === 'sick') return record.status.toLowerCase().includes('sick');
    if (filterType === 'vaccination') return record.action.toLowerCase().includes('vaccin');
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-text-primary pb-20 relative"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">{getTranslation('common.backToHome', 'Back to Home')}</span>
          </motion.button>
          <h1 className="font-semibold text-lg">{getTranslation('features.livestockManagement', 'Livestock Management')}</h1>
          <div className="w-24" /> 
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => { setFilterType('all'); setActiveTab('overview'); }}
             className={`glass-card p-6 rounded-3xl border flex flex-col items-center text-center cursor-pointer transition-colors ${filterType === 'all' ? 'bg-blue-50 border-blue-200' : 'bg-white border-border/50 hover:bg-gray-50'}`}
          >
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
               <Heart className="w-6 h-6" />
             </div>
             <h3 className="text-3xl font-bold text-text-primary">{livestockStats.totalCattle + livestockStats.totalPoultry + livestockStats.totalGoats}</h3>
             <p className="text-text-secondary font-medium mt-1">Total Livestock</p>
          </motion.div>

          <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => { setFilterType('sick'); setActiveTab('overview'); }}
             className={`glass-card p-6 rounded-3xl border flex flex-col items-center text-center cursor-pointer transition-colors ${filterType === 'sick' ? 'bg-red-50 border-red-200' : 'bg-white border-border/50 hover:bg-gray-50'}`}
          >
             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
               <Activity className="w-6 h-6" />
             </div>
             <h3 className="text-3xl font-bold text-text-primary">{livestockStats.sickAnimals}</h3>
             <p className="text-text-secondary font-medium mt-1">Health Alerts</p>
          </motion.div>

          <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => { setFilterType('vaccination'); setActiveTab('overview'); }}
             className={`glass-card p-6 rounded-3xl border flex flex-col items-center text-center cursor-pointer transition-colors ${filterType === 'vaccination' ? 'bg-amber-50 border-amber-200' : 'bg-white border-border/50 hover:bg-gray-50'}`}
          >
             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
               <Syringe className="w-6 h-6" />
             </div>
             <h3 className="text-3xl font-bold text-text-primary">{livestockStats.upcomingVaccinations}</h3>
             <p className="text-text-secondary font-medium mt-1">Pending Vaccinations</p>
          </motion.div>

          <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => setIsAddModalOpen(true)}
             className="glass-card bg-primary text-white p-6 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
             <Plus className="w-8 h-8 mb-2" />
             <p className="font-semibold text-lg">Add Record</p>
          </motion.div>
        </section>

        {/* Main Content Area */}
        <section className="glass-card bg-white rounded-3xl border border-border/50 overflow-hidden">
           <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  activeTab === 'health'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                Health & Advisory
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Historical Farm Records
                    </h3>
                    
                    {filterType !== 'all' && (
                      <button 
                        onClick={() => setFilterType('all')}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover bg-primary/10 px-3 py-1.5 rounded-full"
                      >
                        <Filter className="w-4 h-4" />
                        Clear Filter
                      </button>
                    )}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 text-text-secondary text-sm">
                           <th className="pb-3 px-4 font-semibold">Animal Info</th>
                           <th className="pb-3 px-4 font-semibold">Date</th>
                           <th className="pb-3 px-4 font-semibold">Status</th>
                           <th className="pb-3 px-4 font-semibold">Action Taken</th>
                           <th className="pb-3 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-text-secondary">
                              No records found for the current filter.
                            </td>
                          </tr>
                        ) : filteredRecords.map(record => (
                          <tr key={record.id} className="border-b border-border/20 hover:bg-surface-hover/50 transition-colors group">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img src={getImageForType(record.type)} alt={record.type} className="w-10 h-10 rounded-full object-cover border border-border" />
                                <div>
                                  <div className="font-medium text-text-primary">{record.tag}</div>
                                  <div className="text-xs text-text-secondary">{record.type}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-text-secondary font-medium">{record.date}</td>
                            <td className="py-4 px-4 text-sm">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                 record.status.toLowerCase().includes('sick') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'
                               }`}>
                                 {record.status}
                               </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-text-secondary">{record.action}</td>
                            <td className="py-4 px-4 text-right">
                               <button 
                                 onClick={() => deleteRecord(record.id)}
                                 className="p-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'health' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                      <h4 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                         <AlertCircle className="w-5 h-5" />
                         Actionable Advisory Services
                      </h4>
                      <p className="text-blue-800/80 text-sm mb-4">
                        AI-powered insights based on recent health logs and weather conditions.
                      </p>
                      <ul className="space-y-3">
                         <li className="flex gap-3 items-start text-sm text-blue-900">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                           <p><strong>Cattle Alert:</strong> High humidity detected in your region. Ensure proper ventilation in sheds to prevent respiratory issues.</p>
                         </li>
                         <li className="flex gap-3 items-start text-sm text-blue-900">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                           <p><strong>Poultry Alert:</strong> Routine Fowl Pox vaccination is due for Flock B next week. Please schedule a visit from your local vet.</p>
                         </li>
                      </ul>
                   </div>

                   <div className="grid sm:grid-cols-2 gap-6">
                      <div className="border border-border/50 p-6 rounded-2xl hover:border-primary/30 transition-colors">
                         <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                           <Info className="w-4 h-4 text-text-secondary" />
                           Nutrition Tips
                         </h4>
                         <p className="text-sm text-text-secondary">
                           Incorporate mineral mixtures and salt licks for your cattle to boost immunity during the upcoming monsoon season.
                         </p>
                      </div>
                      <div className="border border-border/50 p-6 rounded-2xl hover:border-primary/30 transition-colors">
                         <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                           <Settings className="w-4 h-4 text-text-secondary" />
                           Farm Maintenance
                         </h4>
                         <p className="text-sm text-text-secondary">
                           Disinfect poultry enclosures every two weeks using standard bio-security measures to prevent disease spread.
                         </p>
                      </div>
                   </div>
                </motion.div>
              )}
            </div>
        </section>
      </div>

      {/* Add Record Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h3 className="text-xl font-bold text-text-primary">Add New Record</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddRecord} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Animal Type</label>
                  <select 
                    value={newRecord.type} 
                    onChange={e => setNewRecord({...newRecord, type: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Cattle">Cattle</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Goat">Goat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Animal Tag / ID</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. C-105"
                    value={newRecord.tag}
                    onChange={e => setNewRecord({...newRecord, tag: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Healthy, Sick - Fever"
                    value={newRecord.status}
                    onChange={e => setNewRecord({...newRecord, status: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newRecord.date}
                    onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Action Taken</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Routine Checkup, Vet Consult"
                    value={newRecord.action}
                    onChange={e => setNewRecord({...newRecord, action: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 bg-surface text-text-primary rounded-xl font-medium hover:bg-surface-hover transition-colors border border-border"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
