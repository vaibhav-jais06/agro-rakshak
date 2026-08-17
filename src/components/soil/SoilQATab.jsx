import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Q&A Knowledge base
const qaKnowledgeBase = {
  'pH': {
    keywords: ['ph', 'acidic', 'alkaline', 'acidity'],
    answers: [
      'Soil pH measures acidity or alkalinity on a scale of 0-14. Most crops prefer 6.0-7.5. Low pH (acidic) soils need lime, while high pH (alkaline) soils need sulfur.',
      'pH affects nutrient availability. At pH 6.5, most nutrients are available. Iron, manganese, and zinc are more available at lower pH, while phosphorus is better at neutral pH.',
      'Test soil pH using a test kit or laboratory. Most Indian soils are naturally acidic in high rainfall areas (Northeast, Ghats) and neutral to alkaline in dry regions (Northwest).'
    ]
  },
  'organic matter': {
    keywords: ['organic', 'compost', 'manure', 'carbon'],
    answers: [
      'Organic matter improves soil structure, water retention, and microbial activity. Target 2-3% for productive soils. Add compost, farmyard manure, or green manure.',
      'Decomposed plant material, animal waste, and biochar are good sources of organic matter. Apply 5-10 tons per hectare annually for best results.',
      'Organic matter helps soil retain moisture and nutrients, reduces erosion, and supports beneficial microorganisms. Regular additions improve long-term soil health.'
    ]
  },
  'nitrogen': {
    keywords: ['nitrogen', 'n', 'nítrogen', 'protein'],
    answers: [
      'Nitrogen is essential for leaf and shoot growth. Apply 60-120 kg/ha depending on crop. Use urea, ammonium sulfate, or organic sources like neem cake.',
      'Nitrogen deficiency causes yellowing of leaves. Excess nitrogen delays flowering and increases pest susceptibility. Use split applications for efficiency.',
      'Legumes fix atmospheric nitrogen naturally. Rotating with legume crops reduces nitrogen fertilizer needs and improves soil health.'
    ]
  },
  'phosphorus': {
    keywords: ['phosphorus', 'phosphate', 'p', 'flowering'],
    answers: [
      'Phosphorus promotes root development, flowering, and seed formation. Apply 40-60 kg/ha typically. Use single superphosphate or rock phosphate.',
      'Phosphorus deficiency causes stunted growth and purple discoloration. Fixed phosphorus in alkaline soils can reduce availability; use acidifying practices.',
      'Mycorrhizal fungi improve phosphorus uptake. Avoid excessive lime and use phosphate-solubilizing bacteria for better availability.'
    ]
  },
  'potassium': {
    keywords: ['potassium', 'potash', 'k', 'strength'],
    answers: [
      'Potassium strengthens plants and improves disease resistance. Apply 40-80 kg/ha. Use muriate of potash or potassium sulfate.',
      'Deficiency causes weak stems and reduced yield. Excess can reduce magnesium availability. Balance K:N ratios for best results.',
      'Potassium-rich sources: wood ash, seaweed, and banana leaves. In coastal areas, recycle mangrove waste for potassium.'
    ]
  },
  'moisture': {
    keywords: ['water', 'moisture', 'irrigation', 'drought'],
    answers: [
      '15-25% soil moisture is optimal for most crops. Too dry causes stress; too wet causes waterlogging. Use mulching to retain moisture.',
      'Irrigation timing matters: water deeply but less frequently. Morning irrigation reduces disease. Drip irrigation saves 30-50% water vs. flooding.',
      'Check soil moisture by squeezing: if it forms a ball, moisture is adequate. Sandy soils need frequent watering; clay soils retain water longer.'
    ]
  },
  'crop': {
    keywords: ['crop', 'yield', 'recommend', 'plant'],
    answers: [
      'Choose crops based on soil pH, moisture, organic matter, and regional suitability. Wheat prefers 6.0-7.5 pH; rice needs 5.5-7.5; cotton suits 6.0-8.5 pH.',
      'Rotate crops annually: legumes restore nitrogen, cereals deplete it. Diversification reduces pest/disease pressure and market risk.',
      'Seasonal crops: Kharif (monsoon): rice, maize; Rabi (winter): wheat, barley; Summer: groundnut, vegetables. Match crop to weather patterns.'
    ]
  },
  'soil type': {
    keywords: ['soil', 'clay', 'sandy', 'loam', 'texture'],
    answers: [
      'Sandy soil: drains quickly, low fertility, needs organic matter. Clay: retains water, poor aeration, needs gypsum. Loamy: balanced, ideal for most crops.',
      'Soil texture affects water and nutrient retention. Sandy needs frequent watering; clay needs drainage. Add organic matter to improve both.',
      'Test texture: sandy feels gritty, clay feels sticky when wet and hard when dry. Loam crumbles easily. Improve with compost or manure.'
    ]
  },
  'fertilizer': {
    keywords: ['fertilizer', 'fertiliser', 'chemical', 'npk'],
    answers: [
      'NPK (nitrogen-phosphorus-potassium) is essential. Common ratios: 10:26:26 for vegetables, 20:20:0 for cereals. Apply based on soil test results.',
      'Organic fertilizers: compost, manure, bone meal, neem cake. Chemical: urea, DAP, MOP. Combine both for best soil health.',
      'Timing: Pre-sowing, top-dressing at growth stages. Liquid fertilizers for quick absorption during critical periods.'
    ]
  },
  'pest': {
    keywords: ['pest', 'insect', 'disease', 'leaf'],
    answers: [
      'Healthy soil with organic matter supports beneficial microbes that suppress pests. Avoid excessive nitrogen which attracts pests.',
      'Crop rotation breaks pest cycles. Neem oil, sulfur, and Bacillus thuringiensis are organic pest controls.',
      'Monitor regularly: scout for early signs. Healthy plants resist pests better; stressed plants attract infestations.'
    ]
  }
};

// Simple Q&A logic
const generateAnswer = (question) => {
  const q = question.toLowerCase().trim();

  // Find matching category
  for (const [category, data] of Object.entries(qaKnowledgeBase)) {
    for (const keyword of data.keywords) {
      if (q.includes(keyword)) {
        const answers = data.answers;
        return answers[Math.floor(Math.random() * answers.length)];
      }
    }
  }

  // Default answers for general questions
  const defaults = [
    'Based on soil health, I recommend regular soil testing, adding organic matter, and balanced fertilizer use. Consult your local agricultural office for specific advice.',
    'Soil health is the foundation of farming. Maintain good pH, organic matter, and moisture for best yields.',
    'Every region has unique soil conditions. Test your soil first, then follow recommendations for your specific area and crop.'
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
};

export default function SoilQATab() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! I\'m here to answer questions about soil health, crop recommendations, nutrients, and farming. What would you like to know?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAsk = async () => {
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: inputValue
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const answer = generateAnswer(inputValue);
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: answer
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg border-2 border-green-200 p-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-gray-50 rounded-lg p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-green-100 text-gray-800 rounded-bl-none border border-green-200'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-green-100 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none border border-green-200 flex items-center space-x-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t-2 border-green-200 pt-4">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask about soil, crops, nutrients..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          onClick={handleAsk}
          disabled={loading || !inputValue.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
