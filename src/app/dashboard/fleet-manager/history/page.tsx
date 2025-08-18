'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Car, Truck } from 'lucide-react';
import { useCurrency } from '@/lib/currency';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const fleetHistory = [
  { id: 't-001', driver: { name: 'Carlos Silva', avatar: 'https://placehold.co/40x40.png?text=CS' }, type: 'trip', date: '2024-05-20', earnings: 12.50, status: 'completed' },
  { id: 'd-002', driver: { name: 'Mariana Costa', avatar: 'https://placehold.co/40x40.png?text=MC' }, type: 'delivery', date: '2024-05-20', earnings: 6.80, status: 'completed' },
  { id: 't-003', driver: { name: 'Carlos Silva', avatar: 'https://placehold.co/40x40.png?text=CS' }, type: 'trip', date: '2024-05-19', earnings: 0.00, status: 'cancelled' },
  { id: 't-004', driver: { name: 'Jorge Ferraz', avatar: 'https://placehold.co/40x40.png?text=JF' }, type: 'trip', date: '2024-05-18', earnings: 22.00, status: 'completed' },
];

export default function FleetHistoryPage() {
    const { t } = useAppContext();
    const { formatCurrency, formatDate } = useCurrency();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> {t('menu_history')}</CardTitle>
                <CardDescription>{t('history_page_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
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
                        {fleetHistory.map((trip) => (
                            <TableRow key={trip.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={trip.driver.avatar} data-ai-hint="person face" />
                                            <AvatarFallback>{trip.driver.name.substring(0,2)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{trip.driver.name}</span>
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
                                <TableCell className="text-right font-semibold text-primary">{formatCurrency(trip.earnings)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
