import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sprout, Warehouse as WarehouseIcon, MapPin, BookOpen, Thermometer, Droplets, Clock, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';
import { getCommodityPrices } from '../../agromarket/utils/api';

const CROP_STORAGE = [
  { name: 'Wheat', type: 'Cereal', temp: '15‑20°C', humidity: '≤12% grain moisture', life: '12 months', precautions: 'Stack on pallets, fumigate every 45 days.' },
  { name: 'Rice (Paddy)', type: 'Cereal', temp: '18‑22°C', humidity: '14% grain moisture', life: '10 months', precautions: 'Aerate weekly to avoid fungal growth.' },
  { name: 'Maize', type: 'Cereal', temp: '15‑18°C', humidity: '≤13%', life: '9 months', precautions: 'Use PICS bags to arrest weevils.' },
  { name: 'Sorghum', type: 'Cereal', temp: '15‑18°C', humidity: '≤12%', life: '8 months', precautions: 'Ventilate bi-weekly to limit heating.' },
  { name: 'Pearl Millet', type: 'Cereal', temp: '12‑16°C', humidity: '≤12%', life: '7 months', precautions: 'Double-line gunny bags with LDPE.' },
  { name: 'Barley', type: 'Cereal', temp: '12‑15°C', humidity: '≤12%', life: '10 months', precautions: 'Store in cool godowns to maintain malt quality.' },
  { name: 'Chickpea', type: 'Pulse', temp: '12‑18°C', humidity: '≤10%', life: '10 months', precautions: 'Metal bins with neem leaves deter bruchids.' },
  { name: 'Pigeon Pea', type: 'Pulse', temp: '16‑20°C', humidity: '≤11%', life: '8 months', precautions: 'Phosphine fumigation every 60 days.' },
  { name: 'Green Gram', type: 'Pulse', temp: '15‑20°C', humidity: '≤10%', life: '8 months', precautions: 'Triple-layer PICS bags for weevil control.' },
  { name: 'Black Gram', type: 'Pulse', temp: '15‑20°C', humidity: '≤11%', life: '7 months', precautions: 'Blend dried neem/castor leaves for pest deterrence.' },
  { name: 'Lentil', type: 'Pulse', temp: '12‑18°C', humidity: '≤11%', life: '10 months', precautions: 'Hermetic storage with phosphine tablets.' },
  { name: 'Soybean', type: 'Oilseed', temp: '12‑15°C', humidity: '≤11%', life: '6 months', precautions: 'Purge with nitrogen to slow rancidity.' },
  { name: 'Groundnut (pod)', type: 'Oilseed', temp: '10‑15°C', humidity: '≤8%', life: '7 months', precautions: 'Turn stacks weekly; keep RH <65%.' },
  { name: 'Mustard', type: 'Oilseed', temp: '10‑12°C', humidity: '≤8%', life: '10 months', precautions: 'Use airtight bins to avoid oxidation.' },
  { name: 'Sunflower', type: 'Oilseed', temp: '8‑12°C', humidity: '≤8%', life: '6 months', precautions: 'Monitor FFA count, aerate frequently.' },
  { name: 'Sesame', type: 'Oilseed', temp: '8‑10°C', humidity: '≤8%', life: '9 months', precautions: 'Opaque HDPE drums protect from light.' },
  { name: 'Cotton (lint)', type: 'Fiber', temp: 'Ambient dry', humidity: '8‑10%', life: '12 months', precautions: 'Keep bales on dunnage, avoid moisture.' },
  { name: 'Sugarcane', type: 'Commercial', temp: '15‑20°C', humidity: '≥70% RH', life: '48 hrs', precautions: 'Process quickly; cover billets with wet gunny.' },
  { name: 'Potato', type: 'Tuber', temp: '2‑4°C', humidity: '90‑95% RH', life: '6 months', precautions: 'Cure 10 days at 18°C before cold storage.' },
  { name: 'Onion', type: 'Bulb', temp: '28‑30°C', humidity: '65‑70% RH', life: '3 months', precautions: 'Use ventilated racks, limit stack height.' },
  { name: 'Garlic', type: 'Bulb', temp: '0‑2°C', humidity: '65‑70% RH', life: '6 months', precautions: 'Hang braids with forced airflow.' },
  { name: 'Tomato', type: 'Vegetable', temp: '12‑13°C', humidity: '85‑90% RH', life: '3 weeks', precautions: 'Avoid ethylene exposure for mature-green fruit.' },
  { name: 'Brinjal (Eggplant)', type: 'Vegetable', temp: '8‑10°C', humidity: '90‑95% RH', life: '2 weeks', precautions: 'Use padded crates to prevent bruising.' },
  { name: 'Cabbage', type: 'Vegetable', temp: '0‑1°C', humidity: '95% RH', life: '2 months', precautions: 'Wrap heads in perforated film.' },
  { name: 'Cauliflower', type: 'Vegetable', temp: '0‑1°C', humidity: '95% RH', life: '4 weeks', precautions: 'Hydro-cool before storage to slow browning.' },
  { name: 'Okra', type: 'Vegetable', temp: '8‑10°C', humidity: '95% RH', life: '10 days', precautions: 'Breathable clamshells reduce desiccation.' },
  { name: 'Bitter Gourd', type: 'Vegetable', temp: '12‑13°C', humidity: '90‑95% RH', life: '14 days', precautions: 'Pre-cool and wrap with perforated film.' },
  { name: 'Bottle Gourd', type: 'Vegetable', temp: '10‑12°C', humidity: '90% RH', life: '3 weeks', precautions: 'Use foam-net sleeves to avoid scarring.' },
  { name: 'Pumpkin', type: 'Vegetable', temp: '10‑12°C', humidity: '60‑70% RH', life: '3 months', precautions: 'Cure rind 10 days before storage.' },
  { name: 'Carrot', type: 'Root', temp: '0‑1°C', humidity: '95‑98% RH', life: '4 months', precautions: 'Store in perforated polybag with crushed ice.' },
  { name: 'Beetroot', type: 'Root', temp: '0‑1°C', humidity: '95% RH', life: '4 months', precautions: 'Maintain high RH to avoid shriveling.' },
  { name: 'Mango', type: 'Fruit', temp: '12‑13°C', humidity: '85‑90% RH', life: '3 weeks', precautions: 'Hot-water dip + MAP liners.' },
  { name: 'Banana', type: 'Fruit', temp: '13‑14°C', humidity: '90‑95% RH', life: '4 weeks', precautions: 'Ethylene scrubbers during transit.' },
  { name: 'Apple', type: 'Fruit', temp: '0‑1°C', humidity: '90‑95% RH', life: '8 months', precautions: 'Controlled atmosphere 2% O₂, 2% CO₂.' },
  { name: 'Grapes', type: 'Fruit', temp: '0‑1°C', humidity: '90‑95% RH', life: '8 weeks', precautions: 'SO₂ pads plus perforated liners.' },
  { name: 'Pomegranate', type: 'Fruit', temp: '5‑7°C', humidity: '90‑95% RH', life: '12 weeks', precautions: 'Light wax coating minimizes shrinkage.' },
  { name: 'Guava', type: 'Fruit', temp: '5‑8°C', humidity: '90% RH', life: '3 weeks', precautions: 'Fungicidal dip + forced-air cooling.' },
  { name: 'Papaya', type: 'Fruit', temp: '7‑10°C', humidity: '90% RH', life: '3 weeks', precautions: 'Hot-water treat to control anthracnose.' },
  { name: 'Sapota (Chikoo)', type: 'Fruit', temp: '12‑13°C', humidity: '85‑90% RH', life: '3 weeks', precautions: 'Pre-cool and store in MAP pouches.' },
  { name: 'Litchi', type: 'Fruit', temp: '1‑2°C', humidity: '95% RH', life: '4 weeks', precautions: 'SO₂ fumigation prevents browning.' },
  { name: 'Orange', type: 'Fruit', temp: '3‑4°C', humidity: '85‑90% RH', life: '10 weeks', precautions: 'Maintain ventilation to reduce mold.' },
  { name: 'Turmeric', type: 'Spice', temp: '10‑12°C', humidity: '70% RH', life: '10 months', precautions: 'Sulfur fumigation in dark rooms.' },
  { name: 'Ginger', type: 'Spice', temp: '12‑14°C', humidity: '85% RH', life: '5 months', precautions: 'Layer rhizomes with dry sand.' },
  { name: 'Cardamom', type: 'Spice', temp: '10‑12°C', humidity: '55% RH', life: '12 months', precautions: 'Moisture-proof tins, low light.' },
  { name: 'Black Pepper', type: 'Spice', temp: '25°C', humidity: '11% seed moisture', life: '12 months', precautions: 'Gunny bags lined with polyethylene.' },
  { name: 'Coriander', type: 'Spice', temp: '25°C', humidity: '9% moisture', life: '10 months', precautions: 'Rotate stacks monthly to prevent heating.' },
  { name: 'Cumin', type: 'Spice', temp: '20‑25°C', humidity: '8% moisture', life: '9 months', precautions: 'Food-grade HDPE drums with silica gel.' },
  { name: 'Fennel', type: 'Spice', temp: '20‑25°C', humidity: '9% moisture', life: '10 months', precautions: 'Cool, dark godowns to retain volatile oils.' },
  { name: 'Red Chilli (Dry)', type: 'Spice', temp: '25°C', humidity: '≤10% moisture', life: '12 months', precautions: 'Use sulfur fumigation against mould.' },
  { name: 'Cashew Kernel', type: 'Nut', temp: '5‑7°C', humidity: '50% RH', life: '9 months', precautions: 'Vacuum pack with oxygen absorbers.' },
  { name: 'Coconut (copra)', type: 'Commercial', temp: '25°C', humidity: '8% moisture', life: '10 months', precautions: 'Store above ground with aeration.' },
  { name: 'Tea (made)', type: 'Plantation', temp: 'Cool & dry', humidity: '≤3% moisture', life: '12 months', precautions: 'Aluminium-lined chests, no cross-odour.' },
  { name: 'Coffee (parchment)', type: 'Plantation', temp: '18‑22°C', humidity: '10‑11% moisture', life: '10 months', precautions: 'Sisal bags on pallets, low humidity.' },
  { name: 'Cocoa Beans', type: 'Plantation', temp: '15‑20°C', humidity: '7% moisture', life: '12 months', precautions: 'Jute bags in ventilated godowns.' }
];

const STATE_WAREHOUSES = {
  'Uttar Pradesh': {
    units: '2,406 units',
    capacity: '14.7 M MT',
    crops: ['Wheat', 'Paddy', 'Potato'],
    facilities: [
      { name: 'Lucknow WDRA Mega Warehouse', city: 'Lucknow', phone: '+91-522-231-8877', type: 'Cold Storage' },
      { name: 'Varanasi Agro Cold Hub', city: 'Varanasi', phone: '+91-542-233-2211', type: 'Cold Storage' },
      { name: 'Meerut Smart Silo Complex', city: 'Meerut', phone: '+91-121-240-9988', type: 'Steel Silo' }
    ]
  },
  'West Bengal': {
    units: '514 units',
    capacity: '5.9 M MT',
    crops: ['Paddy', 'Potato', 'Jute'],
    facilities: [
      { name: 'Siliguri Integrated Cold Chain', city: 'Siliguri', phone: '+91-353-264-1177', type: 'Cold Storage' },
      { name: 'Howrah Riverfront Warehouse', city: 'Howrah', phone: '+91-33-2666-1234', type: 'Warehouse' },
      { name: 'Kharagpur Grain Logistics', city: 'Kharagpur', phone: '+91-3222-230-555', type: 'Warehouse' }
    ]
  },
  Gujarat: {
    units: '969 units',
    capacity: '3.8 M MT',
    crops: ['Groundnut', 'Cotton', 'Cumin'],
    facilities: [
      { name: 'Ahmedabad Agrilogic Park', city: 'Ahmedabad', phone: '+91-79-2684-9900', type: 'Warehouse' },
      { name: 'Rajkot Cold Sphere', city: 'Rajkot', phone: '+91-281-255-4411', type: 'Cold Storage' },
      { name: 'Surat Spice Vault', city: 'Surat', phone: '+91-261-276-3344', type: 'Cold Storage' }
    ]
  },
  Punjab: {
    units: '697 units',
    capacity: '2.3 M MT',
    crops: ['Wheat', 'Paddy', 'Maize'],
    facilities: [
      { name: 'Amritsar Grain Terminal', city: 'Amritsar', phone: '+91-183-250-7788', type: 'Warehouse' },
      { name: 'Ludhiana Chill Chain', city: 'Ludhiana', phone: '+91-161-252-1100', type: 'Cold Storage' },
      { name: 'Bathinda Multi-Silo', city: 'Bathinda', phone: '+91-164-229-0077', type: 'Steel Silo' }
    ]
  },
  'Andhra Pradesh': {
    units: '405 units',
    capacity: '15.6 M MT',
    crops: ['Paddy', 'Chillies', 'Mango'],
    facilities: [
      { name: 'Guntur Spice Park', city: 'Guntur', phone: '+91-863-222-3115', type: 'Cold Storage' },
      { name: 'Vizag Coastal Cold Store', city: 'Visakhapatnam', phone: '+91-891-254-0099', type: 'Cold Storage' },
      { name: 'Kurnool Mega Warehouse', city: 'Kurnool', phone: '+91-8518-255-455', type: 'Warehouse' }
    ]
  },
  Maharashtra: {
    units: '1,180 units',
    capacity: '8.4 M MT',
    crops: ['Grapes', 'Cotton', 'Soybean'],
    facilities: [
      { name: 'Nashik Viticool Cluster', city: 'Nashik', phone: '+91-253-223-1188', type: 'Cold Storage' },
      { name: 'Pune Mahafed Logistics', city: 'Pune', phone: '+91-20-2693-2244', type: 'Warehouse' },
      { name: 'Nagpur Multi-Modal Storage', city: 'Nagpur', phone: '+91-712-237-1190', type: 'Warehouse' }
    ]
  },
  Karnataka: {
    units: '540 units',
    capacity: '4.1 M MT',
    crops: ['Coffee', 'Maize', 'Tomato'],
    facilities: [
      { name: 'Doddaballapura Cold Campus', city: 'Bengaluru Rural', phone: '+91-80-2763-4411', type: 'Cold Storage' },
      { name: 'Hubballi Grain Care', city: 'Hubballi', phone: '+91-836-225-6677', type: 'Warehouse' },
      { name: 'Mysuru Fresh Vault', city: 'Mysuru', phone: '+91-821-244-7788', type: 'Cold Storage' }
    ]
  }
};

export default function WarehouseGuidePage({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cropSearch, setCropSearch] = useState('');
  const [cropType, setCropType] = useState('');
  const [state, setState] = useState('');
  const [facilityType, setFacilityType] = useState('any');
  const [facilityCoords, setFacilityCoords] = useState({});
  const mapRef = useRef(null);

  const cropTypes = useMemo(
    () => Array.from(new Set(CROP_STORAGE.map(c => c.type))).sort(),
    []
  );

  const filteredCrops = useMemo(() => {
    const term = cropSearch.trim().toLowerCase();
    return CROP_STORAGE.filter(crop => {
      const matchesTerm =
        !term ||
        crop.name.toLowerCase().includes(term) ||
        crop.type.toLowerCase().includes(term);
      const matchesType = !cropType || crop.type === cropType;
      return matchesTerm && matchesType;
    });
  }, [cropSearch, cropType]);

  const stateOptions = Object.keys(STATE_WAREHOUSES).sort();
  const selectedState = state ? STATE_WAREHOUSES[state] : null;

  const filteredFacilities = useMemo(() => {
    if (!selectedState) return [];
    if (facilityType === 'any') return selectedState.facilities;
    return selectedState.facilities.filter(
      f => (f.type || '').toLowerCase() === facilityType
    );
  }, [selectedState, facilityType]);

  useEffect(() => {
    const ensureLeaflet = () =>
      new Promise(resolve => {
        if (window.L) return resolve();
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    const geocode = async q => {
      try {
        const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { format: 'json', q }
        });
        if (Array.isArray(data) && data.length) {
          const { lat, lon } = data[0];
          return [parseFloat(lat), parseFloat(lon)];
        }
        return null;
      } catch {
        return null;
      }
    };

    const geocodeFacility = async f => {
      const q = [
        `${f.name}, ${f.city}, ${state}, India`,
        `${f.city}, ${state}, India`,
        `${f.name}, ${f.city}, India`,
        `${state}, India`
      ];
      for (const s of q) {
        const c = await geocode(s);
        if (c) return c;
      }
      return null;
    };

    const renderMap = async () => {
      if (!document.getElementById('warehouse-map')) return;
      await ensureLeaflet();
      const L = window.L;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
      }
      mapRef.current = L.map('warehouse-map');
      const map = mapRef.current;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markers = [];
      const coordsMap = {};
      if (selectedState) {
        const facilities = filteredFacilities.length ? filteredFacilities : selectedState.facilities;
        for (const f of facilities) {
          const coord = await geocodeFacility(f);
          if (coord) {
            const searchUrl = `https://www.google.com/maps/search/?api=1&query=${coord[0]},${coord[1]}`;
            const m = L.marker(coord).addTo(map).bindPopup(`${f.name}<br/>${f.city}`);
            m.on('click', () => {
              const w = window.open(searchUrl, '_blank');
              if (!w) window.location.assign(searchUrl);
            });
            markers.push(m);
            coordsMap[`${f.name}|${f.city}|${state}`] = coord;
          }
        }
      }

      try {
        if (state) {
          const data = await getCommodityPrices('', state, '');
          const markets = Array.from(new Set((data.records || []).map(r => r.market))).slice(0, 5);
          for (const mk of markets) {
            const q = `${mk}, ${state}, India market`;
            const coord = await geocode(q);
            if (coord) {
              const m = L.circleMarker(coord, { radius: 6, color: '#2563eb' }).addTo(map).bindPopup(`Market: ${mk}`);
              markers.push(m);
            }
          }
        }
      } catch {}

      if (markers.length) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
      } else {
        map.setView([22.9734, 78.6569], 5);
      }

      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 50);

      setFacilityCoords(coordsMap);
    };

    renderMap();
  }, [selectedState, filteredFacilities, state]);

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">{t('weatherIntelligence.backToDashboard')}</span>
          </button>
          <h1 className="font-semibold text-lg">{t('warehouseGuide.title')}</h1>
          <div className="w-24" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro */}
        <section className="glass-card rounded-3xl p-8 bg-white flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0 text-primary">
            <WarehouseIcon className="w-8 h-8" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {t('warehouseGuide.title')}
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl">
              {t('warehouseGuide.subtitle')}
            </p>
          </div>
        </section>

        {/* Crop storage advice */}
        <section className="glass-card rounded-3xl p-8 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-primary">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                {t('warehouseGuide.cropStorageTitle', 'Crop Storage Advice')}
              </h3>
              <p className="text-xs text-text-secondary">
                {t('warehouseGuide.cropStorageSubtitle', 'Tap any card to see optimal temperature, humidity and storage life.')}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                {t('warehouseGuide.searchCrop', 'Search Crop')}
              </label>
              <input
                value={cropSearch}
                onChange={e => setCropSearch(e.target.value)}
                placeholder={t('warehouseGuide.searchCropPlaceholder', 'Search by name...')}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                {t('warehouseGuide.filterByType', 'Filter by Crop Type')}
              </label>
              <select
                value={cropType}
                onChange={e => setCropType(e.target.value)}
                className="input-field"
              >
                <option value="">{t('warehouseGuide.allTypes', 'All Types')}</option>
                {cropTypes.map(type => {
                  const typeKey = type.toLowerCase().replace(/\s+/g, '');
                  return (
                    <option key={type} value={type}>
                      {t(`warehouseGuide.cropTypes.${typeKey}`, type)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <p className="text-sm text-text-secondary mb-4 font-medium">
            {t('warehouseGuide.showingCrops', { count: filteredCrops.length })}
          </p>

          {filteredCrops.length === 0 ? (
            <div className="border border-dashed border-border rounded-3xl p-12 text-center">
              <p className="text-text-secondary font-medium">
                {t('warehouseGuide.noCrops', 'No crops match your search or filter.')}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCrops.map(crop => (
                <article
                  key={crop.name}
                  className="rounded-3xl border border-border/50 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                        {t(`crops.${crop.name.toLowerCase()}`, crop.name)}
                      </h4>
                      <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-text-secondary">
                        {t(`warehouseGuide.cropTypes.${crop.type.toLowerCase().replace(/\s+/g, '')}`, crop.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-text-secondary mb-1">
                        <Thermometer className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('warehouseGuide.temperature')}</span>
                      </div>
                      <div className="font-semibold text-text-primary">{crop.temp}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-text-secondary mb-1">
                        <Droplets className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('warehouseGuide.humidity')}</span>
                      </div>
                      <div className="font-semibold text-text-primary">{crop.humidity}</div>
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-text-secondary mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('warehouseGuide.storageLife')}</span>
                      </div>
                      <div className="font-semibold text-text-primary">{crop.life}</div>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-xl bg-amber-50/50 border border-amber-100/50 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-900 block mb-0.5">
                        {t('warehouseGuide.precautions')}:
                      </span>
                      <span className="text-amber-800 leading-relaxed">{crop.precautions}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Warehouse locator */}
        <section className="glass-card rounded-3xl p-8 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                {t('warehouseGuide.locatorTitle', 'Warehouse Locator')}
              </h3>
              <p className="text-xs text-text-secondary">
                {t('warehouseGuide.locatorSubtitle', 'WDRA-inspired sample data for key states.')}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                {t('warehouseGuide.selectState', 'Select State')}
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="input-field"
              >
                <option value="">{t('warehouseGuide.selectStatePlaceholder', 'Choose a state')}</option>
                {stateOptions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                {t('warehouseGuide.facilityType', 'Facility Type')}
              </label>
              <select
                value={facilityType}
                onChange={e => setFacilityType(e.target.value)}
                className="input-field"
              >
                <option value="any">{t('warehouseGuide.anyFacility', 'Any')}</option>
                <option value="cold storage">{t('warehouseGuide.coldStorage', 'Cold Storage')}</option>
                <option value="warehouse">{t('warehouseGuide.warehouse', 'Warehouse')}</option>
                <option value="steel silo">{t('warehouseGuide.steelSilo', 'Steel Silo')}</option>
              </select>
            </div>
          </div>

          {!selectedState ? (
            <div className="rounded-2xl bg-gray-50 border border-border p-8 text-center">
              <p className="text-text-secondary">
                {t('warehouseGuide.chooseStateMessage', 'Choose a state to view sample WDRA-style insights.')}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-green-50/50 border border-green-100 p-5">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      {t('warehouseGuide.totalUnits', 'Total Units')}
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {selectedState.units}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-5">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      {t('warehouseGuide.capacity', 'Capacity')}
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedState.capacity}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-border p-5 sm:col-span-2">
                    <p className="text-sm font-medium text-text-secondary mb-2">
                      {t('warehouseGuide.primaryCrops', 'Primary Crops')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedState.crops.map(crop => (
                        <span key={crop} className="px-3 py-1 bg-white rounded-lg border border-border text-sm font-medium text-text-primary">
                          {t(`crops.${crop.toLowerCase()}`, crop)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                    <WarehouseIcon className="w-5 h-5 text-primary" />
                    {t('warehouseGuide.nearestWarehouses', 'Nearest Warehouses')}
                  </h4>
                  {filteredFacilities.length === 0 ? (
                    <p className="text-sm text-text-secondary p-4 bg-gray-50 rounded-xl border border-border">
                      {t(
                        'warehouseGuide.noFacilities',
                        'No facilities match this filter. Try another type.'
                      )}
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredFacilities.map(f => (
                        <article
                          key={f.name}
                          className="rounded-2xl border border-border p-5 bg-white hover:border-primary/30 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-colors">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-text-secondary border border-border">
                              {t(`warehouseGuide.facilityTypes.${(f.type || '').toLowerCase().replace(/\s+/g, '')}`, f.type)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-bold text-text-primary">
                              {f.name}
                            </h5>
                            <a
                              href={
                                facilityCoords[`${f.name}|${f.city}|${state}`]
                                  ? `https://www.google.com/maps/search/?api=1&query=${facilityCoords[`${f.name}|${f.city}|${state}`][0]},${facilityCoords[`${f.name}|${f.city}|${state}`][1]}`
                                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${f.name} ${f.city}`)}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-primary hover:bg-green-100"
                              aria-label="Open in Google Maps"
                            >
                              <MapPin className="w-4 h-4" />
                            </a>
                          </div>
                          <p className="text-sm text-text-secondary">{f.city}</p>
                          {f.phone ? (
                            <p className="text-sm text-text-secondary">{f.phone}</p>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {t('warehouseGuide.mapPreview', 'Map Preview')}
                </h4>
                <div className="aspect-square rounded-3xl border border-border overflow-hidden shadow-inner bg-gray-100 relative">
                  <div id="warehouse-map" className="w-full h-full" />
                  <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-3 text-xs text-center text-text-secondary border-t border-border/50">
                    {t(
                      'warehouseGuide.mapHint',
                      'Pan and zoom inside the map to explore different regions.'
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
