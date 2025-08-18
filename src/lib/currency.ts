"use client";

import { useCallback } from 'react';
import { languages } from './i18n';

export const useCurrency = (language: string) => {
  const formatCurrency = useCallback((value: number) => {
    const currentLanguageInfo = languages.find(lang => lang.value === language) || languages.find(l => l.value === 'pt-PT');
    
    if (!currentLanguageInfo) return `${value}`;

    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currentLanguageInfo.currency.code,
    }).format(value);
  }, [language]);

  return { formatCurrency };
};
