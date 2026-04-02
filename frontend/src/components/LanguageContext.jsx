import { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, translations } from '../i18n';

const LanguageContext = createContext();

const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'medbios_lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.find(l => l.code === saved) ? saved : DEFAULT_LANG;
  });

  useEffect(() => {
    const langObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
    document.documentElement.lang = lang;
    document.documentElement.dir = langObj.dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (code) => {
    if (LANGUAGES.find(l => l.code === code)) {
      setLangState(code);
    }
  };

  const t = (key) => {
    return (translations[lang] && translations[lang][key]) || translations[DEFAULT_LANG][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
