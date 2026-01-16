import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Language, 
  DEFAULT_LANGUAGE, 
  getBrowserLanguage, 
  isRTL, 
  LANGUAGES, 
  getLanguageInfo,
  loadTranslations,
  getTranslation,
  TranslationDictionary,
  isValidLanguage
} from '@/lib/i18n';
import { en } from '@/lib/i18n/locales/en';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  languages: typeof LANGUAGES;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const isSyncing = useRef(false);
  
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    // Validate saved language is authorized
    if (saved && isValidLanguage(saved)) {
      return saved;
    }
    // Try browser language
    const browserLang = getBrowserLanguage();
    if (isValidLanguage(browserLang)) {
      return browserLang;
    }
    // Default to English
    return DEFAULT_LANGUAGE;
  });
  
  const [translations, setTranslations] = useState<TranslationDictionary>(en);

  // Load language from database when user is authenticated
  useEffect(() => {
    const loadLanguageFromDB = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('language')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading language from database:', error);
        }

        if (data?.language && isValidLanguage(data.language)) {
          setLanguageState(data.language as Language);
          localStorage.setItem('language', data.language);
        }
      } catch (e) {
        console.error('Error loading language:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageFromDB();
  }, [user]);

  // Load translations when language changes
  useEffect(() => {
    loadTranslations(language).then(setTranslations);
  }, [language]);

  // Persist language and update document attributes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
    
    // Add/remove RTL class for styling
    if (isRTL(language)) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [language]);

  // Sync language to database when it changes
  const syncLanguageToDB = useCallback(async (lang: Language) => {
    if (!user || isSyncing.current) return;
    
    isSyncing.current = true;
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          language: lang,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving language to database:', error);
      }
    } catch (e) {
      console.error('Error syncing language:', e);
    } finally {
      isSyncing.current = false;
    }
  }, [user]);

  const setLanguage = useCallback((lang: Language) => {
    // Security: Only allow authorized languages
    if (!isValidLanguage(lang)) {
      console.warn(`Attempted to set unauthorized language: ${lang}`);
      return;
    }
    setLanguageState(lang);
    syncLanguageToDB(lang);
  }, [syncLanguageToDB]);

  const t = useCallback((key: string): string => {
    return getTranslation(key, translations);
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isRTL: isRTL(language),
      languages: LANGUAGES,
      isLoading
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { Language };
