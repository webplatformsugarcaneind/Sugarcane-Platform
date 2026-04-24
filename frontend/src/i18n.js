import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTran from './locales/en/translation.json';
import hiTran from './locales/hi/translation.json';
import mrTran from './locales/mr/translation.json';

const resources = {
  en: { translation: enTran },
  hi: { translation: hiTran },
  mr: { translation: mrTran }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false // React already safes from xss
    }
  });

export default i18n;
