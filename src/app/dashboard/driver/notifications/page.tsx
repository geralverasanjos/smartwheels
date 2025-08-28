'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Car, FileCheck, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '@/services/notificationService';
import type { AppNotification } from '@/types';
import { useRouter } from 'next/navigation';

const iconMap: { [key: string]: LucideIcon } = {
  Car,
  FileCheck,
  Tag,
  Default: Bell,
};

export default function DriverNotificationsPage() {
    const { t, user } = useAppContext();
    const router = useRouter();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                const userNotifications = await getNotifications(user.id);
                setNotifications(userNotifications);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchNotifications();
    }, [user]);

    const handleNotificationClick = async (notification: AppNotification) => {
        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications(
                    notifications.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
            }
        }
        if (notification.link) {
            router.push(notification.link);
        }
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
                        {notifications.map((notification) => {
                             const Icon = iconMap[notification.icon] || iconMap.Default;
                             return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
                                        !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : "bg-transparent hover:bg-accent"
                                    )}
                                >
                                    <div className={cn("relative", !notification.isRead && "text-primary")}>
                                        <Icon className="h-6 w-6" />
                                        {!notification.isRead && <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-primary" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{t(notification.titleKey)}</p>
                                        <p className="text-sm text-muted-foreground">{t(notification.descriptionKey, notification.descriptionParams)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(notification.timestamp?.seconds * 1000).toLocaleString()}</p>
                                    </div>
                                </div>
                            )
                        })}
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
