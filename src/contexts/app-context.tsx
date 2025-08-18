'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { languages, Translations } from '@/lib/i18n';
import type { TranslationKeys } from '@/lib/i18n';

type Language = (typeof languages)[0];

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys, replacements?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(languages[0]); // Default to pt-PT

  const t = useCallback((key: TranslationKeys, replacements?: Record<string, string | number>) => {
    const langKey = language.value as keyof typeof Translations[typeof key];
    let translation = Translations[key]?.[langKey] || key;
    
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }

    return translation;
  }, [language]);

  return (
    <AppContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
