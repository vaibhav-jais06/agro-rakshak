import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Activity, Calendar, AlertCircle, Syringe, Heart, Settings, Plus, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LivestockManagementPage({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

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
    { id: 4, type: 'Cattle', tag: 'C-088', status: 'Healthy - Pregnant', date: '2026-08-10', action: 'Diet Adjusted' }
  ]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-text-primary pb-20"
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
            <span className="font-medium hidden sm:inline">{t('common.backToHome') || 'Back to Home'}</span>
          </motion.button>
          <h1 className="font-semibold text-lg">{t('features.livestockManagement') || 'Livestock Management'}</h1>
          <div className="w-24" /> 
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card bg-white p-6 rounded-3xl border border-border/50 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
               <Heart className="w-6 h-6" />
             </div>
             <h3 className="text-3xl font-bold text-text-primary">{livestockStats.totalCattle + livestockStats.totalPoultry + livestockStats.totalGoats}</h3>
             <p className="text-text-secondary font-medium mt-1">Total Livestock</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-border/50 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
               <Activity className="w-6 h-6" />
             </div>
             <h3 className="text-3xl font-bold text-text-primary">{livestockStats.sickAnimals}</h3>
             <p className="text-text-secondary font-medium mt-1">Health Alerts</p>
          </div>

          <div className="glass-card bg-white p-6 rounded-3xl border border-border/50 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
               <Syringe className="w-6 h-6" />
             </div>
             <h3 className="text-3xl font-bold text-text-primary">{livestockStats.upcomingVaccinations}</h3>
             <p className="text-text-secondary font-medium mt-1">Pending Vaccinations</p>
          </div>

          <div className="glass-card bg-primary text-white p-6 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
             <Plus className="w-8 h-8 mb-2" />
             <p className="font-semibold text-lg">Add Record</p>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="glass-card bg-white rounded-3xl border border-border/50 overflow-hidden">
           <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  activeTab === 'health'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                Health & Advisory
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Historical Farm Records
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 text-text-secondary text-sm">
                           <th className="pb-3 px-4 font-semibold">Date</th>
                           <th className="pb-3 px-4 font-semibold">Animal Tag</th>
                           <th className="pb-3 px-4 font-semibold">Type</th>
                           <th className="pb-3 px-4 font-semibold">Status</th>
                           <th className="pb-3 px-4 font-semibold">Action Taken</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRecords.map(record => (
                          <tr key={record.id} className="border-b border-border/20 hover:bg-surface-hover/50 transition-colors">
                            <td className="py-4 px-4 text-sm font-medium">{record.date}</td>
                            <td className="py-4 px-4 text-sm">{record.tag}</td>
                            <td className="py-4 px-4 text-sm">{record.type}</td>
                            <td className="py-4 px-4 text-sm">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                 record.status.includes('Sick') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                               }`}>
                                 {record.status}
                               </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-text-secondary">{record.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'health' && (
                <div className="space-y-6">
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
                      <div className="border border-border/50 p-6 rounded-2xl">
                         <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                           <Info className="w-4 h-4 text-text-secondary" />
                           Nutrition Tips
                         </h4>
                         <p className="text-sm text-text-secondary">
                           Incorporate mineral mixtures and salt licks for your cattle to boost immunity during the upcoming monsoon season.
                         </p>
                      </div>
                      <div className="border border-border/50 p-6 rounded-2xl">
                         <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                           <Settings className="w-4 h-4 text-text-secondary" />
                           Farm Maintenance
                         </h4>
                         <p className="text-sm text-text-secondary">
                           Disinfect poultry enclosures every two weeks using standard bio-security measures to prevent disease spread.
                         </p>
                      </div>
                   </div>
                </div>
              )}
            </div>
        </section>

      </div>
    </motion.div>
  );
}
