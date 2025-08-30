
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart2, DollarSign, Milestone, TrendingUp, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/app-context";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatCard from "@/components/ui/stat-card";
import { useCurrency } from "@/lib/currency";
import React, { useState, useEffect } from 'react';
import { getFleetTripHistory } from "@/services/historyService";
import type { Trip, UserProfile } from "@/types";
import { getDriversByFleetManager } from "@/services/profileService";

export default function FleetReportsPage() {
    const { t, user } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [drivers, setDrivers] = useState<UserProfile[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const fetchData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                const [tripsData, driversData] = await Promise.all([
                    getFleetTripHistory(user.id),
                    getDriversByFleetManager(user.id)
                ]);
                setTrips(tripsData);
                setDrivers(driversData);
            } catch (error) {
                console.error("Failed to fetch fleet reports data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const reportSummaryData = trips.reduce((acc, trip) => {
        const month = new Date(trip.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[month]) {
            acc[month] = { month, trips: 0, revenue: 0, count: 0, totalRating: 0 };
        }
        acc[month].trips += 1;
        acc[month].revenue += trip.earnings || 0;
        if(trip.driver?.rating) {
             acc[month].totalRating += trip.driver.rating;
             acc[month].count += 1;
        }
        return acc;
    }, {} as Record<string, { month: string, trips: number, revenue: number, count: number, totalRating: number }>);
    
    const monthlyEarningsData = Object.values(reportSummaryData).map(data => ({
        month: data.month,
        earnings: data.revenue
    }));
    
    const overallStats = trips.reduce((acc, trip) => {
        acc.totalTrips += 1;
        acc.totalRevenue += trip.earnings || 0;
        acc.totalDistance += trip.distance || 0;
        return acc;
    }, { totalTrips: 0, totalRevenue: 0, totalDistance: 0 });

    const avgRating = drivers.reduce((sum, driver) => sum + (driver.rating || 0), 0) / (drivers.length || 1);


    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>
    }

  return (
    <div className="space-y-8">
       <div className="panel-header flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t('reports_page_title')}</h1>
                <p className="text-muted-foreground">{t('reports_page_subtitle')}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><Download className="mr-2"/> {t('btn_export_csv')}</Button>
                <Button><Download className="mr-2"/> {t('btn_export_pdf')}</Button>
            </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={TrendingUp} title={overallStats.totalTrips.toString()} subtitle={t('reports_total_trips')} />
            <StatCard icon={DollarSign} title={formatCurrency(overallStats.totalRevenue)} subtitle={t('reports_total_revenue')} />
            <StatCard icon={Milestone} title={`${(overallStats.totalDistance / (overallStats.totalTrips || 1)).toFixed(1)} Km`} subtitle={t('reports_avg_trip_distance')} />
            <StatCard icon={BarChart2} title={avgRating.toFixed(2)} subtitle={t('reports_avg_rating')} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('reports_monthly_earnings_title')}</CardTitle>
            <CardDescription>{t('reports_monthly_earnings_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
            {isClient && (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyEarningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value) as number)}/>
                        <Legend />
                        <Bar dataKey="earnings" fill="hsl(var(--primary))" name={t('menu_earnings')} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>{t('reports_summary_title')}</CardTitle>
            <CardDescription>{t('reports_summary_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('reports_table_month')}</TableHead>
                        <TableHead className="text-center">{t('reports_table_trips')}</TableHead>
                        <TableHead className="text-center">{t('reports_table_revenue')}</TableHead>
                        <TableHead className="text-center">{t('reports_table_avg_rating')}</TableHead>
                        <TableHead className="text-right">{t('table_header_actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.values(reportSummaryData).length > 0 ? (
                        Object.values(reportSummaryData).map((row) => (
                            <TableRow key={row.month}>
                                <TableCell className="font-medium">{row.month}</TableCell>
                                <TableCell className="text-center">{row.trips}</TableCell>
                                <TableCell className="text-center">{formatCurrency(row.revenue)}</TableCell>
                                <TableCell className="text-center">{(row.totalRating / (row.count || 1)).toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-3 w-3" />
                                        {t('btn_download')}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">{t('history_no_trips')}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
