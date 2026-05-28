import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './TranslatorWidget.css';

// Pages that have their own internal navigation (no Navbar rendered)
// — the floating widget shows only on these pages
const PAGES_WITHOUT_NAVBAR = ['/', '/signup'];

const LANGUAGES = [
  { code: 'en', label: 'English',   native: 'English'   },
  { code: 'hi', label: 'Hindi',     native: 'हिन्दी'     },
  { code: 'mr', label: 'Marathi',   native: 'मराठी'      },
  { code: 'ta', label: 'Tamil',     native: 'தமிழ்'      },
  { code: 'te', label: 'Telugu',    native: 'తెలుగు'     },
  { code: 'kn', label: 'Kannada',   native: 'ಕನ್ನಡ'      },
  { code: 'gu', label: 'Gujarati',  native: 'ગુજરાતી'   },
  { code: 'pa', label: 'Punjabi',   native: 'ਪੰਜਾਬੀ'     },
  { code: 'bn', label: 'Bengali',   native: 'বাংলা'      },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം'    },
  { code: 'ur', label: 'Urdu',      native: 'اردو'       },
];

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      width="14" height="14"
      style={{ transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * Trigger Google Translate — uses doGTranslate (most reliable) with
 * .goog-te-combo as fallback.
 */
export function applyGoogleTranslate(langCode) {
  // 1. Force the cookie so Google Translate picks it up on next script tick
  document.cookie = `googtrans=/en/${langCode}; path=/`;
  document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;

  // 2. Try the combo box hack for instant non-reload switching
  if (typeof window.doGTranslate === 'function') {
    window.doGTranslate('en|' + langCode);
  } else {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

export default function TranslatorWidget() {
  const [open, setOpen]             = useState(false);
  const [activeLang, setActiveLang] = useState(
    () => localStorage.getItem('canesetu_lang') || 'en'
  );
  const [ready, setReady]           = useState(false);
  const panelRef = useRef(null);
  const btnRef   = useRef(null);
  const location = useLocation();

  const showFloatingBtn = PAGES_WITHOUT_NAVBAR.includes(location.pathname);

  // --- 1. Poll until Google Translate is ready ---
  useEffect(() => {
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      const combo = document.querySelector('.goog-te-combo');
      const gtReady = typeof window.doGTranslate === 'function' || !!combo;
      if (gtReady) {
        setReady(true);
        clearInterval(check);
      }
      if (attempts > 60) clearInterval(check); // give up after ~18s
    }, 300);
    return () => clearInterval(check);
  }, []);

  // --- 2. Apply saved language once ready ---
  useEffect(() => {
    if (!ready) return;
    const saved = localStorage.getItem('canesetu_lang') || 'en';
    if (saved !== 'en') {
      setActiveLang(saved);
      setTimeout(() => applyGoogleTranslate(saved), 400);
    }
  }, [ready]);

  // --- 3. Re-apply on every SPA route change (Anti-Flash Syncing) ---
  useEffect(() => {
    if (!ready || activeLang === 'en') return;
    
    // Apply immediately to prevent "flash of English" on static content
    applyGoogleTranslate(activeLang);
    
    // Apply again after 500ms to catch any async data (API calls) that load later
    const timer = setTimeout(() => applyGoogleTranslate(activeLang), 500);
    
    // Apply one more time after 1200ms for slow networks
    const slowTimer = setTimeout(() => applyGoogleTranslate(activeLang), 1200);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(slowTimer);
    };
  }, [location.pathname, ready, activeLang]);

  // --- 4. Close dropdown on outside click ---
  useEffect(() => {
    function handleOutside(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current   && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function selectLang(code) {
    setActiveLang(code);
    setOpen(false);
    localStorage.setItem('canesetu_lang', code);
    applyGoogleTranslate(code);
  }

  // This component now acts as a pure headless logic provider 
  // since the language selector is embedded into the navbars directly.
  return null;
}
