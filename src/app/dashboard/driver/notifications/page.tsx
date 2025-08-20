'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Car, FileCheck, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { TranslationKeys } from '@/lib/i18n';

interface Notification {
  id: string; // Changed to string for Firestore IDs
  icon: LucideIcon;
  titleKey: TranslationKeys;
  descriptionKey: TranslationKeys;
  timestamp: string;
  isRead: boolean;
}

// Removed initialNotifications mock data
// const initialNotifications: Notification[] = [ ... ];

export default function DriverNotificationsPage() {
    const { t, user } = useAppContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            // TODO: Implement a service to fetch notifications from Firestore
            // e.g., const userNotifications = await getNotifications(user.id);
            // setNotifications(userNotifications);
            
            // For now, we simulate an empty state after loading
            setNotifications([]);
            setLoading(false);
        };
        
        fetchNotifications();
    }, [user]);

    const handleNotificationClick = (id: string) => {
        // TODO: Implement logic to mark notification as read in the backend
        setNotifications(
            notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>
    }

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
                        <h2 className="text-2xl font-semibold mt-4">{t('notifications_no_notifications')}</h2>
                        <p>{t('notifications_no_notifications_desc')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
