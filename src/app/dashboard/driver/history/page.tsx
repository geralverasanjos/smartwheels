'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, Car, Truck, User, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/lib/currency';
import { getDriverTripHistory } from '@/services/historyService';
import type { Trip } from '@/types';

export default function DriverHistoryPage() {
    const { t } = useAppContext();
    const { formatCurrency, formatDate } = useCurrency();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const historyData = await getDriverTripHistory();
                setTrips(historyData);
            } catch (error) {
                console.error("Failed to fetch trip history:", error);
                // Optionally show a toast to the user
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

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
                            <Card key={trip.id} className="grid grid-cols-2 md:grid-cols-5 items-center gap-4 p-4">
                                <div className="flex items-center gap-3 md:col-span-2">
                                     {trip.type === 'trip' ? <Car className="h-6 w-6 text-primary" /> : <Truck className="h-6 w-6 text-primary" />}
                                     <div>
                                        <p className="font-bold">{t(trip.type === 'trip' ? 'trip_type_trip' : 'trip_type_delivery')}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{trip.passengerName}</p>
                                     </div>
                                </div>
                                <div className="text-left md:text-center">
                                    <p className="font-semibold">{formatDate(trip.date)}</p>
                                    <p className="text-xs text-muted-foreground">{t('history_date')}</p>
                                </div>
                                <div className="text-left md:text-center">
                                    <p className="font-semibold text-primary">{formatCurrency(trip.earnings || trip.value * 0.8)}</p>
                                    <p className="text-xs text-muted-foreground">{t('menu_earnings')}</p>
                                </div>
                                <div className="text-left md:text-center">
                                     <Badge variant={trip.status === 'completed' ? 'default' : 'destructive'}>
                                        {t(trip.status === 'completed' ? 'status_completed' : 'status_cancelled')}
                                    </Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-muted-foreground py-16">
                        <History className="mx-auto h-12 w-12" />
                        <h2 className="text-2xl font-semibold mt-4">{t('history_no_trips')}</h2>
                        <p>{t('history_no_trips_desc')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
