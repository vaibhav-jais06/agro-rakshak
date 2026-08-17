import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Search,
  Layers,
  AlertTriangle,
  Calendar,
  Bug,
  Clock
} from 'lucide-react';
import apiService from '../../services/apiService';
import ProgressBar from '../../components/common/ProgressBar';

const createCrop = (...args) => {
  if (args.length === 8) {
    const [id, name, , image_url, suitable_soils, duration, fertilizers, pesticides] = args;
    return {
      id,
      name,
      suitable_soils,
      duration,
      fertilizers,
      pesticides,
      image: `/pesticide-predictor/${image_url}`
    };
  } else {
    const [id, name, suitable_soils, duration, fertilizers, pesticides] = args;
    return { id, name, suitable_soils, duration, fertilizers, pesticides };
  }
};

const CROP_DATABASE = [
  createCrop(1, 'Rice', 'Oryza sativa', 'rice.jpg', ['Clayey', 'Loam', 'Silty'], '120-150 days', [
    { day: 0, stage: 'Basal Application', dose: 'Urea 50kg + DAP 50kg + MOP 30kg', instruction: 'Apply at transplanting. Mix well with soil.' },
    { day: 20, stage: 'First Top Dressing', dose: 'Urea 40kg', instruction: 'Apply when plants are 20 days old. Ensure field is well-irrigated.' },
    { day: 45, stage: 'Second Top Dressing', dose: 'Urea 30kg', instruction: 'Apply during panicle initiation stage.' },
    { day: 60, stage: 'Final Top Dressing', dose: 'Urea 20kg', instruction: 'Apply at flowering stage for better grain filling.' }
  ], [
    { name: 'Chlorpyriphos 20% EC', target: 'Stem Borer', time: '20-25 days after transplanting, repeat after 15 days', note: 'Apply in the evening for better effectiveness' },
    { name: 'Tricyclazole 75% WP', target: 'Blast Disease', time: 'At first sign of disease, repeat after 10 days', note: 'Preventive application recommended during humid conditions' },
    { name: 'Carbendazim 50% WP', target: 'Sheath Blight', time: '30-35 days after transplanting', note: 'Ensure proper coverage of lower leaves' },
    { name: 'Imidacloprid 17.8% SL', target: 'Brown Plant Hopper', time: 'When pest population exceeds threshold', note: 'Avoid application during flowering to protect pollinators' }
  ]),
  createCrop(2, 'Wheat', 'Triticum aestivum', 'wheat.jpg', ['Loam', 'Sandy Loam', 'Clayey Loam'], '100-120 days', [
    { day: 0, stage: 'Basal Application', dose: 'Urea 60kg + DAP 50kg + MOP 30kg', instruction: 'Apply at sowing time. Mix with soil before seed placement.' },
    { day: 30, stage: 'First Top Dressing', dose: 'Urea 50kg', instruction: 'Apply at tillering stage (30 DAS). Ensure adequate moisture.' },
    { day: 60, stage: 'Second Top Dressing', dose: 'Urea 40kg', instruction: 'Apply at jointing stage for better spike development.' }
  ], [
    { name: 'Propiconazole 25% EC', target: 'Rust Disease', time: 'At first appearance of rust pustules, repeat after 15 days', note: 'Apply early morning for best results' },
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When >5 aphids per tiller observed', note: 'Monitor field regularly for early detection' },
    { name: 'Mancozeb 75% WP', target: 'Leaf Blight', time: 'At booting stage, repeat after 10 days', note: 'Combine with proper irrigation management' }
  ]),
  createCrop(3, 'Cotton', 'Gossypium hirsutum', 'cotton.jpg', ['Black Soil', 'Loam', 'Sandy Loam'], '150-180 days', [
    { day: 0, stage: 'Basal Application', dose: 'Urea 50kg + DAP 60kg + MOP 40kg', instruction: 'Apply at sowing. Deep placement recommended.' },
    { day: 30, stage: 'First Top Dressing', dose: 'Urea 60kg', instruction: 'Apply at square formation stage. Ensure proper irrigation.' },
    { day: 60, stage: 'Second Top Dressing', dose: 'Urea 50kg', instruction: 'Apply at flowering stage for better boll development.' },
    { day: 90, stage: 'Final Top Dressing', dose: 'Urea 30kg', instruction: 'Apply during boll formation stage if needed.' }
  ], [
    { name: 'Emamectin Benzoate 5% SG', target: 'Bollworm', time: 'At square formation, repeat at 15-day intervals', note: 'Critical for boll protection' },
    { name: 'Acephate 75% SP', target: 'Aphids & Whitefly', time: 'When pest population exceeds threshold', note: 'Monitor whitefly population closely' },
    { name: 'Spinosad 45% SC', target: 'Spotted Bollworm', time: 'At flowering stage, repeat after 10 days', note: 'Effective against resistant strains' },
    { name: 'Thiophanate Methyl 70% WP', target: 'Alternaria Leaf Spot', time: 'At first sign of disease', note: 'Preventive application during humid weather' }
  ]),
  createCrop(4, 'Potato', 'Solanum tuberosum', 'potato.webp', ['Sandy Loam', 'Loam', 'Well-drained Loam'], '80-100 days', [
    { day: 0, stage: 'Basal Application', dose: 'Urea 80kg + DAP 60kg + MOP 100kg', instruction: 'Apply at planting time. Mix well with soil before tuber placement.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 50kg', instruction: 'Apply at tuber initiation stage. Ensure proper earthing up.' },
    { day: 50, stage: 'Final Top Dressing', dose: 'Urea 30kg', instruction: 'Apply during tuber bulking stage if needed.' }
  ], [
    { name: 'Mancozeb 75% WP', target: 'Late Blight', time: 'Start 30 days after planting, repeat every 7-10 days', note: 'Most critical disease for potato' },
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected, repeat after 10 days', note: 'Important for virus prevention' },
    { name: 'Chlorpyriphos 20% EC', target: 'Cutworm', time: 'At early growth stage', note: 'Apply at soil level for best results' },
    { name: 'Metalaxyl 8% + Mancozeb 64% WP', target: 'Early Blight', time: 'At first sign of disease, repeat after 10 days', note: 'Systemic action provides better control' }
  ]),
  createCrop(5, 'Maize', 'Zea mays', 'maize.webp', ['Loam', 'Sandy Loam', 'Clayey Loam'], '90-110 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 100kg/ha + FYM 5t/ha', instruction: 'Apply at sowing; mix lightly with soil.' },
    { day: 30, stage: 'Knee-high stage', dose: 'Urea 50kg/ha', instruction: 'Top dress at V6 stage; irrigate after application.' },
    { day: 60, stage: 'Pre-tassel', dose: 'MOP 30kg/ha', instruction: 'Provide potassium during grain filling.' }
  ], [
    { name: 'Cypermethrin 25% EC', target: 'Stem borer', time: 'At hatchling observation', note: 'Use with care to protect beneficials' },
    { name: 'Carbofuran 3G', target: 'Root grub', time: 'At sowing as granules', note: 'Follow label for safe use' },
    { name: 'Azoxystrobin 20% SC', target: 'Leaf blight', time: 'At first symptoms', note: 'Protect new leaves' }
  ]),
  createCrop(6, 'Sugarcane', 'Saccharum officinarum', 'sugarcane.webp', ['Clayey', 'Loam', 'Silty'], '12-18 months', [
    { day: 0, stage: 'Basal', dose: 'FYM 20t/ha + DAP 150kg/ha', instruction: 'Apply prior to planting; incorporate into soil.' },
    { day: 120, stage: 'Tillering', dose: 'Urea 200kg/ha', instruction: 'Split applications during peak growth.' },
    { day: 240, stage: 'Grand growth', dose: 'MOP 100kg/ha', instruction: 'Ensure potassium for sucrose accumulation.' }
  ], [
    { name: 'Chlorpyriphos 20% EC', target: 'Termites/borers', time: 'At early infestation', note: 'Soil application gives better control' },
    { name: 'Difenoconazole 25% EC', target: 'Red rot', time: 'At disease onset', note: 'Use with cultural sanitation' },
    { name: 'Imidacloprid 70% WG', target: 'Aphids', time: 'Foliar when needed', note: 'Avoid flowering' }
  ]),
  createCrop(7, 'Soybean', 'Glycine max', 'soyabean.webp', ['Loam', 'Sandy Loam'], '80-100 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 60kg/ha + Rhizobium inoculation', instruction: 'Seed treatment with rhizobium improves N fixation.' },
    { day: 25, stage: 'Vegetative', dose: 'Urea 30kg/ha', instruction: 'Apply if deficiency observed.' },
    { day: 45, stage: 'Pod formation', dose: 'MOP 20kg/ha', instruction: 'Potassium supports pod filling.' }
  ], [
    { name: 'Quinalphos 25% EC', target: 'Pod borer', time: 'At egg hatch', note: 'Spot spray to conserve parasitoids' },
    { name: 'Carbendazim 50% WP', target: 'Stem rot', time: 'At first sign', note: 'Combine with drainage management' },
    { name: 'Lambda-cyhalothrin 5% EC', target: 'Aphids', time: 'When threshold exceeded', note: 'Rotate modes of action' }
  ]),
  createCrop(8, 'Groundnut (Peanut)', 'Arachis hypogaea', 'groundnut.webp', ['Sandy Loam', 'Loam'], '110-130 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 80kg/ha + FYM 5t/ha', instruction: 'Ensure well-drained seedbed.' },
    { day: 30, stage: 'Flowering', dose: 'Urea 20kg/ha', instruction: 'Minimal N needed; focus on K and Ca.' },
    { day: 60, stage: 'Pegging', dose: 'MOP 40kg/ha + Gypsum 200kg/ha', instruction: 'Calcium crucial for pod development.' }
  ], [
    { name: 'Acephate 75% SP', target: 'Leaf miner', time: 'At larval stage', note: 'Avoid during bloom' },
    { name: 'Mancozeb 75% WP', target: 'Late leaf spot', time: 'At first sign, repeat 10-14 days', note: 'Alternate fungicides' },
    { name: 'Thiamethoxam 25% WG', target: 'Aphids', time: 'When seen', note: 'Seed treatment often sufficient' }
  ]),
  createCrop(9, 'Sunflower', 'Helianthus annuus', 'sunflower.webp', ['Loam', 'Sandy Loam'], '90-110 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 80kg/ha + FYM 3t/ha', instruction: 'Good drainage and sunlight required.' },
    { day: 30, stage: 'Vegetative', dose: 'Urea 40kg/ha', instruction: 'Nitrogen for vegetative growth.' },
    { day: 50, stage: 'Flower initiation', dose: 'MOP 30kg/ha', instruction: 'Supports oil synthesis.' }
  ], [
    { name: 'Emamectin Benzoate', target: 'Helicoverpa', time: 'At flowering/pre-fruiting', note: 'Critical to protect capitulum' },
    { name: 'Azoxystrobin', target: 'Sclerotinia', time: 'At damp conditions', note: 'Use as preventive' },
    { name: 'Lambda-cyhalothrin', target: 'Aphids', time: 'When threshold exceeded', note: 'Monitor beneficial insects' }
  ]),
  createCrop(10, 'Barley', 'Hordeum vulgare', 'barley.jpg', ['Loam', 'Sandy Loam'], '90-110 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 80kg/ha', instruction: 'Apply at sowing.' },
    { day: 25, stage: 'Tillering', dose: 'Urea 40kg/ha', instruction: 'Split application improves tiller count.' },
    { day: 60, stage: 'Pre-harvest', dose: 'K fertilizer if needed', instruction: 'Enhances grain quality.' }
  ], [
    { name: 'Propiconazole', target: 'Powdery mildew', time: 'At first sign', note: 'Apply early' },
    { name: 'Carbendazim', target: 'Fusarium', time: 'At disease onset', note: 'Use certified seed' },
    { name: 'Lambda-cyhalothrin', target: 'Aphids', time: 'When observed', note: 'Monitor fields regularly' }
  ]),
  createCrop(11, 'Sorghum', 'Sorghum bicolor', 'sorghum.webp', ['Sandy', 'Loam'], '90-120 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 60kg/ha + FYM 5t/ha', instruction: 'Drought-tolerant crop; conservative fertilizer use.' },
    { day: 30, stage: 'Vegetative', dose: 'Urea 30kg/ha', instruction: 'Apply if vigorous growth desired.' },
    { day: 60, stage: 'Booting', dose: 'MOP 20kg/ha', instruction: 'Supports grain filling.' }
  ], [
    { name: 'Malathion', target: 'Stem borer', time: 'At egg hatch', note: 'Follow safety guidelines' },
    { name: 'Carbendazim', target: 'Smut', time: 'At first signs', note: 'Resistant varieties preferred' },
    { name: 'Imidacloprid', target: 'Aphids', time: 'If needed', note: 'Use seed treatment when possible' }
  ]),
  createCrop(12, 'Pearl Millet (Bajra)', 'pearl.webp', ['Sandy', 'Loam'], '60-90 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 40kg/ha', instruction: 'Light fertilizer helps in low-input systems.' },
    { day: 20, stage: 'Tillering', dose: 'Urea 20kg/ha', instruction: 'Apply if growth is poor.' },
    { day: 45, stage: 'Grain filling', dose: 'MOP 15kg/ha', instruction: 'Enhances grain quality.' }
  ], [
    { name: 'Quinalphos', target: 'Stem borer', time: 'At egg hatch', note: 'Apply carefully' },
    { name: 'Mancozeb', target: 'Leaf spot', time: 'When noticed', note: 'Resistant varieties recommended' },
    { name: 'Imidacloprid', target: 'Aphids', time: 'If needed', note: 'Prefer seed treatment' }
  ]),
  createCrop(13, 'Chickpea (Gram)', 'Cicer arietinum', 'chickpeas.webp', ['Loam', 'Sandy Loam'], '90-120 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 60kg/ha + Rhizobium', instruction: 'Seed inoculation is highly beneficial.' },
    { day: 35, stage: 'Flowering', dose: 'MOP 20kg/ha', instruction: 'Potassium aids pod development.' },
    { day: 60, stage: 'Pod filling', dose: 'Top dress if needed', instruction: 'Irrigate around pod formation.' }
  ], [
    { name: 'Chlorothalonil', target: 'Ascochyta blight', time: 'At first sign', note: 'Use certified seed' },
    { name: 'Carbendazim', target: 'Fusarium', time: 'When noted', note: 'Rotate fungicides' },
    { name: 'Lambda-cyhalothrin', target: 'Pod borer', time: 'When threshold exceeded', note: 'Spot spray' }
  ]),
  createCrop(14, 'Lentil', 'Lens culinaris', 'lentil.jpg', ['Loam', 'Silty'], '80-110 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 50kg/ha + Rhizobium', instruction: 'Seed treatment recommended.' },
    { day: 30, stage: 'Flowering', dose: 'MOP 15kg/ha', instruction: 'Apply potassium if deficiency seen.' },
    { day: 55, stage: 'Pod fill', dose: 'Top up if required', instruction: 'Avoid waterlogging.' }
  ], [
    { name: 'Mancozeb', target: 'Leaf spot', time: 'At first sign', note: 'Good drainage helps' },
    { name: 'Carbendazim', target: 'Stem rot', time: 'If detected', note: 'Use resistant varieties' },
    { name: 'Acephate', target: 'Aphids', time: 'When observed', note: 'Monitor regularly' }
  ]),
  createCrop(15, 'Green Gram (Moong)', 'Vigna radiata', 'greengram.jpg', ['Loam', 'Sandy Loam'], '60-80 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 40kg/ha + Rhizobium', instruction: 'Seed inoculation improves yields.' },
    { day: 20, stage: 'Vegetative', dose: 'Urea 15kg/ha', instruction: 'Minimal N required with inoculation.' },
    { day: 40, stage: 'Podding', dose: 'MOP 15kg/ha', instruction: 'Apply potassium for pod fill.' }
  ], [
    { name: 'Thiamethoxam', target: 'Aphids', time: 'At first sign', note: 'Seed treatment is effective' },
    { name: 'Carbendazim', target: 'Powdery mildew', time: 'When noticed', note: 'Use recommended doses' },
    { name: 'Quinalphos', target: 'Pod borer', time: 'At egg hatch', note: 'Spot treatments preferred' }
  ]),
  createCrop(16, 'Black Gram (Urad)', 'Vigna mungo', 'blackgram.webp', ['Loam', 'Sandy Loam'], '70-90 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 40kg/ha + Rhizobium', instruction: 'Seed inoculation advised.' },
    { day: 25, stage: 'Flowering', dose: 'MOP 15kg/ha', instruction: 'Ensure adequate moisture.' },
    { day: 50, stage: 'Pod filling', dose: 'Top up if deficient', instruction: 'Avoid shattering at harvest.' }
  ], [
    { name: 'Carbendazim', target: 'Leaf spot', time: 'At first symptoms', note: 'Rotate fungicides' },
    { name: 'Acephate', target: 'Thrips', time: 'When seen', note: 'Use selective insecticides' },
    { name: 'Imidacloprid', target: 'Aphids', time: 'When threshold exceeded', note: 'Seed treatment reduces need' }
  ]),
  createCrop(17, 'Mustard (Rapeseed)', 'Brassica juncea', 'mustard.jpg', ['Loam', 'Clayey Loam'], '90-120 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 80kg/ha + FYM 5t/ha', instruction: 'Apply at sowing.' },
    { day: 30, stage: 'Vegetative', dose: 'Urea 40kg/ha', instruction: 'Promotes canopy development.' },
    { day: 60, stage: 'Pre-flower', dose: 'MOP 20kg/ha', instruction: 'Ensures oil quality.' }
  ], [
    { name: 'Carbaryl', target: 'Insect pests', time: 'When needed', note: 'Use as per label' },
    { name: 'Mancozeb', target: 'Alternaria', time: 'At disease signs', note: 'Timely spray helps' },
    { name: 'Lambda-cyhalothrin', target: 'Diamondback moth', time: 'When threshold exceeded', note: 'Rotate chemistries' }
  ]),
  createCrop(18, 'Sesame', 'Sesamum indicum', 'sesame.webp', ['Sandy Loam', 'Loam'], '90-150 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 40kg/ha', instruction: 'Light feeding works best.' },
    { day: 30, stage: 'Flowering', dose: 'MOP 15kg/ha', instruction: 'Potassium important for oil content.' },
    { day: 60, stage: 'Capsule fill', dose: 'Top up if required', instruction: 'Avoid waterlogging.' }
  ], [
    { name: 'Quinalphos', target: 'Stem borer', time: 'At hatch', note: 'Spot sprays effective' },
    { name: 'Carbendazim', target: 'Leaf spot', time: 'When observed', note: 'Use recommended rates' },
    { name: 'Lambda-cyhalothrin', target: 'Semilooper', time: 'If needed', note: 'Monitor pests' }
  ]),
  createCrop(19, 'Tea', 'Camellia sinensis', 'tea.webp', ['Silty', 'Loam'], 'Perennial', [
    { day: 0, stage: 'Basal', dose: 'NPK 200:100:150 kg/ha annual (split)', instruction: 'Apply in splits and mulching for tea bushes.' },
    { day: 120, stage: 'Growth flush', dose: 'Urea foliar as needed', instruction: 'Support flush growth for quality leaves.' },
    { day: 240, stage: 'Pre-harvest', dose: 'Potash application', instruction: 'Improves leaf quality.' }
  ], [
    { name: 'Profenofos', target: 'Red spider mite', time: 'When observed', note: 'Ensure proper coverage' },
    { name: 'Mancozeb', target: 'Blight', time: 'During humid spells', note: 'Regular monitoring required' },
    { name: 'Imidacloprid', target: 'Stem borer', time: 'If required', note: 'Follow IPM' }
  ]),
  createCrop(20, 'Coffee', 'Coffea arabica', 'coffee.webp', ['Loam', 'Silty Loam'], 'Perennial', [
    { day: 0, stage: 'Basal', dose: 'NPK 200:100:200 kg/ha annual', instruction: 'Split doses across seasons.' },
    { day: 180, stage: 'Fruiting', dose: 'Potash rich feed', instruction: 'Supports cherry development.' },
    { day: 360, stage: 'Maintenance', dose: 'Organic mulch & FYM', instruction: 'Improves soil health.' }
  ], [
    { name: 'Copper oxychloride', target: 'Leaf rust', time: 'At first sign', note: 'Preventive sprays work best' },
    { name: 'Emamectin', target: 'Borer', time: 'At pest presence', note: 'Monitor traps' },
    { name: 'Imidacloprid', target: 'White stem borer', time: 'If needed', note: 'Use judiciously' }
  ]),
  createCrop(21, 'Banana', 'Musa spp.', 'banana.webp', ['Loam', 'Silty', 'Clayey'], '9-12 months', [
    { day: 0, stage: 'Basal', dose: 'FYM 20t/ha + NPK 400:100:600 kg/ha split', instruction: 'Heavy feeder; split N applications.' },
    { day: 90, stage: 'Bunch initiation', dose: 'Potash 200kg/ha', instruction: 'Potassium important for bunch quality.' },
    { day: 180, stage: 'Maturation', dose: 'Top dressing as required', instruction: 'Ensure regular irrigation.' }
  ], [
    { name: 'Buprofezin', target: 'Mealybugs', time: 'On detection', note: 'Spot treatment preferred' },
    { name: 'Carbendazim', target: 'Sigatoka', time: 'At first sign', note: 'Combine with cultural control' },
    { name: 'Emamectin', target: 'Borers', time: 'When observed', note: 'Trunk injections for severe cases' }
  ]),
  createCrop(22, 'Mango', 'Mangifera indica', 'mango.jpg', ['Loam', 'Sandy Loam'], 'Perennial', [
    { day: 0, stage: 'Basal', dose: 'FYM 10-20kg/tree + NPK 200:100:200 per year', instruction: 'Apply in basins; split across seasons.' },
    { day: 60, stage: 'Flowering prep', dose: 'Potash and micronutrients', instruction: 'Zinc and boron often beneficial.' },
    { day: 180, stage: 'Fruit set', dose: 'Top up N if required', instruction: 'Irrigate during fruit set.' }
  ], [
    { name: 'Carbendazim', target: 'Anthracnose', time: 'At flowering & early fruiting', note: 'Protect young fruits' },
    { name: 'Deltamethrin', target: 'Fruit flies (bait sprays)', time: 'During fruiting', note: 'Use protein baits' },
    { name: 'Prochloraz', target: 'Powdery mildew', time: 'If observed', note: 'Good canopy management helps' }
  ]),
  createCrop(23, 'Citrus (Orange)', 'Citrus sinensis', 'orange.jpg', ['Loam', 'Sandy Loam'], 'Perennial', [
    { day: 0, stage: 'Basal', dose: 'FYM 10t/ha + NPK 200:100:300 per year', instruction: 'Split doses based on seasonality.' },
    { day: 90, stage: 'Fruit development', dose: 'Micronutrients (Zn, B)', instruction: 'Foliar sprays for deficiencies.' },
    { day: 180, stage: 'Pre-harvest', dose: 'Potash top up', instruction: 'Improves sweetness and rind quality.' }
  ], [
    { name: 'Imidacloprid', target: 'Citrus psylla', time: 'At nymph emergence', note: 'Protects new flush' },
    { name: 'Copper oxychloride', target: 'Greasy spot', time: 'When noticed', note: 'Good sanitation' },
    { name: 'Spinosad', target: 'Fruit borer', time: 'When needed', note: 'Baiting options available' }
  ]),
  createCrop(24, 'Guava', 'Psidium guajava', 'gauva.jpg', ['Loam', 'Sandy Loam'], 'Perennial', [
    { day: 0, stage: 'Basal', dose: 'FYM 10t/ha + NPK 200:100:200', instruction: 'Apply in basins; mulch recommended.' },
    { day: 60, stage: 'Flowering', dose: 'Potash and micro-nutrients', instruction: 'Improves fruit quality.' },
    { day: 150, stage: 'Fruit maturity', dose: 'Top dressing as needed', instruction: 'Irrigate well pre-harvest.' }
  ], [
    { name: 'Carbendazim', target: 'Anthracnose', time: 'At first symptoms', note: 'Protect new fruits' },
    { name: 'Deltamethrin', target: 'Fruit borer', time: 'When observed', note: 'Use pheromone traps as well' },
    { name: 'Imidacloprid', target: 'Fruit fly vectors', time: 'As required', note: 'Apply traps and sanitation' }
  ]),
  createCrop(25, 'Papaya', 'Carica papaya', 'papaya.jpg', ['Loam', 'Silty'], '9-12 months', [
    { day: 0, stage: 'Basal', dose: 'FYM 10t/ha + NPK 200:100:200', instruction: 'Good drainage essential.' },
    { day: 90, stage: 'Flowering', dose: 'Potash feed', instruction: 'Supports fruit size and sweetness.' },
    { day: 180, stage: 'Harvest prep', dose: 'Micronutrient sprays', instruction: 'Zinc and boron often beneficial.' }
  ], [
    { name: 'Carbendazim', target: 'Black spot', time: 'At first sign', note: 'Sanitation reduces spread' },
    { name: 'Spinosad', target: 'Fruit borer', time: 'When seen', note: 'Use baiting and trunk protection' },
    { name: 'Imidacloprid', target: 'Mealybugs', time: 'As needed', note: 'Monitor regularly' }
  ]),
  createCrop(26, 'Tomato', 'Solanum lycopersicum', 'tomato.jpg', ['Loam', 'Sandy Loam'], '60-90 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 100kg/ha + FYM 10t/ha', instruction: 'Transplant in well-prepared beds.' },
    { day: 20, stage: 'Vegetative', dose: 'Urea 40kg/ha', instruction: 'Split N applications for continuous fruiting.' },
    { day: 40, stage: 'Flowering/fruiting', dose: 'MOP 30kg/ha', instruction: 'Support fruit set and size.' }
  ], [
    { name: 'Mancozeb', target: 'Late blight', time: 'At first sign, repeat 7-10 days', note: 'Timely spray crucial' },
    { name: 'Tebuconazole', target: 'Early blight', time: 'At symptoms', note: 'Combine with cultural control' },
    { name: 'Emamectin', target: 'Fruit borer', time: 'When larvae observed', note: 'Protect fruits' }
  ]),
  createCrop(27, 'Eggplant (Brinjal)', 'Solanum melongena', 'eggplant.jpg', ['Loam', 'Sandy Loam'], '70-120 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 80kg/ha + FYM 8t/ha', instruction: 'Good nursery management helps.' },
    { day: 25, stage: 'Vegetative', dose: 'Urea 30kg/ha', instruction: 'Support canopy growth.' },
    { day: 60, stage: 'Fruiting', dose: 'MOP 25kg/ha', instruction: 'Maintains fruit quality.' }
  ], [
    { name: 'Emamectin', target: 'Shoot borer', time: 'At early shoot damage', note: 'Prompt action needed' },
    { name: 'Carbendazim', target: 'Fungal spots', time: 'When seen', note: 'Sanitation and crop rotation help' },
    { name: 'Imidacloprid', target: 'Aphids/Whitefly', time: 'If threshold exceeded', note: 'Use IPM' }
  ]),
  createCrop(28, 'Okra (Ladyfinger)', 'Abelmoschus esculentus', 'ladyfinger.jpg', ['Loam', 'Sandy Loam'], '50-70 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 60kg/ha + FYM 5t/ha', instruction: 'Ensure warm soils at sowing.' },
    { day: 20, stage: 'Vegetative', dose: 'Urea 30kg/ha', instruction: 'Promotes flowering.' },
    { day: 40, stage: 'Fruitings', dose: 'MOP 20kg/ha', instruction: 'Maintain regular harvesting schedule.' }
  ], [
    { name: 'Lambda-cyhalothrin', target: 'Fruit borers', time: 'When seen', note: 'Spot sprays best' },
    { name: 'Carbendazim', target: 'Powdery mildew', time: 'At onset', note: 'Use resistant varieties' },
    { name: 'Imidacloprid', target: 'Aphids', time: 'When needed', note: 'Avoid flowering sprays' }
  ]),
  createCrop(29, 'Chilli', 'Capsicum annuum', 'chilli.jpg', ['Loam', 'Sandy Loam'], '90-120 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 80kg/ha + FYM 8t/ha', instruction: 'Transplant carefully for good stand.' },
    { day: 30, stage: 'Vegetative', dose: 'Urea 30kg/ha', instruction: 'Support flowering and fruiting.' },
    { day: 60, stage: 'Fruit set', dose: 'MOP 25kg/ha', instruction: 'Enhances fruit quality.' }
  ], [
    { name: 'Emamectin', target: 'Fruit borer', time: 'At larval presence', note: 'Protect yield' },
    { name: 'Mancozeb', target: 'Anthracnose', time: 'At first sign', note: 'Rotate fungicides' },
    { name: 'Imidacloprid', target: 'Thrips', time: 'When seen', note: 'Use integrated measures' }
  ]),
  createCrop(30, 'Cucumber', 'Cucumis sativus', 'cucumber.jpg', ['Loam', 'Sandy Loam'], '50-70 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 60kg/ha + FYM 5t/ha', instruction: 'Raised beds improve drainage.' },
    { day: 15, stage: 'Vegetative', dose: 'Urea 20kg/ha', instruction: 'Quick uptake; split N helps.' },
    { day: 35, stage: 'Fruiting', dose: 'MOP 15kg/ha', instruction: 'Ensure consistent moisture.' }
  ], [
    { name: 'Carbofuran', target: 'Root-knot nematode', time: 'At planting (where applicable)', note: 'Follow label and safety' },
    { name: 'Mancozeb', target: 'Downy mildew', time: 'At first sign', note: 'Timely spray essential' },
    { name: 'Emamectin', target: 'Fruit borer', time: 'If present', note: 'Spot treatments work' }
  ]),
  createCrop(31, 'Watermelon', 'Citrullus lanatus', 'watermelon.jpg', ['Sandy Loam', 'Loam'], '70-100 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 50kg/ha + FYM 5t/ha', instruction: 'Ensure warm soil and good drainage.' },
    { day: 20, stage: 'Vine growth', dose: 'Urea 30kg/ha', instruction: 'Support vine and fruit set.' },
    { day: 40, stage: 'Fruit development', dose: 'MOP 20kg/ha', instruction: 'Enhances sweetness and size.' }
  ], [
    { name: 'Carbaryl', target: 'Fruit flies', time: 'During fruiting', note: 'Use traps and bait' },
    { name: 'Mancozeb', target: 'Anthracnose', time: 'At onset', note: 'Use preventive sprays' },
    { name: 'Emamectin', target: 'Fruit borer', time: 'When needed', note: 'Protect ripening fruits' }
  ]),
  createCrop(32, 'Muskmelon', 'Cucumis melo', 'muskmelon.jpg', ['Sandy Loam', 'Loam'], '70-90 days', [
    { day: 0, stage: 'Basal', dose: 'DAP 50kg/ha + FYM 4t/ha', instruction: 'Raised beds and mulch help.' },
    { day: 20, stage: 'Vegetative', dose: 'Urea 25kg/ha', instruction: 'Promote uniform fruiting.' },
    { day: 35, stage: 'Fruit fill', dose: 'MOP 20kg/ha', instruction: 'Ensures sweetness.' }
  ], [
    { name: 'Carbofuran', target: 'Nematodes', time: 'At planting (if prevalent)', note: 'Use certified inputs' },
    { name: 'Mancozeb', target: 'Anthracnose', time: 'If noticed', note: 'Protect vines early' },
    { name: 'Emamectin', target: 'Borer', time: 'When seen', note: 'Apply carefully' }
  ]),
  createCrop(33, 'Grapes', 'Vitis vinifera', 'grapes.jpg', ['Loam', 'Sandy Loam'], 'Perennial', [
    { day: 0, stage: 'Basal', dose: 'FYM 10t/ha + NPK 200:100:300 per year split', instruction: 'Drainage and trellising important.' },
    { day: 120, stage: 'Berry set', dose: 'Micronutrients and potash', instruction: 'Foliar sprays can correct deficiencies.' },
    { day: 240, stage: 'Pre-harvest', dose: 'Potash top up', instruction: 'Improves sugar and firmness.' }
  ], [
    { name: 'Copper oxychloride', target: 'Downy mildew', time: 'Preventive sprays', note: 'Critical in humid regions' },
    { name: 'Dithiocarbamates', target: 'Powdery mildew', time: 'At symptoms', note: 'Rotate fungicides' },
    { name: 'Spinosad', target: 'Fruit borer', time: 'If present', note: 'Use pheromone traps as well' }
  ]),
  createCrop(34, 'Onion', 'Allium cepa', 'onion.jpg', ['Loam', 'Sandy Loam'], '90-120 days', [
    { day: 0, stage: 'Basal Application', dose: 'Urea 60kg + DAP 50kg + MOP 40kg', instruction: 'Apply at transplanting. Mix well with soil.' },
    { day: 30, stage: 'First Top Dressing', dose: 'Urea 50kg', instruction: 'Apply at bulb initiation stage.' },
    { day: 60, stage: 'Second Top Dressing', dose: 'Urea 40kg', instruction: 'Apply during bulb development.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Thrips', time: 'At 20-25 DAT, repeat at 10-day intervals', note: 'Critical pest for onion' },
    { name: 'Mancozeb 75% WP', target: 'Purple Blotch', time: 'Start 30 DAT, repeat every 10-15 days', note: 'Preventive sprays during humid weather' },
    { name: 'Propiconazole 25% EC', target: 'Stemphylium Blight', time: 'At first sign of disease', note: 'Apply early morning for best results' }
  ]),
  createCrop(35, 'Cauliflower', 'Brassica oleracea var. botrytis', 'cauliflower.jpg', ['Loam', 'Sandy Loam'], '80-120 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 100kg + DAP 80kg + MOP 80kg', instruction: 'Apply at transplanting. Ensure proper spacing.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 60kg', instruction: 'Apply at curd initiation stage.' },
    { day: 50, stage: 'Final Top Dressing', dose: 'Urea 40kg', instruction: 'Apply during curd development.' }
  ], [
    { name: 'Spinosad 45% SC', target: 'Diamondback Moth', time: 'At 20-25 DAT, repeat at 10-day intervals', note: 'Monitor field regularly' },
    { name: 'Streptocycline 0.5g/l', target: 'Black Rot', time: 'Preventive: seed treatment, curative: at first symptoms', note: 'Use resistant varieties' },
    { name: 'Bacillus thuringiensis', target: 'Cabbage Worm', time: 'At early growth stage', note: 'Biological control option' }
  ]),
  createCrop(36, 'Cabbage', 'Brassica oleracea var. capitata', 'cabbage.jpg', ['Loam', 'Sandy Loam'], '70-100 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 100kg + DAP 80kg + MOP 80kg', instruction: 'Apply at transplanting. Mix well with soil.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 60kg', instruction: 'Apply at head formation stage.' },
    { day: 50, stage: 'Final Top Dressing', dose: 'Urea 40kg', instruction: 'Apply during head development.' }
  ], [
    { name: 'Spinosad 45% SC', target: 'Diamondback Moth', time: 'At 20-25 DAT, repeat at 10-day intervals', note: 'Most common pest' },
    { name: 'Streptocycline 0.5g/l', target: 'Black Rot', time: 'Preventive: seed treatment', note: 'Important for disease prevention' },
    { name: 'Mancozeb 75% WP', target: 'Alternaria Leaf Spot', time: 'At first sign of disease', note: 'Apply during humid conditions' }
  ]),
  createCrop(37, 'Carrot', 'Daucus carota', 'carrot.jpg', ['Sandy Loam', 'Loam'], '70-100 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 60kg + DAP 50kg + MOP 60kg', instruction: 'Apply at sowing. Ensure deep, loose soil.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 50kg', instruction: 'Apply at root initiation stage.' },
    { day: 50, stage: 'Final Top Dressing', dose: 'Urea 30kg', instruction: 'Apply during root bulking.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected, repeat after 10 days', note: 'Important for virus prevention' },
    { name: 'Mancozeb 75% WP', target: 'Alternaria Blight', time: 'Start 40 DAS, repeat every 10-12 days', note: 'Preventive sprays during humid weather' },
    { name: 'Chlorpyriphos 20% EC', target: 'Carrot Rust Fly', time: 'At early growth stage', note: 'Apply at soil level' }
  ]),
  createCrop(38, 'Radish', 'Raphanus sativus', 'radish.jpg', ['Loam', 'Sandy Loam'], '25-45 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 50kg + DAP 40kg + MOP 40kg', instruction: 'Apply at sowing. Fast-growing crop.' },
    { day: 15, stage: 'Top Dressing', dose: 'Urea 30kg', instruction: 'Apply at root development stage.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Monitor regularly' },
    { name: 'Mancozeb 75% WP', target: 'Alternaria Blight', time: 'Start 25 DAS, repeat every 10 days', note: 'Preventive application recommended' }
  ]),
  createCrop(39, 'Beetroot', 'Beta vulgaris', 'beetroot.jpg', ['Loam', 'Sandy Loam'], '60-90 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 60kg + DAP 50kg + MOP 50kg', instruction: 'Apply at sowing. Prefers cool climate.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 40kg', instruction: 'Apply at root development stage.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Monitor for virus transmission' },
    { name: 'Mancozeb 75% WP', target: 'Cercospora Leaf Spot', time: 'At first sign of disease', note: 'Apply during humid conditions' }
  ]),
  createCrop(40, 'Spinach', 'Spinacia oleracea', 'spinach.jpg', ['Loam', 'Silty'], '30-50 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 40kg + DAP 30kg + MOP 30kg', instruction: 'Apply at sowing. Fast-growing leafy vegetable.' },
    { day: 20, stage: 'Top Dressing', dose: 'Urea 30kg', instruction: 'Apply for better leaf growth.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Common pest for leafy vegetables' },
    { name: 'Mancozeb 75% WP', target: 'Downy Mildew', time: 'At first sign of disease', note: 'Preventive application in humid conditions' }
  ]),
  createCrop(41, 'Lettuce', 'Lactuca sativa', 'lettuce.jpg', ['Loam', 'Silty'], '45-70 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 50kg + DAP 40kg + MOP 40kg', instruction: 'Apply at transplanting. Prefers cool weather.' },
    { day: 25, stage: 'Top Dressing', dose: 'Urea 30kg', instruction: 'Apply at head formation stage.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Monitor regularly' },
    { name: 'Mancozeb 75% WP', target: 'Downy Mildew', time: 'At first sign of disease', note: 'Critical disease for lettuce' }
  ]),
  createCrop(42, 'Broccoli', 'Brassica oleracea var. italica', 'broccoli.jpg', ['Loam', 'Sandy Loam'], '80-100 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 100kg + DAP 80kg + MOP 80kg', instruction: 'Apply at transplanting. Similar to cauliflower.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 60kg', instruction: 'Apply at head initiation stage.' },
    { day: 50, stage: 'Final Top Dressing', dose: 'Urea 40kg', instruction: 'Apply during head development.' }
  ], [
    { name: 'Spinosad 45% SC', target: 'Diamondback Moth', time: 'At 20-25 DAT, repeat at 10-day intervals', note: 'Common pest' },
    { name: 'Streptocycline 0.5g/l', target: 'Black Rot', time: 'Preventive: seed treatment', note: 'Use resistant varieties' },
    { name: 'Bacillus thuringiensis', target: 'Cabbage Worm', time: 'At early growth stage', note: 'Biological control' }
  ]),
  createCrop(43, 'Peas', 'Pisum sativum', 'peas.jpg', ['Loam', 'Sandy Loam'], '60-90 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 20kg + DAP 50kg + MOP 30kg', instruction: 'Apply at sowing. Peas fix nitrogen.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 30kg', instruction: 'Apply at flowering stage.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Monitor for virus transmission' },
    { name: 'Mancozeb 75% WP', target: 'Powdery Mildew', time: 'At first sign of disease', note: 'Common in dry conditions' },
    { name: 'Carbendazim 50% WP', target: 'Fusarium Wilt', time: 'Preventive: seed treatment', note: 'Use resistant varieties' }
  ]),
  createCrop(44, 'Beans (French)', 'Phaseolus vulgaris', 'beans.jpg', ['Loam', 'Sandy Loam'], '50-70 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 30kg + DAP 50kg + MOP 30kg', instruction: 'Apply at sowing. Beans fix nitrogen.' },
    { day: 25, stage: 'Top Dressing', dose: 'Urea 30kg', instruction: 'Apply at flowering stage.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Monitor regularly' },
    { name: 'Mancozeb 75% WP', target: 'Rust', time: 'At first sign of disease', note: 'Apply during humid conditions' },
    { name: 'Spinosad 45% SC', target: 'Pod Borer', time: 'At pod formation stage', note: 'Monitor closely' }
  ]),
  createCrop(45, 'Turmeric', 'Curcuma longa', 'turmeric.jpg', ['Loam', 'Silty'], '7-9 months', [
    { day: 0, stage: 'Basal', dose: 'FYM 25t/ha + Urea 60kg + DAP 50kg + MOP 120kg', instruction: 'Apply at planting. Mix well with soil.' },
    { day: 60, stage: 'First Top Dressing', dose: 'Urea 50kg', instruction: 'Apply at tillering stage.' },
    { day: 120, stage: 'Second Top Dressing', dose: 'Urea 40kg', instruction: 'Apply during rhizome development.' }
  ], [
    { name: 'Mancozeb 75% WP', target: 'Leaf Blotch', time: 'At first sign of disease, repeat after 15 days', note: 'Common disease' },
    { name: 'Carbendazim 50% WP', target: 'Rhizome Rot', time: 'Preventive: seed treatment', note: 'Use healthy rhizomes' },
    { name: 'Imidacloprid 17.8% SL', target: 'Shoot Borer', time: 'At early growth stage', note: 'Monitor regularly' }
  ]),
  createCrop(46, 'Ginger', 'Zingiber officinale', 'ginger.jpg', ['Loam', 'Silty'], '8-10 months', [
    { day: 0, stage: 'Basal', dose: 'FYM 25t/ha + Urea 60kg + DAP 50kg + MOP 120kg', instruction: 'Apply at planting. Similar to turmeric.' },
    { day: 60, stage: 'First Top Dressing', dose: 'Urea 50kg', instruction: 'Apply at tillering stage.' },
    { day: 120, stage: 'Second Top Dressing', dose: 'Urea 40kg', instruction: 'Apply during rhizome development.' }
  ], [
    { name: 'Mancozeb 75% WP', target: 'Soft Rot', time: 'At first sign of disease', note: 'Critical disease for ginger' },
    { name: 'Carbendazim 50% WP', target: 'Rhizome Rot', time: 'Preventive: seed treatment', note: 'Use healthy rhizomes' },
    { name: 'Imidacloprid 17.8% SL', target: 'Shoot Borer', time: 'At early growth stage', note: 'Monitor regularly' }
  ]),
  createCrop(47, 'Coriander', 'Coriandrum sativum', 'coriander.jpg', ['Loam', 'Sandy Loam'], '90-120 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 40kg + DAP 30kg + MOP 20kg', instruction: 'Apply at sowing. Fast-growing spice crop.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 30kg', instruction: 'Apply at flowering stage.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Monitor regularly' },
    { name: 'Mancozeb 75% WP', target: 'Stem Gall', time: 'At first sign of disease', note: 'Use resistant varieties' }
  ]),
  createCrop(48, 'Cumin', 'Cuminum cyminum', 'cumin.jpg', ['Loam', 'Sandy Loam'], '100-120 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 40kg + DAP 30kg + MOP 20kg', instruction: 'Apply at sowing. Prefers cool, dry climate.' },
    { day: 30, stage: 'Top Dressing', dose: 'Urea 30kg', instruction: 'Apply at flowering stage.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Common pest' },
    { name: 'Mancozeb 75% WP', target: 'Alternaria Blight', time: 'At first sign of disease', note: 'Apply during humid conditions' }
  ]),
  createCrop(49, 'Fennel', 'Foeniculum vulgare', 'fennel.jpg', ['Loam', 'Sandy Loam'], '150-180 days', [
    { day: 0, stage: 'Basal', dose: 'Urea 50kg + DAP 40kg + MOP 30kg', instruction: 'Apply at sowing. Perennial crop.' },
    { day: 60, stage: 'Top Dressing', dose: 'Urea 40kg', instruction: 'Apply at flowering stage.' }
  ], [
    { name: 'Imidacloprid 17.8% SL', target: 'Aphids', time: 'When aphids detected', note: 'Monitor regularly' },
    { name: 'Mancozeb 75% WP', target: 'Powdery Mildew', time: 'At first sign of disease', note: 'Common in dry conditions' }
  ]),
  createCrop(50, 'Cardamom', 'Elettaria cardamomum', 'cardamom.jpg', ['Loam', 'Silty'], 'Perennial', [
    { day: 0, stage: 'Basal', dose: 'FYM 10t/ha + Urea 100kg + DAP 80kg + MOP 150kg per year', instruction: 'Apply at planting. Shade-loving crop.' },
    { day: 120, stage: 'First Top Dressing', dose: 'Urea 50kg', instruction: 'Apply during active growth.' },
    { day: 240, stage: 'Second Top Dressing', dose: 'Urea 50kg', instruction: 'Apply before flowering.' }
  ], [
    { name: 'Mancozeb 75% WP', target: 'Capsule Rot', time: 'At first sign of disease', note: 'Critical disease' },
    { name: 'Carbendazim 50% WP', target: 'Rhizome Rot', time: 'Preventive: use healthy planting material', note: 'Maintain proper drainage' },
    { name: 'Imidacloprid 17.8% SL', target: 'Thrips', time: 'When thrips detected', note: 'Monitor regularly' }
  ])
];

const SOIL_TYPES = [
  'Clayey',
  'Loam',
  'Sandy Loam',
  'Clayey Loam',
  'Black Soil',
  'Silty',
  'Well-drained Loam',
  'Sandy'
];

export default function PesticidePredictorPage({ user }) {
  const { t } = useTranslation();
  const [appliedCount, setAppliedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const percentage = totalCount > 0 ? (appliedCount / totalCount) * 100 : 0;
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reminders, setReminders] = useState({});
  const [completions, setCompletions] = useState({});

  const [cropId, setCropId] = useState('');
  const [soil, setSoil] = useState('');

  const selectedCrop = useMemo(
    () => CROP_DATABASE.find(c => c.id === Number(cropId)),
    [cropId]
  );

  const isSoilSuitable = useMemo(() => {
    if (!selectedCrop || !soil) return true;
    return selectedCrop.suitable_soils.includes(soil);
  }, [selectedCrop, soil]);

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
          <h1 className="font-semibold text-lg">{t('pesticidePredictorGuide.title')}</h1>
          <div className="w-24" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro */}
        <section className="glass-card rounded-3xl p-8 bg-white flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {t('pesticidePredictorGuide.subtitle')}
            </h2>
            <p className="text-text-secondary">
              {t(
                'pesticidePredictorGuide.helperText',
                'Choose a crop and soil type to view fertilizer schedule and pest management.'
              )}
            </p>
          </div>
        </section>

        {/* Input section */}
        <section className="glass-card rounded-3xl p-8 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <img src="/logo.png" alt="Agro-Rakshak" className="w-4 h-4" />
                {t('pesticidePredictorGuide.selectCrop')}
              </label>
              <div className="relative">
                <select
                  value={cropId}
                  onChange={e => {
                    const newCropId = e.target.value;
                    setCropId(newCropId);
                    const selected = CROP_DATABASE.find(crop => crop.id === parseInt(newCropId));
                    if (selected) {
                      setTotalCount(selected.fertilizers.length + selected.pesticides.length);
                      setAppliedCount(0);
                    } else {
                      setTotalCount(0);
                      setAppliedCount(0);
                    }
                  }}
                  className="input-field"
                >
                  <option value="">{t('pesticidePredictorGuide.selectCropPlaceholder', 'Choose a crop')}</option>
                  {CROP_DATABASE.map(crop => {
                    const cropKey = crop.name.toLowerCase();
                    return (
                      <option key={crop.id} value={crop.id}>
                        {t(`crops.${cropKey}`, crop.name)}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                {t('pesticidePredictorGuide.selectSoil', 'Select Soil Type')}
              </label>
              <div className="relative">
                <select
                  value={soil}
                  onChange={e => setSoil(e.target.value)}
                  className="input-field"
                >
                  <option value="">
                    {t('pesticidePredictorGuide.selectSoilPlaceholder', 'Choose soil type')}
                  </option>
                  {SOIL_TYPES.map(s => {
                    const soilKey = s.toLowerCase().replace(/\s+/g, '');
                    return (
                      <option key={s} value={s}>
                        {t(`soilTypes.${soilKey}`, s)}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                {t('pesticidePredictorGuide.startDateLabel', 'Sowing/Start Date')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {selectedCrop && soil && !isSoilSuitable && (
            <div className="mt-6 bg-amber-50 text-amber-800 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                {t(
                  'pesticidePredictorGuide.soilWarning',
                  'Warning: {{soil}} is not ideal for {{crop}}. Expected yield may be lower. Recommended soils: {{soils}}',
                  {
                    soil,
                    crop: selectedCrop.name,
                    soils: selectedCrop.suitable_soils.join(', ')
                  }
                )}
              </p>
            </div>
          )}
        </section>

        {/* Empty state */}
        {!selectedCrop || !soil ? (
          <section className="bg-white rounded-3xl p-16 text-center border border-dashed border-border">
            <img src="/logo.png" alt="Agro-Rakshak" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {t(
                'pesticidePredictorGuide.emptyTitle',
                'Select Crop & Soil Type'
              )}
            </h3>
            <p className="text-text-secondary">
              {t(
                'pesticidePredictorGuide.emptySubtitle',
                'Choose a crop and soil type above to view personalized recommendations.'
              )}
            </p>
          </section>
        ) : null}

        {/* Results */}
        {selectedCrop && soil && (
          <section className="space-y-8">
            {/* Crop summary */}
            <div className="glass-card rounded-3xl p-8 bg-white">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={selectedCrop.image || '/logo.png'} alt={selectedCrop.name} className="w-16 h-16" />
                  <div>
                    <h3 className="text-2xl font-bold text-text-primary">
                      {t(`crops.${selectedCrop.name.toLowerCase()}`, selectedCrop.name)}
                    </h3>
                    <p className="text-text-secondary">
                      {t('pesticidePredictorGuide.selectedSoil', {
                        defaultValue: 'Selected soil: {{soil}}',
                        soil: t(`soilTypes.${soil.toLowerCase().replace(/\s+/g, '')}`, soil)
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm font-medium text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>
                    {t('pesticidePredictorGuide.durationLabel', 'Duration')}: {selectedCrop.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs: Fertilizer + Pest */}
            <div className="mb-8">
              <ProgressBar percentage={percentage} applied={appliedCount} total={totalCount} />
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card rounded-3xl bg-white overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border bg-green-50/50">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {t('pesticidePredictorGuide.fertilizerSchedule', 'Fertilizer Schedule')}
                  </h3>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  {selectedCrop.fertilizers.map((f, idx) => {
                    const itemKey = `${selectedCrop.id}-${f.day}-${f.stage}`;
                    const isCompleted = !!completions[itemKey];
                    return (
                    <div
                      key={itemKey}
                      className="flex gap-4 relative"
                    >
                      {idx !== selectedCrop.fertilizers.length - 1 && (
                        <div className="absolute left-[1.6rem] top-10 bottom-[-1.5rem] w-0.5 bg-border/50" />
                      )}
                      <div className="flex-shrink-0">
                        <div className={`w-14 h-14 rounded-2xl ${isCompleted ? 'bg-green-500 shadow-green-500/20' : 'bg-primary shadow-primary/20'} text-white flex flex-col items-center justify-center shadow-lg`}>
                          <span className="text-[10px] uppercase font-bold opacity-80">{t('pesticidePredictorGuide.dayLabel', 'Day')}</span>
                          <span className="text-lg font-bold">{f.day}</span>
                        </div>
                      </div>
                      <div className={`flex-1 rounded-2xl p-4 border ${isCompleted ? 'bg-green-50 border-green-300' : 'bg-background border-border'}`}>
                        <h4 className="font-semibold text-text-primary mb-2">
                          {t(`pesticidePredictorGuide.fertilizerStages.${f.stage.toLowerCase().replace(/\s+/g, '')}`, f.stage)}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-text-secondary font-medium block text-xs uppercase tracking-wider mb-1">{t('pesticidePredictorGuide.doseLabel', 'Dose')}</span>
                            <span className="text-text-primary">{f.dose}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary font-medium block text-xs uppercase tracking-wider mb-1">{t('pesticidePredictorGuide.instructionLabel', 'Instruction')}</span>
                            <span className="text-text-primary">{f.instruction}</span>
                          </div>
                          <div className="flex items-center justify-between pt-3">
                            <label className="flex items-center gap-2 text-sm text-text-secondary">
                              <input
                                type="checkbox"
                                className="rounded-md"
                                checked={!!reminders[itemKey]}
                                onChange={async (e) => {
                                  const key = itemKey;
                                  const checked = e.target.checked;
                                  setReminders(prev => ({ ...prev, [key]: checked }));
                                  if (checked) {
                                    try {
                                      await apiService.api.post('/api/notifications/fertilizer-reminders', {
                                        cropName: selectedCrop.name,
                                        soilType: soil,
                                        stage: f.stage,
                                        dose: f.dose,
                                        instruction: f.instruction,
                                        day: f.day,
                                        startDate
                                      });
                                    } catch (_) {}
                                  }
                                }}
                              />
                              {t('pesticidePredictorGuide.enableReminder', 'Enable reminder (1 day before)')}
                            </label>
                            <label className="flex items-center gap-2 text-sm text-text-secondary">
                              <input
                  type="checkbox"
                  className="rounded-md"
                  checked={!!completions[itemKey]}
                  disabled={isCompleted}
                  onChange={async (e) => {
                    const key = itemKey;
                    const checked = e.target.checked;
                    if (checked) {
                      if (window.confirm('This cannot be undone.')) {
                        setCompletions(prev => ({ ...prev, [key]: checked }));
                        setAppliedCount(prev => prev + 1);
                        try {
                          await apiService.api.post('/api/notifications/fertilizer-reminders/complete', {
                            cropName: selectedCrop.name,
                            day: f.day,
                            startDate
                          });
                        } catch (_) {}
                      } else {
                        // If cancelled, revert the checkbox state
                        e.target.checked = false;
                      }
                    } else {
                      setCompletions(prev => ({ ...prev, [key]: checked }));
                      setAppliedCount(prev => prev - 1);
                    }
                  }}
                />
                              {t('pesticidePredictorGuide.markComplete', 'Mark complete')}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>

              <div className="glass-card rounded-3xl bg-white overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border bg-amber-50/50">
                  <h3 className="text-lg font-bold text-amber-700 flex items-center gap-2">
                    <Bug className="w-5 h-5" />
                    {t('pesticidePredictorGuide.pestManagement', 'Pest Management')}
                  </h3>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  {selectedCrop.pesticides.map(p => (
                    <div
                      key={`${selectedCrop.id}-${p.name}`}
                      className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-semibold text-text-primary">
                          {p.name}
                        </h4>
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-amber-700 border border-amber-100 shadow-sm">
                          {t(`pesticidePredictorGuide.pestTargets.${p.target.toLowerCase().replace(/\s+/g, '')}`, p.target)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3">
                        <label className="flex items-center gap-2 text-sm text-text-secondary">
                          <input
                            type="checkbox"
                            className="rounded-md"
                            checked={!!completions[`${selectedCrop.id}-${p.name}`]}
                            disabled={!!completions[`${selectedCrop.id}-${p.name}`]}
                            onChange={(e) => {
                              const key = `${selectedCrop.id}-${p.name}`;
                              const checked = e.target.checked;
                              if (checked) {
                                if (window.confirm('This cannot be undone.')) {
                                  setCompletions(prev => ({ ...prev, [key]: checked }));
                                  setAppliedCount(prev => prev + 1);
                                } else {
                                  e.target.checked = false;
                                }
                              } else {
                                setCompletions(prev => ({ ...prev, [key]: checked }));
                                setAppliedCount(prev => prev - 1);
                              }
                            }}
                          />
                          {t('pesticidePredictorGuide.markComplete', 'Mark complete')}
                        </label>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4 text-sm pt-2 border-t border-amber-100/50">
                        <div>
                          <span className="text-text-secondary font-medium block text-xs uppercase tracking-wider mb-1">{t('pesticidePredictorGuide.applicationTime', 'Application Time')}</span>
                          <span className="text-text-primary">{p.time}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary font-medium block text-xs uppercase tracking-wider mb-1">{t('pesticidePredictorGuide.noteLabel', 'Note')}</span>
                          <span className="text-text-primary">{p.note}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

