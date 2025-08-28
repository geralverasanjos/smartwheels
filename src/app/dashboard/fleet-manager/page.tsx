'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StatCard from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Car, Users, Wallet, Star, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getDriversByFleetManager } from '@/services/profileService';
import { getFleetTripHistory } from '@/services/historyService';
import type { UserProfile, Trip } from '@/types';
import { useCurrency } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';

export default function FleetManagerDashboard() {
    const { t, user } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [drivers, setDrivers] = useState<UserProfile[]>([]);
    const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [driversData, tripsData] = await Promise.all([
                getDriversByFleetManager(user.id),
                getFleetTripHistory(user.id)
            ]);
            setDrivers(driversData);
            setRecentTrips(tripsData.slice(0, 5)); // Get last 5 trips
        } catch (error) {
            console.error("Failed to fetch fleet data:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const calculateStats = () => {
        const totalEarningsMonth = recentTrips.reduce((acc, trip) => acc + (trip.earnings || trip.value || 0), 0);
        const totalRatings = drivers.reduce((acc, driver) => acc + (driver.rating || 0), 0);
        const avgRating = drivers.length > 0 ? totalRatings / drivers.length : 0;
        
        // Simulating status for chart - in a real app, this would come from live location data
        const onlineCount = drivers.filter(d => d.status === 'online').length || Math.floor(drivers.length / 2);
        const inTripCount = drivers.filter(d => d.status === 'in_trip').length || Math.floor(drivers.length / 4);
        const offlineCount = drivers.length - onlineCount - inTripCount;
        
        return {
            activeDrivers: drivers.length,
            totalVehicles: drivers.length, // Assuming 1 vehicle per driver for now
            totalEarningsMonth,
            avgRating,
            driverStatusData: [
                { name: t('status_online'), value: onlineCount, fill: 'hsl(var(--primary))' },
                { name: t('status_in_trip'), value: inTripCount, fill: 'hsl(var(--accent))' },
                { name: t('status_offline'), value: offlineCount, fill: 'hsl(var(--secondary))' },
            ]
        };
    };

    const stats = calculateStats();

    const renderStatCards = () => {
        if (loading) {
            return (
                <>
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </>
            );
        }
        return (
            <>
                <StatCard icon={Users} title={stats.activeDrivers.toString()} subtitle={t('fleet_stat_active_drivers')} />
                <StatCard icon={Car} title={stats.totalVehicles.toString()} subtitle={t('fleet_stat_total_vehicles')} />
                <StatCard icon={Wallet} title={formatCurrency(stats.totalEarningsMonth)} subtitle={t('fleet_stat_monthly_earnings')} />
                <StatCard icon={Star} title={stats.avgRating.toFixed(1)} subtitle={t('fleet_stat_avg_rating')} />
            </>
        )
    }

    const renderRecentTrips = () => {
        if (loading) {
            return Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
            ));
        }

        if (recentTrips.length === 0) {
            return <TableRow><TableCell colSpan={4} className="text-center">{t('history_no_trips')}</TableCell></TableRow>;
        }

        return recentTrips.map((trip) => (
            <TableRow key={trip.id}>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarImage src={trip.driver?.avatarUrl} /><AvatarFallback>{trip.driver?.name?.substring(0,2)}</AvatarFallback></Avatar>
                        <span className="font-medium">{trip.driver?.name || 'N/A'}</span>
                    </div>
                </TableCell>
                <TableCell>{t(trip.type === 'trip' ? 'trip_type_trip' : 'trip_type_delivery')}</TableCell>
                <TableCell><Badge variant={trip.status === 'completed' ? 'default' : 'destructive'}>{t(trip.status === 'completed' ? 'status_completed' : 'status_cancelled')}</Badge></TableCell>
                <TableCell className="text-right font-semibold text-primary">{formatCurrency(trip.earnings || 0)}</TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline title-glow">{t('fleet_dashboard_title')}</h1>
                    <p>{t('fleet_dashboard_subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild><Link href="/dashboard/fleet-manager/drivers">{t('btn_add_driver')}</Link></Button>
                    <Button asChild><Link href="/dashboard/fleet-manager/vehicles/add">{t('btn_add_vehicle')}</Link></Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderStatCards()}
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
                                {renderRecentTrips()}
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
                         {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.driverStatusData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'hsla(var(--accent), 0.1)' }} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}/>
                                    <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                        {stats.driverStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
