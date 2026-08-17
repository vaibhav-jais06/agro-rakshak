import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, User, Lock, Phone, MapPin, Sprout, Mail, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/apiService';

export default function Register({ onRegister }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: {
      state: '',
      district: '',
      village: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    farmDetails: {
      landArea: '',
      soilType: '',
      crops: [],
      irrigationType: ''
    },
    preferredLanguage: 'hi-IN',
    cropInsurance: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: val
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: val
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: val
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username && !formData.phone) {
      setError(t('errors.usernamePhoneRequired'));
      return;
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      setError(t('errors.phoneInvalid'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('errors.passwordLength'));
      return;
    }

    setLoading(true);

    try {
        const registrationData = {
        name: formData.name,
        username: formData.username || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        password: formData.password,
        preferredLanguage: formData.preferredLanguage,
        location: {
          state: formData.location.state || undefined,
          district: formData.location.district || undefined,
          village: formData.location.village || undefined,
          coordinates: formData.location.coordinates.latitude && formData.location.coordinates.longitude ? {
            latitude: parseFloat(formData.location.coordinates.latitude),
            longitude: parseFloat(formData.location.coordinates.longitude)
          } : undefined
        },
        farmDetails: {
          landArea: formData.farmDetails.landArea ? parseFloat(formData.farmDetails.landArea) : undefined,
          soilType: formData.farmDetails.soilType || undefined,
          crops: formData.farmDetails.crops.length > 0 
            ? formData.farmDetails.crops.split(',').map(c => c.trim())
            : undefined,
          irrigationType: formData.farmDetails.irrigationType || undefined
        },
        cropInsurance: !!formData.cropInsurance
        };

      const response = await apiService.register(registrationData);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onRegister(response.user);
      } else {
        setError(response.message || t('errors.registrationFailed'));
      }
    } catch (err) {
      setError(err.message || t('errors.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-2xl w-full space-y-8 relative z-10"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              src="/logo.png"
              alt="Agro-Rakshak"
              className="w-16 h-16"
            />
          </div>
          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-text-primary tracking-tight"
          >
            {t('common.appName')}
          </motion.h2>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-sm text-text-secondary"
          >
            {t('auth.createAccount')}
          </motion.p>
        </motion.div>
        
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-8 sm:p-10 bg-white" 
          onSubmit={handleSubmit}
        >
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="border-b border-border/50 pb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t('registration.personalInfo')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('auth.fullName')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-text-secondary" />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder={t('auth.enterFullName')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('auth.username')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-text-secondary" />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder={t('auth.chooseUsername')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('auth.phoneNumber')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-text-secondary" />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      id="phone"
                      name="phone"
                      type="tel"
                      pattern="[6-9][0-9]{9}"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder={t('auth.mobileNumber')}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary">{t('auth.phoneFormat')}</p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('auth.emailOptional')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-secondary" />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder={t('auth.emailPlaceholder')}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-text-secondary italic">* {t('registration.usernameOrPhoneRequired')}</p>
            </div>

            {/* Location Information */}
            <div className="border-b border-border/50 pb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t('registration.locationInfo')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="location.state" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.state')}
                  </label>
                  <input
                    id="location.state"
                    name="location.state"
                    type="text"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.state')}
                  />
                </div>

                <div>
                  <label htmlFor="location.district" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.district')}
                  </label>
                  <input
                    id="location.district"
                    name="location.district"
                    type="text"
                    value={formData.location.district}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.district')}
                  />
                </div>

                <div>
                  <label htmlFor="location.village" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.village')}
                  </label>
                  <input
                    id="location.village"
                    name="location.village"
                    type="text"
                    value={formData.location.village}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.village')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="location.coordinates.latitude" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.latitude')}
                  </label>
                  <input
                    id="location.coordinates.latitude"
                    name="location.coordinates.latitude"
                    type="number"
                    step="any"
                    value={formData.location.coordinates.latitude}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.latitudePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="location.coordinates.longitude" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.longitude')}
                  </label>
                  <input
                    id="location.coordinates.longitude"
                    name="location.coordinates.longitude"
                    type="number"
                    step="any"
                    value={formData.location.coordinates.longitude}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.longitudePlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Farm Details */}
            <div className="border-b border-border/50 pb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                {t('registration.farmDetails')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="farmDetails.landArea" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.landArea')}
                  </label>
                  <input
                    id="farmDetails.landArea"
                    name="farmDetails.landArea"
                    type="number"
                    step="0.1"
                    value={formData.farmDetails.landArea}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.landAreaPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="farmDetails.soilType" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.soilType')}
                  </label>
                  <select
                    id="farmDetails.soilType"
                    name="farmDetails.soilType"
                    value={formData.farmDetails.soilType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">{t('registration.selectSoilType')}</option>
                    <option value="Alluvial">{t('soilTypes.alluvial')}</option>
                    <option value="Black">{t('soilTypes.black')}</option>
                    <option value="Red">{t('soilTypes.red')}</option>
                    <option value="Laterite">{t('soilTypes.laterite')}</option>
                    <option value="Desert">{t('soilTypes.desert')}</option>
                    <option value="Mountain">{t('soilTypes.mountain')}</option>
                    <option value="Clay">{t('soilTypes.clay')}</option>
                    <option value="Sandy">{t('soilTypes.sandy')}</option>
                    <option value="Loamy">{t('soilTypes.loamy')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="farmDetails.crops" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.mainCrops')}
                  </label>
                  <input
                    id="farmDetails.crops"
                    name="farmDetails.crops"
                    type="text"
                    value={formData.farmDetails.crops}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('registration.mainCropsPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="farmDetails.irrigationType" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('registration.irrigationType')}
                  </label>
                  <select
                    id="farmDetails.irrigationType"
                    name="farmDetails.irrigationType"
                    value={formData.farmDetails.irrigationType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">{t('registration.selectIrrigationType')}</option>
                    <option value="Drip">{t('irrigationTypes.drip')}</option>
                    <option value="Sprinkler">{t('irrigationTypes.sprinkler')}</option>
                    <option value="Flood">{t('irrigationTypes.flood')}</option>
                    <option value="Rain-fed">{t('irrigationTypes.rainFed')}</option>
                    <option value="Canal">{t('irrigationTypes.canal')}</option>
                    <option value="Well">{t('irrigationTypes.well')}</option>
                    <option value="Tube Well">{t('irrigationTypes.tubeWell')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="border-b border-border/50 pb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t('registration.preferences')}
              </h3>
              
              <div className="flex items-center gap-3 mb-2">
                <input
                  id="cropInsurance"
                  name="cropInsurance"
                  type="checkbox"
                  checked={formData.cropInsurance}
                  onChange={handleInputChange}
                />
                <label htmlFor="cropInsurance" className="text-lg font-semibold text-text-primary">{t('registration.cropInsurance')}</label>
              </div>
              <p className="mb-4 text-sm text-text-secondary">
                {t('registration.pmfby')}
                <a href="https://pmfby.gov.in/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline ml-1">https://pmfby.gov.in/</a>
              </p>
              <div>
                <label htmlFor="preferredLanguage" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('registration.preferredLanguage')}
                </label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="hi-IN">Hindi (हिन्दी)</option>
                  <option value="en-IN">English</option>
                  <option value="bn-IN">Bengali (বাংলা)</option>
                  <option value="te-IN">Telugu (తెలుగు)</option>
                  <option value="mr-IN">Marathi (मराठी)</option>
                  <option value="ta-IN">Tamil (தமிழ்)</option>
                  <option value="gu-IN">Gujarati (ગુજરાતી)</option>
                  <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                  <option value="ml-IN">Malayalam (മലയാളം)</option>
                  <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {t('registration.security')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('auth.password')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-secondary" />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder={t('auth.createPassword')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('auth.confirmPassword')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-secondary" />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder={t('auth.confirmYourPassword')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 rounded-xl bg-red-50 p-4 border border-red-100"
              >
                <div className="text-sm text-red-600 font-medium text-center">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                t('auth.creatingAccount')
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  {t('auth.register')}
                </>
              )}
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-text-secondary">
              {t('auth.alreadyHaveAccount')}{' '}
              <motion.span whileHover={{ scale: 1.05 }}>
                <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
                  {t('auth.signInHere')}
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
