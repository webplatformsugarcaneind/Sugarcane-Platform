import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { applyGoogleTranslate } from './TranslatorWidget';

const LANGS = [
  { code: 'en', native: 'English' },
  { code: 'hi', native: 'हिन्दी' },
  { code: 'mr', native: 'मराठी' },
  { code: 'ta', native: 'தமிழ்' },
  { code: 'te', native: 'తెలుగు' },
  { code: 'kn', native: 'ಕನ್ನಡ' },
  { code: 'gu', native: 'ગુજરાતી' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', native: 'বাংলা' },
  { code: 'ml', native: 'മലയാളം' },
  { code: 'ur', native: 'اردو' },
];

export default function LanguageSelector() {
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState(
    () => localStorage.getItem('canesetu_lang') || 'en'
  );
  const langRef = useRef(null);
  const { i18n } = useTranslation();

  // Close language dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    setActiveLang(langCode);
    setLangOpen(false);
    localStorage.setItem('canesetu_lang', langCode);
    localStorage.setItem('i18nextLng', langCode); // Also sync the native i18next language memory
    
    // 1. Trigger Native Translation (react-i18next) for instant mapped strings
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(langCode);
    }
    
    // 2. Trigger Google API for unmapped fallback strings
    applyGoogleTranslate(langCode);
    
    // 3. Force a clean reload to guarantee both Google API and i18next 
    // initialize perfectly with the new language.
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="navbar-lang" ref={langRef}>
      <button
        className="nb-lang-btn"
        onClick={() => setLangOpen(v => !v)}
        aria-label="Change language"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="nb-lang-label">
          {LANGS.find(l => l.code === activeLang)?.native || 'English'}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"
          style={{ transition: 'transform .2s', transform: langOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {langOpen && (
        <ul className="nb-lang-panel">
          {LANGS.map(lang => (
            <li
              key={lang.code}
              className={`nb-lang-item ${lang.code === activeLang ? 'nb-lang-item--active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.native}
              {lang.code === activeLang && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
