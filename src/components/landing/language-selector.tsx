'use client';

import * as React from 'react';
import Image from 'next/image';
import { Check, Languages } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { languages } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LanguageSelector() {
  const { language, setLanguage, t } = useAppContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('select_language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ScrollArea className="h-72">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.value}
              onSelect={() => setLanguage(lang)}
            >
              <Image
                src={`https://flagcdn.com/w20/${lang.flagCode}.png`}
                alt={`${lang.label} flag`}
                width={20}
                height={15}
                className="mr-2"
              />
              {lang.label}
              <Check
                className={cn(
                  'ml-auto h-4 w-4',
                  language.value === lang.value ? 'opacity-100' : 'opacity-0'
                )}
              />
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
