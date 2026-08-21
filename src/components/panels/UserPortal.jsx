import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  Cloud,
  Camera,
  Droplets,
  BookOpen,
  Package,
  Globe,
  Menu,
  X,
  Mic,
  Sun,
  CloudRain,
  Wind,
  User,
  LogOut,
  ArrowRight,
  Search,
  MapPin,
  Truck,
  Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaInstagram, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import ResearchReferencesSlider from "../ResearchReferences/ResearchReferencesSlider";
import NotificationBar from "../widgets/NotificationBar";
import NotificationBanner from "../widgets/NotificationBanner";
import weatherService from "../../services/weatherService";
import notificationService from "../../services/notificationService";
import LanguageSwitcher from "../LanguageSwitcher";

export default function UserPortal({ user, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    fetchWeatherData();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    const hasPermission = await notificationService.requestPermission();
    setNotificationPermission(hasPermission);
    if (hasPermission && user?._id) {
      await notificationService.subscribeToPushNotifications(user._id);
    }
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getCurrentWeatherAuto();
      if (data?.locationName) setLocationName(data.locationName);
      setWeather(data);
    } catch (error) {
      setWeather({
        temp: 28,
        condition: "Partly Cloudy",
        humidity: 65,
        windSpeed: 12,
      });
    } finally {
      setLoading(false);
    }
  };



  const handleSearchChange = async (e) => {
    const v = e.target.value;
    setSearchTerm(v);
    setShowSuggestions(true);
    if (v.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await weatherService.searchLocation(v);
      setSuggestions(results);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const selectSuggestion = async (s) => {
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
    const name = `${s.name}${s.state ? ", " + s.state : ""}${s.country ? ", " + s.country : ""}`;
    setLocationName(name);
    setLoading(true);
    try {
      const data = await weatherService.getCurrentWeather(s.lat, s.lon);
      setWeather(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = async () => {
    setLoading(true);
    try {
      const data = await weatherService.getCurrentWeatherAuto();
      if (data?.locationName) setLocationName(data.locationName);
      setWeather(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const features = [
    {
      icon: <CloudRain className="w-6 h-6" />,
      title: t("features.weatherIntelligence"),
      desc: t("features.weatherIntelligenceDesc"),
      color: "text-blue-500",
      bg: "bg-blue-50",
      onClick: () => navigate("/weather-intelligence"),
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: t("features.cropDiagnosis"),
      desc: t("features.cropDiagnosisDesc"),
      color: "text-purple-500",
      bg: "bg-purple-50",
      onClick: () => navigate("/crop-analysis"),
    },
    {
      icon: <Sprout className="w-6 h-6" />,
      title: t("features.soilHealth"),
      desc: t("features.soilHealthDesc"),
      color: "text-green-500",
      bg: "bg-green-50",
      onClick: () => navigate("/soil-health"),
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: t("features.fertilizerPredictor"),
      desc: t("features.fertilizerPredictorDesc"),
      color: "text-teal-500",
      bg: "bg-teal-50",
      onClick: () => navigate("/pesticide-predictor"),
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: t("features.knowledgeHub"),
      desc: t("features.knowledgeHubDesc"),
      color: "text-orange-500",
      bg: "bg-orange-50",
      onClick: () => navigate("/knowledge-hub"),
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: t("features.postHarvestStorage"),
      desc: t("features.postHarvestStorageDesc"),
      color: "text-amber-500",
      bg: "bg-amber-50",
      onClick: () => navigate("/warehouse-guide"),
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: t("features.tractorRent"),
      desc: t("features.tractorRentDesc"),
      color: "text-rose-500",
      bg: "bg-rose-50",
      onClick: () => navigate("/tractor-rent"),
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t("features.agriShop"),
      desc: t("features.agriShopDesc"),
      color: "text-lime-500",
      bg: "bg-lime-50",
      onClick: () => navigate("/agri-shop"),
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: t("features.livestockManagement") || "Livestock Management",
      desc: t("features.livestockManagementDesc") || "Monitor livestock health, records, and get advisory",
      color: "text-cyan-500",
      bg: "bg-cyan-50",
      onClick: () => navigate("/livestock-management"),
    },
  ];

  const springConfig = { type: "spring", stiffness: 300, damping: 30 };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary-light selection:text-white">
      <NotificationBanner userId={user?._id} user={user} />
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src="/assets/images/logo.png" height={30} width={30} alt={t('common.appName')} />
              <h1 className="text-xl font-bold tracking-tight text-text-primary">
                {t("common.appName")}
              </h1>
            </motion.div>

            <nav className="hidden md:flex items-center gap-8">
              {["home", "solution"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-sm font-medium text-text-secondary hover:text-primary transition-colors capitalize"
                >
                  {t(`navbar.${item}`)}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <div className="h-4 w-px bg-border mx-2"></div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/farmer/dashboard')}
                  aria-label={t('userPortal.openFarmerDashboard')}
                  className="text-sm font-medium text-text-primary hover:text-primary transition-colors cursor-pointer px-3 py-1 rounded-full bg-white border border-border hover:bg-surface-hover"
                >
                  {user?.name || t('userPortal.myDashboard')}
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-secondary hover:text-danger"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-text-primary hover:bg-surface-hover rounded-full transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-surface border-t border-border px-6 py-4 shadow-lg"
            >
              <div className="flex flex-col gap-4">
                {["home", "solution"].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="text-left text-base font-medium text-text-primary py-2 capitalize"
                  >
                    {t(`navbar.${item}`)}
                  </button>
                ))}
                <div className="h-px bg-border my-2"></div>
                <div className="flex items-center justify-between py-2">
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/farmer/dashboard') }}
                    aria-label={t('userPortal.openFarmerDashboard')}
                    className="font-medium text-text-primary text-left cursor-pointer px-3 py-2 rounded-md bg-white border border-border hover:bg-surface-hover"
                  >
                    {user?.name || t('userPortal.myDashboard')}
                  </button>
                  <button
                    onClick={onLogout}
                    className="text-danger text-sm font-medium"
                  >
                    {t("auth.logout")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="pt-20">
        <NotificationBar />
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 space-y-24">
        <section id="home" className="pt-12 lg:pt-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-surface text-primary text-xs font-semibold tracking-wide uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                {t("hero.newFeature")}
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-text-primary mb-6 leading-[1.1]">
                {t("hero.title")}
              </h1>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed max-w-lg">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springConfig}
                  onClick={() => navigate("/farmer/dashboard")}
                  className="px-8 py-4 bg-primary text-white rounded-full font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  {t("hero.getStarted")} <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springConfig}
                  onClick={() => navigate("/voice-assistant")}
                  className="px-8 py-4 bg-surface text-text-primary border border-border rounded-full font-medium hover:bg-surface-hover transition-all flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" /> {t("navbar.voiceAssist")}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative glass-card rounded-3xl p-8 overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-text-primary mb-1">
                      {t("weather.title")}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {locationName || t("weather.unknownLocation")}
                    </p>
                  </div>
                  <button
                    onClick={useMyLocation}
                    className="p-2 bg-surface-hover hover:bg-border/50 rounded-full text-text-primary transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative mb-8 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={t("weather.searchCityOrVillage")}
                    className="w-full bg-background border border-transparent focus:bg-surface focus:border-primary/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-medium text-text-primary"
                  />
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-xl border border-border/50 overflow-hidden z-10 max-h-48 overflow-y-auto"
                      >
                        {suggestions.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectSuggestion(s)}
                            className="px-4 py-3 hover:bg-surface-hover cursor-pointer text-sm text-text-primary border-b border-border/50 last:border-none"
                          >
                            {s.name}, {s.state}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {loading ? (
                  <div className="h-40 flex items-center justify-center text-text-secondary animate-pulse">
                    {t('common.loading')}
                  </div>
                ) : (
                  weather && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-6xl font-bold text-text-primary tracking-tighter mb-2">
                          {weather.temp}°
                        </div>
                        <div className="text-lg text-text-secondary font-medium">
                          {weather.condition}
                        </div>
                      </div>
                      <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/20 flex items-center justify-center">
                        <Sun className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )
                )}

                {weather && (
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                        {t("weather.humidity")}
                      </div>
                      <div className="font-semibold text-text-primary">
                        {weather.humidity}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                        {t("weather.wind")}
                      </div>
                      <div className="font-semibold text-text-primary">
                        {weather.windSpeed} m/s
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                        {t("weather.feelsLike")}
                      </div>
                      <div className="font-semibold text-text-primary">
                        {weather.feels_like}°
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>



        <section id="solution">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {t("solution.title")}
              </h2>
              <p className="text-lg text-text-secondary">
                {t("solution.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group p-6 bg-surface rounded-3xl border border-border/50 hover:shadow-subtle hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer"
                onClick={feature.onClick}
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-[2.5rem] bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 p-12 md:p-20 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium mb-6 border border-white/10">
                {t("cropAnalysis.aiPoweredTechnology")}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-200">
                {t("cropAnalysis.title")}
              </h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-md">
                {t("cropAnalysis.subtitle")}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/crop-analysis")}
                className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-gray-50 transition-all shadow-lg flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                {t("cropAnalysis.startAnalysisNow")}
              </motion.button>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  {[
                    {
                      label: t("cropAnalysis.plantIdentification"),
                      desc: t("cropAnalysis.plantIdentificationDesc"),
                      icon: ({ className }) => (
                        <img
                          src="/logo.png"
                          alt="Agro-Rakshak"
                          className="w-5 h-5"
                        />
                      ),
                      noWrapper: true,
                    },
                    {
                      label: t("cropAnalysis.diseaseDetection"),
                      desc: t("cropAnalysis.diseaseDetectionDesc"),
                      icon: BookOpen,
                    },
                    {
                      label: t("cropAnalysis.soilAnalysis"),
                      desc: t("cropAnalysis.soilAnalysisDesc"),
                      icon: Droplets,
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 items-start"
                    >
                      {item.noWrapper ? (
                        <div className="flex-shrink-0">
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {item.label}
                        </h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ResearchReferencesSlider />


      </main>

      <footer className="bg-surface border-t border-border py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Agro-Rakshak" className="w-8 h-8" />
              <span className="text-xl font-bold text-text-primary">
                {t("common.appName")}
              </span>
            </div>
            <p className="text-text-secondary max-w-sm mb-8">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61584192487025" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border">
                <FaXTwitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/agro_rakshak?igsh=MXVwdWp6ajUycGVuNA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-6">
              {t("footer.quickLinks")}
            </h4>
            <div className="space-y-4">
              {[t("navbar.home"), t("navbar.solution")].map((item, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-text-secondary hover:text-primary transition-colors block"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-6">
              {t("footer.contact")}
            </h4>
            <div className="space-y-4 text-sm text-text-secondary">
              <a href="mailto:agrorakshak22@gmail.com" className="block hover:text-primary transition-colors">agrorakshak22@gmail.com</a>
              <p>India</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border text-center text-sm text-text-secondary">
          <p>
            &copy; {new Date().getFullYear()} Agro Rakshak. All rights
            reserved.
          </p>
        </div>
      </footer>
      <motion.a
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        href="https://wa.me/15556480528?text=Hello%20Agro%20Rakshak%20Support"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:bg-[#1ebe57]"
      >
        <FaWhatsapp className="w-7 h-7" />
      </motion.a>
    </div>
  );
}
