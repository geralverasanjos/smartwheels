'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, Car, Truck, Receipt, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/currency';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getUserTripHistory } from '@/services/historyService';
import type { Trip } from '@/types';

export default function PassengerHistoryPage() {
    const { t, user } = useAppContext();
    const { formatCurrency, formatDate } = useCurrency();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }

        const fetchHistory = async () => {
            try {
                const historyData = await getUserTripHistory(user.id, 'passenger');
                setTrips(historyData);
            } catch (error) {
                console.error("Failed to fetch passenger trip history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> {t('menu_history')}</CardTitle>
                <CardDescription>{t('history_page_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-16 w-16 animate-spin" />
                    </div>
                ) : trips.length > 0 ? (
                    <div className="space-y-4">
                        {trips.map(trip => (
                            <Card key={trip.id} className="flex flex-col md:flex-row items-center gap-4 p-4">
                                <div className="flex items-center gap-4 flex-1">
                                    {trip.type === 'trip' ? <Car className="h-8 w-8 text-primary" /> : <Truck className="h-8 w-8 text-primary" />}
                                    <Avatar>
                                        <AvatarImage src={trip.driver?.avatarUrl} data-ai-hint="person face" />
                                        <AvatarFallback>{trip.driver?.name?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold">{t(trip.type === 'trip' ? 'trip_type_trip' : 'trip_type_delivery')} com {trip.driver?.name || 'N/A'}</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(trip.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <p className="font-bold">{formatCurrency(trip.value)}</p>
                                        <p className="text-muted-foreground">{t('history_value')}</p>
                                    </div>
                                    <div className="text-center">
                                       <Badge variant={trip.status === 'completed' ? 'default' : 'destructive'}>
                                            {t(trip.status === 'completed' ? 'status_completed' : 'status_cancelled')}
                                        </Badge>
                                        <p className="text-muted-foreground mt-1">{t('history_status')}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="icon">
                                    <Receipt className="h-4 w-4" />
                                    <span className="sr-only">{t('history_btn_receipt')}</span>
                                </Button>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <History className="mx-auto h-12 w-12" />
                        <h2 className="text-2xl font-semibold">{t('history_no_trips')}</h2>
                        <p>{t('history_no_trips_desc')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
