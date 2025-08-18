"use client";

import { useCallback } from 'react';
import { languages } from './i18n';
import { useAppContext } from '@/contexts/app-context';

export const useCurrency = () => {
  const { language } = useAppContext();
  
  const formatCurrency = useCallback((value: number) => {
    const currentLanguageInfo = languages.find(lang => lang.value === language.value) || languages.find(l => l.value === 'pt-PT');
    
    if (!currentLanguageInfo) return `${value}`;

    return new Intl.NumberFormat(language.value, {
      style: 'currency',
      currency: currentLanguageInfo.currency.code,
    }).format(value);
  }, [language]);

  return { formatCurrency };
};
