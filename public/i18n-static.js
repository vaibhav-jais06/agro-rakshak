const translations = {
  en: {
    backToPortal: "Back to Portal",
    knowledgeHub: "Knowledge Hub",
    fertilizerPredictor: "Fertilizer & Pesticide Predictor",
    warehouseGuide: "Post-Harvest Storage Guide",
    appName: "एग्रो रक्षक"
  },
  hi: {
    backToPortal: "पोर्टल पर वापस जाएं",
    knowledgeHub: "ज्ञान केंद्र",
    fertilizerPredictor: "उर्वरक और कीटनाशक भविष्यवक्ता",
    warehouseGuide: "फसल कटाई के बाद भंडारण गाइड",
    appName: "एग्रो रक्षक"
  },
  bn: {
    backToPortal: "পোর্টালে ফিরে যান",
    knowledgeHub: "জ্ঞান কেন্দ্র",
    fertilizerPredictor: "সার এবং কীটনাশক পূর্বাভাসকারী",
    warehouseGuide: "ফসল কাটার পরে সংরক্ষণ নির্দেশিকা",
    appName: "एग्रो रक्षक"
  },
  te: {
    backToPortal: "పోర్టల్‌కు తిరిగి వెళ్ళండి",
    knowledgeHub: "జ్ఞాన కేంద్రం",
    fertilizerPredictor: "ఎరువులు మరియు క్రిమి సంహారిణి అంచనా",
    warehouseGuide: "పంట కోత తర్వాత నిల్వ మార్గదర్శకం",
    appName: "एग्रो रक्षक"
  },
  ta: {
    backToPortal: "போர்டலுக்குத் திரும்பு",
    knowledgeHub: "அறிவு மையம்",
    fertilizerPredictor: "உர மற்றும் பூச்சிக்கொல்லி முன்னறிவிப்பாளர்",
    warehouseGuide: "அறுவடைக்குப் பின் சேமிப்பு வழிகாட்டி",
    appName: "एग्रो रक्षक"
  }
};

function getCurrentLanguage() {
  return localStorage.getItem('language') || 'en';
}

function setLanguage(lang) {
  localStorage.setItem('language', lang);
  updatePageLanguage();
}

function updatePageLanguage() {
  const lang = getCurrentLanguage();
  document.documentElement.lang = lang;
  
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });
  
  updateLanguageSwitcher();
}

function updateLanguageSwitcher() {
  const lang = getCurrentLanguage();
  const languages = {
    en: { name: 'English', flag: '🇬🇧' },
    hi: { name: 'हिन्दी', flag: '🇮🇳' },
    bn: { name: 'বাংলা', flag: '🇮🇳' },
    te: { name: 'తెలుగు', flag: '🇮🇳' },
    ta: { name: 'தமிழ்', flag: '🇮🇳' }
  };
  
  const currentBtn = document.getElementById('currentLangBtn');
  if (currentBtn && languages[lang]) {
    currentBtn.innerHTML = `<span style="margin-right: 5px;">${languages[lang].flag}</span>${languages[lang].name}`;
  }
}

function createLanguageSwitcher() {
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];
  
  const container = document.createElement('div');
  container.style.cssText = 'position: relative; display: inline-block;';
  
  const currentLang = getCurrentLanguage();
  const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];
  
  const button = document.createElement('button');
  button.id = 'currentLangBtn';
  button.innerHTML = `<span style="margin-right: 5px;">${currentLangObj.flag}</span>${currentLangObj.name}`;
  button.style.cssText = `
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  
  const dropdown = document.createElement('div');
  dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    min-width: 150px;
    display: none;
    z-index: 1000;
  `;
  
  languages.forEach(lang => {
    const option = document.createElement('button');
    option.innerHTML = `<span style="margin-right: 8px;">${lang.flag}</span>${lang.name}`;
    option.style.cssText = `
      width: 100%;
      text-align: left;
      padding: 10px 16px;
      border: none;
      background: ${lang.code === currentLang ? '#f0fdf4' : 'white'};
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
    `;
    option.onmouseover = () => option.style.background = '#f9fafb';
    option.onmouseout = () => option.style.background = lang.code === currentLang ? '#f0fdf4' : 'white';
    option.onclick = () => {
      setLanguage(lang.code);
      dropdown.style.display = 'none';
    };
    dropdown.appendChild(option);
  });
  
  button.onclick = (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  };
  
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
  
  container.appendChild(button);
  container.appendChild(dropdown);
  
  return container;
}

document.addEventListener('DOMContentLoaded', () => {
  updatePageLanguage();
  
  const langSwitcherContainer = document.getElementById('languageSwitcher');
  if (langSwitcherContainer) {
    langSwitcherContainer.appendChild(createLanguageSwitcher());
  }
});
