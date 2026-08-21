import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './i18n';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  initializeCapacitor,
  isNativePlatform,
  getPlatform,
  addAppStateListener,
  addNetworkListener,
  getStorageItem,
  setStorageItem,
  removeStorageItem
} from './services/capacitorService';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminPanel from './components/panels/AdminPanel';
import UserPortal from './components/panels/UserPortal';
import WeatherIntelligenceSystem from './components/weather/WeatherIntelligenceSystem';
import VoiceAssistant from './components/voice/VoiceAssistant';
import SoilHealthPage from './pages/soil-health/SoilHealthPage';
import CropAnalysisPage from './pages/CropAnalysisPage';
import AgriShopApp from './agromarket/AgriShopApp';
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import WarehouseGuidePage from './pages/warehouse/WarehouseGuidePage';
import PesticidePredictorPage from './pages/pesticide/PesticidePredictorPage';
import TractorRentPage from './pages/rent/TractorRentPage';
import LivestockManagementPage from './pages/livestock/LivestockManagementPage';
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerProfile from './pages/farmer/Profile';
import FarmerCrops from './pages/farmer/Crops';
import FarmerCropDetail from './pages/farmer/CropDetail';
import FarmerFinances from './pages/farmer/Finances';
import FarmerLands from './pages/farmer/Lands';
import FarmerSchemes from './pages/farmer/Schemes';
import FarmerConsultations from './pages/farmer/Consultations';
import ManageUsers from './pages/admin/ManageUsers';
import ManageSchemes from './pages/admin/ManageSchemes';
import ManageNotifications from './pages/admin/ManageNotifications';
import ManageOrders from './pages/admin/ManageOrders';
import ManageResearch from './pages/admin/ManageResearch';

export default function AgroRakshak() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initialize Capacitor if running on native platform
    const initApp = async () => {
      try {
        if (isNativePlatform()) {
          console.log(`🚀 Running on ${getPlatform()} platform`);
          await initializeCapacitor();

          // Setup app state listener
          addAppStateListener((isActive) => {
            console.log(`App is ${isActive ? 'active' : 'inactive'}`);
            if (isActive) {
              // App came to foreground - could refresh data here
              console.log('App resumed');
            }
          });

          // Setup network listener
          addNetworkListener(({ connected }) => {
            setIsOnline(connected);
            if (connected) {
              toast.success('Back online!', { icon: '🌐' });
            } else {
              toast.error('No internet connection', { icon: '📡' });
            }
          });

          // Load user from Capacitor storage if native
          const storedUser = await getStorageItem('user');
          const token = await getStorageItem('token');

          if (storedUser && token) {
            setUser(storedUser);
          }
        } else {
          // Web platform - use localStorage
          const storedUser = localStorage.getItem('user');
          const token = localStorage.getItem('token');

          if (storedUser && token) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
            } catch (error) {
              console.error('Error parsing user data:', error);
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        // Minimum load time for smooth animation
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
      }
    };

    initApp();
  }, []);

  const handleLogin = async (userData) => {
    setUser(userData);

    // Store user data in both localStorage and Capacitor storage
    if (isNativePlatform()) {
      await setStorageItem('user', userData);
    }
  };

  const handleLogout = async () => {
    // Clear from both localStorage and Capacitor storage
    if (isNativePlatform()) {
      await removeStorageItem('user');
      await removeStorageItem('token');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register onRegister={handleLogin} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : user.role === 'admin' ? (
                <AdminPanel user={user} onLogout={handleLogout} />
              ) : (
                <UserPortal user={user} onLogout={handleLogout} />
              )
            }
          />
          <Route
            path="/weather-intelligence"
            element={<WeatherIntelligenceSystem user={user} />}
          />
          <Route
            path="/voice-assistant"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <VoiceAssistant user={user} />
              )
            }
          />
          <Route
            path="/soil-health"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <SoilHealthPage user={user} />
              )
            }
          />
          <Route
            path="/crop-analysis"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <CropAnalysisPage user={user} />
              )
            }
          />
          <Route
            path="/agri-shop/*"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <AgriShopApp />
              )
            }
          />
          <Route
            path="/knowledge-hub"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <KnowledgeHubPage user={user} />
              )
            }
          />
          <Route
            path="/warehouse-guide"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <WarehouseGuidePage user={user} />
              )
            }
          />
          <Route
            path="/pesticide-predictor"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <PesticidePredictorPage user={user} />
              )
            }
          />
          <Route
            path="/tractor-rent"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <TractorRentPage user={user} />
              )
            }
          />
          <Route
            path="/livestock-management"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <LivestockManagementPage user={user} />
              )
            }
          />
          <Route
            path="/farmer/dashboard"
            element={!user ? <Navigate to="/login" replace /> : <FarmerDashboard user={user} />}
          />
          <Route
            path="/farmer/profile"
            element={!user ? <Navigate to="/login" replace /> : <FarmerProfile user={user} />}
          />
          <Route
            path="/farmer/crops"
            element={!user ? <Navigate to="/login" replace /> : <FarmerCrops user={user} />}
          />
          <Route
            path="/farmer/crops/:id"
            element={!user ? <Navigate to="/login" replace /> : <FarmerCropDetail user={user} />}
          />
          <Route
            path="/farmer/finances"
            element={!user ? <Navigate to="/login" replace /> : <FarmerFinances user={user} />}
          />
          <Route
            path="/farmer/lands"
            element={!user ? <Navigate to="/login" replace /> : <FarmerLands user={user} />}
          />
          <Route
            path="/farmer/schemes"
            element={!user ? <Navigate to="/login" replace /> : <FarmerSchemes user={user} />}
          />
          <Route
            path="/farmer/consultations"
            element={!user ? <Navigate to="/login" replace /> : <FarmerConsultations user={user} />}
          />
          <Route
            path="/admin/users"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : user.role === 'admin' ? (
                <ManageUsers />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/schemes"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : user.role === 'admin' ? (
                <ManageSchemes />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/notifications"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : user.role === 'admin' ? (
                <ManageNotifications />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/orders"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : user.role === 'admin' ? (
                <ManageOrders />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/research"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : user.role === 'admin' ? (
                <ManageResearch />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}
