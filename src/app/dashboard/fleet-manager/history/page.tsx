'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Car, Truck, Loader2 } from 'lucide-react';
import { useCurrency } from '@/lib/currency';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getFleetTripHistory } from '@/services/historyService';
import type { Trip } from '@/types';

export default function FleetHistoryPage() {
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
                // Assuming the fleet manager's ID is the user's ID
                const historyData = await getFleetTripHistory(user.id);
                setTrips(historyData);
            } catch (error) {
                console.error("Failed to fetch fleet trip history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> {t('menu_history')}</CardTitle>
                <CardDescription>{t('history_page_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                 {trips.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('history_driver')}</TableHead>
                                <TableHead>{t('history_trip_type')}</TableHead>
                                <TableHead>{t('history_date')}</TableHead>
                                <TableHead>{t('history_status')}</TableHead>
                                <TableHead className="text-right">{t('menu_earnings')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trips.map((trip) => (
                                <TableRow key={trip.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={trip.driver?.avatarUrl} data-ai-hint="person face" />
                                                <AvatarFallback>{trip.driver?.name?.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{trip.driver?.name || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {trip.type === 'trip' ? <Car className="h-4 w-4 text-muted-foreground" /> : <Truck className="h-4 w-4 text-muted-foreground" />}
                                            {t(trip.type === 'trip' ? 'trip_type_trip' : 'trip_type_delivery')}
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatDate(trip.date)}</TableCell>
                                    <TableCell>
                                        <Badge variant={trip.status === 'completed' ? 'default' : 'destructive'}>
                                            {t(trip.status === 'completed' ? 'status_completed' : 'status_cancelled')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-primary">{formatCurrency(trip.earnings || 0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
