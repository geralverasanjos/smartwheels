'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Car, FileCheck, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { TranslationKeys } from '@/lib/i18n';

interface Notification {
  id: number;
  icon: LucideIcon;
  titleKey: TranslationKeys;
  descriptionKey: TranslationKeys;
  timestamp: string;
  isRead: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    icon: Car,
    titleKey: 'notification_new_ride_request_title',
    descriptionKey: 'notification_new_ride_request_desc',
    timestamp: 'Há 5 minutos',
    isRead: false,
  },
  {
    id: 2,
    icon: FileCheck,
    titleKey: 'notification_document_approved_title',
    descriptionKey: 'notification_document_approved_desc',
    timestamp: 'Há 1 hora',
    isRead: false,
  },
  {
    id: 3,
    icon: Tag,
    titleKey: 'notification_new_promo_available_title',
    descriptionKey: 'notification_new_promo_available_desc',
    timestamp: 'Ontem',
    isRead: true,
  },
    {
    id: 4,
    icon: Bell,
    titleKey: 'notification_welcome_driver_title',
    descriptionKey: 'notification_welcome_driver_desc',
    timestamp: '1 semana atrás',
    isRead: true,
  },
];

export default function DriverNotificationsPage() {
    const { t } = useAppContext();
    const [notifications, setNotifications] = useState(initialNotifications);

    const handleNotificationClick = (id: number) => {
        setNotifications(
            notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell /> {t('menu_notifications')}</CardTitle>
                <CardDescription>{t('notifications_page_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                {notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id)}
                                className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
                                    !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : "bg-transparent hover:bg-accent"
                                )}
                            >
                                <div className={cn("relative", !notification.isRead && "text-primary")}>
                                     <notification.icon className="h-6 w-6" />
                                     {!notification.isRead && <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-primary" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{t(notification.titleKey)}</p>
                                    <p className="text-sm text-muted-foreground">{t(notification.descriptionKey)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-muted-foreground py-16">
                        <Bell className="mx-auto h-12 w-12" />
                        <h2 className="text-2xl font-semibold">{t('notifications_no_notifications')}</h2>
                        <p>{t('notifications_no_notifications_desc')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
