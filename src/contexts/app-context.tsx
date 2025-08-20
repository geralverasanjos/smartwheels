'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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
  user: UserProfile | null | undefined; // undefined: loading, null: not logged in, UserProfile: logged in
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(languages[0]); // Default to pt-PT
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined); // Start as undefined (loading)

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore.
        try {
          const profileData = await getUserProfileByAuthId(firebaseUser.uid);
          setUser(profileData); // This can be the UserProfile or null if not found
          if (!profileData) {
            console.error(`No profile found for authenticated user ${firebaseUser.uid}.`);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null); // Set to null on error to avoid infinite loading
        }
      } else {
        // User is signed out.
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ language, setLanguage, t, user }}>
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
