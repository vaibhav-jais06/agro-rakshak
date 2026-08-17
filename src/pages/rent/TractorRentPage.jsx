import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Truck, Calendar, Clock, MapPin, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import mahindra575 from './Mahindra 575 DI XP Plus.jpeg';
import johnDeere5310 from './John Deere 5310.avif';
import sonalikaTiger55 from './Sonalika Tiger 55.webp';
import kubotaMU4501 from './Kubota MU4501.jpg';
import massey241 from './Massey Ferguson 241.jpg';
import shaktimanRotavator7ft from './Shaktiman Rotavator 7ft.webp';
import fieldkingCultivator11Tyne from './Fieldking Cultivator 11 Tyne.png';
import kirloskarPump5HP from './Kirloskar Water Pump 5HP.webp';
import claasPaddyHarvester from './CLAAS Paddy Harvester.jpg';
import newHollandTC530 from './New Holland Combine TC5.30.jpeg';
import kisanKraftSprayer16L from './KisanKraft Sprayer 16L.webp';
import vstPowerTiller135DI from './VST Shakti Power Tiller 135 DI.jpg';
import mahindraSeedDrill7Row from './Mahindra Seed Drill 7 Row.webp';
import sonalikaStrawReaper from './Sonalika Straw Reaper.webp';
import criSubmersiblePump3HP from './CRI Submersible Pump 3HP.webp';

// Mock Data
const MACHINERY_DATA = [
  {
    id: 1,
    name: "Mahindra 575 DI XP Plus",
    type: "Tractor",
    brand: "Mahindra",
    hp: "47 HP",
    price: 850,
    image: mahindra575,
    available: true,
    location: "Punawale, Pune",
    specs: {
      fuel: "65L",
      transmission: "8F + 2R",
      lifting: "1500 kg"
    }
  },
  {
    id: 2,
    name: "John Deere 5310",
    type: "Tractor",
    brand: "John Deere",
    hp: "55 HP",
    price: 1200,
    image: johnDeere5310,
    available: true,
    location: "Baramati, Pune",
    specs: {
      fuel: "68L",
      transmission: "9F + 3R",
      lifting: "2000 kg"
    }
  },
  {
    id: 3,
    name: "Sonalika Tiger 55",
    type: "Tractor",
    brand: "Sonalika",
    hp: "55 HP",
    price: 950,
    image: sonalikaTiger55,
    available: false,
    location: "Nashik, MH",
    specs: {
      fuel: "65L",
      transmission: "12F + 12R",
      lifting: "2200 kg"
    }
  },
  {
    id: 4,
    name: "Kubota MU4501",
    type: "Tractor",
    brand: "Kubota",
    hp: "45 HP",
    price: 1100,
    image: kubotaMU4501,
    available: true,
    location: "Satara, MH",
    specs: {
      fuel: "60L",
      transmission: "Synchromesh",
      lifting: "1640 kg"
    }
  },
  {
    id: 5,
    name: "Massey Ferguson 241",
    type: "Tractor",
    brand: "Massey",
    hp: "42 HP",
    price: 800,
    image: massey241,
    available: true,
    location: "Pune, MH",
    specs: {
      fuel: "47L",
      transmission: "8F + 2R",
      lifting: "1700 kg"
    }
  }
  ,
  {
    id: 6,
    name: "Shaktiman Rotavator 7ft",
    type: "Rotavator",
    brand: "Shaktiman",
    hp: "45-50 HP",
    price: 600,
    image: shaktimanRotavator7ft,
    available: true,
    location: "Pune, MH",
    specs: {
      fuel: "—",
      transmission: "PTO Driven",
      lifting: "7 ft working width"
    }
  },
  {
    id: 7,
    name: "Fieldking Cultivator 11 Tyne",
    type: "Cultivator",
    brand: "Fieldking",
    hp: "35+ HP",
    price: 400,
    image: fieldkingCultivator11Tyne,
    available: true,
    location: "Sangli, MH",
    specs: {
      fuel: "—",
      transmission: "3-Point Linkage",
      lifting: "11 tyne"
    }
  },
  {
    id: 8,
    name: "Kirloskar Water Pump 5HP",
    type: "Water Pump",
    brand: "Kirloskar",
    hp: "5 HP",
    price: 300,
    image: kirloskarPump5HP,
    available: true,
    location: "Nira, Pune",
    specs: {
      fuel: "Diesel",
      transmission: "Direct Drive",
      lifting: "Max head 30m"
    }
  },
  {
    id: 9,
    name: "CLAAS Paddy Harvester",
    type: "Harvester",
    brand: "CLAAS",
    hp: "75 HP",
    price: 2500,
    image: claasPaddyHarvester,
    available: false,
    location: "Kolhapur, MH",
    specs: {
      fuel: "120L",
      transmission: "Hydrostatic",
      lifting: "Grain tank 2.2t"
    }
  },
  {
    id: 10,
    name: "New Holland Combine TC5.30",
    type: "Harvester",
    brand: "New Holland",
    hp: "175 HP",
    price: 3500,
    image: newHollandTC530,
    available: true,
    location: "Nashik, MH",
    specs: {
      fuel: "200L",
      transmission: "Hydro",
      lifting: "Cutting width 3.96m"
    }
  },
  {
    id: 11,
    name: "KisanKraft Sprayer 16L",
    type: "Sprayer",
    brand: "KisanKraft",
    hp: "—",
    price: 150,
    image: kisanKraftSprayer16L,
    available: true,
    location: "Baramati, Pune",
    specs: {
      fuel: "—",
      transmission: "Manual",
      lifting: "Tank 16L"
    }
  },
  {
    id: 12,
    name: "VST Shakti Power Tiller 135 DI",
    type: "Power Tiller",
    brand: "VST Shakti",
    hp: "13.5 HP",
    price: 900,
    image: vstPowerTiller135DI,
    available: true,
    location: "Satara, MH",
    specs: {
      fuel: "12L",
      transmission: "Gear",
      lifting: "Tilling width 12-36 in"
    }
  },
  {
    id: 13,
    name: "Mahindra Seed Drill 7 Row",
    type: "Seeder",
    brand: "Mahindra",
    hp: "—",
    price: 500,
    image: mahindraSeedDrill7Row,
    available: true,
    location: "Pune, MH",
    specs: {
      fuel: "—",
      transmission: "Tractor-mounted",
      lifting: "7 row"
    }
  },
  {
    id: 14,
    name: "Sonalika Straw Reaper",
    type: "Thresher",
    brand: "Sonalika",
    hp: "45+ HP",
    price: 1200,
    image: sonalikaStrawReaper,
    available: true,
    location: "Nashik, MH",
    specs: {
      fuel: "—",
      transmission: "PTO",
      lifting: "Capacity 1.5t/hr"
    }
  },
  {
    id: 15,
    name: "CRI Submersible Pump 3HP",
    type: "Water Pump",
    brand: "CRI",
    hp: "3 HP",
    price: 280,
    image: criSubmersiblePump3HP,
    available: true,
    location: "Pune, MH",
    specs: {
      fuel: "Electric",
      transmission: "Direct",
      lifting: "Max head 60m"
    }
  }
];

export default function TractorRentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rentalHours, setRentalHours] = useState(4);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredMachines = MACHINERY_DATA.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          machine.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || machine.brand === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const brands = ["All", ...new Set(MACHINERY_DATA.map(m => m.brand))];

  const handleRentClick = (machine) => {
    setSelectedMachine(machine);
    setShowModal(true);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = () => {
    // Simulate API call
    setTimeout(() => {
      setBookingSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setBookingSuccess(false);
        setSelectedMachine(null);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-panel h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-text-primary" />
          </button>
          <h1 className="text-lg font-semibold">{t('rent.title', 'Farm Machinery Rental')}</h1>
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Truck className="w-6 h-6 text-primary" />
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center md:text-left"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {t('rent.subtitle', 'Find the perfect machinery for your farm')}
          </h2>
          <p className="text-text-secondary max-w-2xl text-lg">
            {t('rent.description')}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 z-30 bg-background/95 backdrop-blur-xl py-4 border-b border-border/50 -mx-6 px-6 md:mx-0 md:px-0 md:border-none md:bg-transparent">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder={t('rent.searchPlaceholder', 'Search by name or location...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedCategory(brand)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === brand 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {brand === "All" ? t('rent.allBrands', 'All Brands') : brand}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((machine, index) => (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-surface rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={machine.image} 
                  alt={machine.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-text-primary border border-border/50">
                  {machine.hp}
                </div>
                {!machine.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                      {t('rent.booked', 'Booked')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{machine.brand}</p>
                    <h3 className="text-xl font-bold text-text-primary leading-tight">{machine.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                  <MapPin className="w-4 h-4" />
                  {machine.location}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-background rounded-xl p-2 text-center border border-border/50">
                    <div className="text-[10px] text-text-secondary uppercase">{t('rent.fuelCapacity')}</div>
                    <div className="font-semibold text-sm">{machine.specs.fuel}</div>
                  </div>
                  <div className="bg-background rounded-xl p-2 text-center border border-border/50">
                    <div className="text-[10px] text-text-secondary uppercase">{t('rent.transmission')}</div>
                    <div className="font-semibold text-sm truncate">{machine.specs.transmission}</div>
                  </div>
                  <div className="bg-background rounded-xl p-2 text-center border border-border/50">
                    <div className="text-[10px] text-text-secondary uppercase">{t('rent.liftingCapacity', 'Lifting')}</div>
                    <div className="font-semibold text-sm">{machine.specs.lifting}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <span className="text-2xl font-bold text-text-primary">₹{machine.price}</span>
                    <span className="text-sm text-text-secondary">{t('rent.perHourAbbrev', '/hr')}</span>
                  </div>
                  <button
                    onClick={() => handleRentClick(machine)}
                    disabled={!machine.available}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      machine.available 
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25 active:scale-95' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {t('rent.rentNow', 'Rent Now')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedMachine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface w-full max-w-md rounded-3xl p-6 shadow-2xl z-50 overflow-hidden"
            >
              {bookingSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">{t('rent.bookingSuccessTitle')}</h3>
                  <p className="text-text-secondary">{t('rent.bookingSuccessMessage')}</p>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-surface-hover rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1">{t('rent.confirmRental')}</h3>
                    <p className="text-text-secondary">{selectedMachine.name}</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('rent.durationHours')}
                      </label>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setRentalHours(Math.max(1, rentalHours - 1))}
                          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-surface-hover"
                        >
                          -
                        </button>
                        <span className="text-xl font-bold w-12 text-center">{rentalHours}</span>
                        <button 
                          onClick={() => setRentalHours(rentalHours + 1)}
                          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-surface-hover"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-background rounded-2xl p-4">
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-text-secondary">{t('rent.ratePerHour')}</span>
                        <span className="font-medium">₹{selectedMachine.price}</span>
                      </div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-text-secondary">{t('rent.serviceFee')}</span>
                        <span className="font-medium">₹50</span>
                      </div>
                      <div className="h-px bg-border my-2"></div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>{t('rent.total')}</span>
                        <span className="text-primary">₹{(selectedMachine.price * rentalHours) + 50}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmBooking}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all active:scale-95"
                    >
                      {t('rent.confirmAndContactOwner')}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
