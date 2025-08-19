'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { languages, Translations } from '@/lib/i18n';
import type { TranslationKeys } from '@/lib/i18n';
import { auth } from '@/lib/firebase';
import { getUserProfileByAuthId } from '@/services/profileService';

type Language = (typeof languages)[0];

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Add user and role to the context
  t: (key: TranslationKeys, replacements?: Record<string, string | number>) => string;
  user: (User & { role?: 'driver' | 'passenger' | 'fleet-manager' }) | null;
  role: 'driver' | 'passenger' | 'fleet-manager' | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(languages[0]); // Default to pt-PT
  const [isClient, setIsClient] = useState(false);
  // Add state for user and role
  const [user, setUser] = useState<(User & { role?: 'driver' | 'passenger' | 'fleet-manager' }) | null>(null);
  const [role, setRole] = useState<'driver' | 'passenger' | 'fleet-manager' | null>(null);

 useEffect(() => {
    setIsClient(true);
  }, []);

  const t = useCallback((key: TranslationKeys, replacements?: Record<string, string | number>) => {
    if (!isClient) {
      return key; // Render the key on the server or before hydration
    }
    
    const langKey = language.value as keyof typeof Translations[typeof key];
    let translation = Translations[key]?.[langKey] || key;
    
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }

    return translation;
  }, [language, isClient]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile
        getUserProfileByAuthId(firebaseUser.uid)
          .then(profileData => {
            if (profileData) {
              setUser({ ...firebaseUser, ...profileData });
              setRole(profileData.role);
            } else {
              // User is authenticated but profile doesn't exist
              setUser(firebaseUser);
              setRole(null); // Or set to 'unassigned' or similar
            }
          });
      } else {
        // User logged out
        setUser(null); // Clear basic Firebase user state
        setRole(null); // Clear role state
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ language, setLanguage, t, user, role }}>
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
