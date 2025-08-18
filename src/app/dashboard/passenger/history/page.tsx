
'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, Car, Truck, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/currency';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const pastTrips = [
    { id: '1', type: 'trip', driver: { name: 'Carlos Silva', avatar: 'https://placehold.co/40x40.png?text=CS' }, date: '2024-05-20', value: 12.50, status: 'completed' },
    { id: '2', type: 'delivery', driver: { name: 'Mariana Costa', avatar: 'https://placehold.co/40x40.png?text=MC' }, date: '2024-05-18', value: 8.00, status: 'completed' },
    { id: '3', type: 'trip', driver: { name: 'João Almeida', avatar: 'https://placehold.co/40x40.png?text=JA' }, date: '2024-05-15', value: 15.00, status: 'cancelled' },
];

export default function PassengerHistoryPage() {
    const { t } = useAppContext();
    const { formatCurrency, formatDate } = useCurrency();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> {t('menu_history')}</CardTitle>
                <CardDescription>{t('history_page_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                {pastTrips.length > 0 ? (
                    <div className="space-y-4">
                        {pastTrips.map(trip => (
                            <Card key={trip.id} className="flex flex-col md:flex-row items-center gap-4 p-4">
                                <div className="flex items-center gap-4 flex-1">
                                    {trip.type === 'trip' ? <Car className="h-8 w-8 text-primary" /> : <Truck className="h-8 w-8 text-primary" />}
                                    <Avatar>
                                        <AvatarImage src={trip.driver.avatar} data-ai-hint="person face" />
                                        <AvatarFallback>{trip.driver.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold">{t(trip.type === 'trip' ? 'trip_type_trip' : 'trip_type_delivery')} com {trip.driver.name}</p>
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
                        <h2 className="text-2xl font-semibold mt-4">{t('history_no_trips')}</h2>
                        <p>{t('history_no_trips_desc')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
