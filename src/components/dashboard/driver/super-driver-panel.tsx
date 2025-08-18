'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

interface SuperDriverPanelProps {
    t: (key: string, replacements?: Record<string, string | number>) => string;
}

export default function SuperDriverPanel({ t }: SuperDriverPanelProps) {
    const [isOnline, setIsOnline] = useState(false);
    const [queuePosition] = useState({ position: 5, total: 20 });

    return (
        <div className="flex flex-col h-full gap-4">
            <Card>
                <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Switch id="online-status" checked={isOnline} onCheckedChange={setIsOnline} />
                        <Label htmlFor="online-status">{isOnline ? t('driver_panel_toggle_offline') : t('driver_panel_toggle_online')}</Label>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {isOnline ? t('driver_panel_status_online') : t('driver_panel_status_offline')}
                    </div>
                </CardContent>
            </Card>

             <Card className="flex-1 flex flex-col">
                <CardContent className="p-2 flex-1 relative">
                    <div className="absolute inset-0 bg-secondary rounded-lg flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <Globe className="h-16 w-16" />
                        <p>{t('driver_panel_map_placeholder')}</p>
                        {isOnline && (
                             <p className="font-bold text-lg text-primary">
                                {t('driver_panel_queue_info', { position: queuePosition.position, total: queuePosition.total })}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
