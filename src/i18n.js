import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en/translation.json';
import hiTranslation from './locales/hi/translation.json';
import bnTranslation from './locales/bn/translation.json';
import teTranslation from './locales/te/translation.json';
import taTranslation from './locales/ta/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  hi: {
    translation: hiTranslation
  },
  bn: {
    translation: bnTranslation
  },
  te: {
    translation: teTranslation
  },
  ta: {
    translation: taTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'hi',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Set document language attribute based on current i18n language
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'hi';
}

export default i18n;
