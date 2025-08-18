'use client';

import { useAppContext } from '@/contexts/app-context';
import { usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { t } = useAppContext();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('settings_page_title')}</h1>
        <p className="text-muted-foreground">{t('settings_page_description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings_account_title')}</CardTitle>
          <CardDescription>{t('settings_account_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>{t('btn_edit_profile')}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings_notifications_title')}</CardTitle>
          <CardDescription>{t('settings_notifications_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span>{t('settings_notifications_email_label')}</span>
            </Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
              <span>{t('settings_notifications_push_label')}</span>
            </Label>
            <Switch id="push-notifications" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings_appearance_title')}</CardTitle>
          <CardDescription>{t('settings_appearance_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
            <div>
              <RadioGroupItem value="light" id="light" className="peer sr-only" />
              <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                {t('settings_theme_light')}
              </Label>
            </div>
             <div>
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                {t('settings_theme_dark')}
              </Label>
            </div>
             <div>
              <RadioGroupItem value="system" id="system" className="peer sr-only" />
              <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                {t('settings_theme_system')}
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
