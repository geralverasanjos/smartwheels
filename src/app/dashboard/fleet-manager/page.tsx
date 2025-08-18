'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StatCard from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Car, Users, Wallet, Star } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import React from 'react';
import Link from 'next/link';

const fleetSummary = {
    activeDrivers: 15,
    totalVehicles: 18,
    totalEarningsMonth: 12530.50,
    avgRating: 4.8,
};

const recentTrips = [
    { id: 't-001', driver: { name: 'Carlos Silva', avatarUrl: 'https://placehold.co/40x40/32CD32/FFFFFF?text=CS' }, typeKey: 'trip_type_trip', statusKey: 'status_completed', earnings: 12.50 },
    { id: 'd-002', driver: { name: 'Mariana Costa', avatarUrl: 'https://placehold.co/40x40/32CD32/FFFFFF?text=MC' }, typeKey: 'trip_type_delivery', statusKey: 'status_completed', earnings: 6.80 },
    { id: 't-003', driver: { name: 'Carlos Silva', avatarUrl: 'https://placehold.co/40x40/32CD32/FFFFFF?text=CS' }, typeKey: 'trip_type_trip', statusKey: 'status_cancelled', earnings: 0.00 },
];

export default function FleetManagerDashboard() {
    const { t, language } = useAppContext();

    const driverStatusData = [
        { name: t('status_online'), value: 10, fill: 'hsl(var(--primary))' },
        { name: t('status_in_trip'), value: 5, fill: 'hsl(var(--accent))' },
        { name: t('status_offline'), value: 3, fill: 'hsl(var(--secondary))' },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline title-glow">{t('fleet_dashboard_title')}</h1>
                    <p>{t('fleet_dashboard_subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild><Link href="/dashboard/fleet-manager/drivers">{t('btn_add_driver')}</Link></Button>
                    <Button asChild><Link href="/dashboard/fleet-manager/vehicles">{t('btn_add_vehicle')}</Link></Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} title={fleetSummary.activeDrivers.toString()} subtitle={t('fleet_stat_active_drivers')} />
                <StatCard icon={Car} title={fleetSummary.totalVehicles.toString()} subtitle={t('fleet_stat_total_vehicles')} />
                <StatCard icon={Wallet} title={`${language.currency.symbol}${fleetSummary.totalEarningsMonth.toFixed(2)}`} subtitle={t('fleet_stat_monthly_earnings')} />
                <StatCard icon={Star} title={fleetSummary.avgRating.toFixed(1)} subtitle={t('fleet_stat_avg_rating')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('fleet_dashboard_recent_activity')}</CardTitle>
                        <CardDescription>{t('fleet_dashboard_recent_activity_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table_header_driver')}</TableHead>
                                    <TableHead>{t('table_header_type')}</TableHead>
                                    <TableHead>{t('table_header_status')}</TableHead>
                                    <TableHead className="text-right">{t('table_header_earnings')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTrips.map((trip) => (
                                    <TableRow key={trip.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8"><AvatarImage src={trip.driver.avatarUrl} /><AvatarFallback>{trip.driver.name.substring(0,2)}</AvatarFallback></Avatar>
                                                <span className="font-medium">{trip.driver.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{t(trip.typeKey as any)}</TableCell>
                                        <TableCell><Badge variant={trip.statusKey === 'status_completed' ? 'default' : 'destructive'}>{t(trip.statusKey as any)}</Badge></TableCell>
                                        <TableCell className="text-right font-semibold text-primary">{language.currency.symbol}{trip.earnings.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{t('fleet_dashboard_driver_status')}</CardTitle>
                        <CardDescription>{t('fleet_dashboard_driver_status_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={driverStatusData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'hsla(var(--accent), 0.1)' }} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}/>
                                <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                     {driverStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
