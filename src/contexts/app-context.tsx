'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { languages, Translations } from '@/lib/i18n';
import type { TranslationKeys } from '@/lib/i18n';
import { auth } from '@/lib/firebase';
import { getUserProfileByAuthId } from '@/services/profileService';
import type { UserProfile } from '@/types';

type Language = (typeof languages)[0];

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys, replacements?: Record<string, string | number>) => string;
  user: UserProfile | null | undefined; // Allow undefined for loading state
  role: 'driver' | 'passenger' | 'fleet-manager' | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(languages[0]); // Default to pt-PT
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined); // Start as undefined
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profileData = await getUserProfileByAuthId(firebaseUser.uid);
        if (profileData) {
          const fullUserProfile: UserProfile = {
            ...profileData, // Contains role, name, email, etc. from Firestore
            id: firebaseUser.uid, // Ensure the auth UID is the primary ID
          };
          setUser(fullUserProfile);
          setRole(profileData.role);
        } else {
          // Authenticated but no profile yet, this might happen during signup
          setUser(null); // Or a minimal user object
          setRole(null);
        }
      } else {
        // User logged out
        setUser(null);
        setRole(null);
      }
    });
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
