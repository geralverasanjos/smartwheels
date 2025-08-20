'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowDown, Banknote, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/app-context";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect } from 'react';
import PaymentsPage from "../../payments/page";
import { getFleetTripHistory } from "@/services/historyService";
import type { Trip } from "@/types";
import { useCurrency } from "@/lib/currency";

export default function FleetEarningsPage() {
    const { t, user } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState({
        today: 0,
        week: 0,
        available: 0,
        weeklyPerformance: [] as { day: string, earnings: number }[],
    });

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            };
            setLoading(true);
            try {
                const trips = await getFleetTripHistory(user.id);
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                startOfWeek.setHours(0, 0, 0, 0);

                let todayEarnings = 0;
                let weekEarnings = 0;
                
                const dayNames = [t('day_sun'), t('day_mon'), t('day_tue'), t('day_wed'), t('day_thu'), t('day_fri'), t('day_sat')];
                const weeklyPerformanceMap = new Map<string, number>();
                dayNames.forEach(day => weeklyPerformanceMap.set(day, 0));

                trips.forEach(trip => {
                    if (trip.status === 'completed') {
                        const tripDate = new Date(trip.date);
                        const tripValue = trip.earnings || 0;

                        if (tripDate.toDateString() === today.toDateString()) {
                            todayEarnings += tripValue;
                        }

                        if (tripDate >= startOfWeek) {
                            weekEarnings += tripValue;
                            const dayName = dayNames[tripDate.getDay()];
                            weeklyPerformanceMap.set(dayName, (weeklyPerformanceMap.get(dayName) || 0) + tripValue);
                        }
                    }
                });
                
                const weeklyPerformance = Array.from(weeklyPerformanceMap.entries()).map(([day, earnings]) => ({ day, earnings }));
                
                setEarningsData({
                    today: todayEarnings,
                    week: weekEarnings,
                    available: weekEarnings * 0.8, // Assuming 80% available for withdrawal
                    weeklyPerformance,
                });

            } catch (error) {
                console.error("Failed to fetch fleet earnings data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, [user, t]);

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">{t('earnings_page_title_fleet')}</h1>
        <p className="text-muted-foreground">{t('earnings_page_subtitle_fleet')}</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('earnings_today')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.today)}</div>
            <p className="text-xs text-muted-foreground">{t('earnings_today_desc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('earnings_week')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.week)}</div>
             <p className="text-xs text-muted-foreground">{t('earnings_week_desc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('earnings_available')}</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.available)}</div>
            <p className="text-xs text-muted-foreground">{t('earnings_available_desc')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('earnings_weekly_performance')}</CardTitle>
            <CardDescription>{t('earnings_weekly_performance_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={earningsData.weeklyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => formatCurrency(Number(value))}/>
                    <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                    <Legend />
                    <Bar dataKey="earnings" fill="hsl(var(--primary))" name={t('earnings_week')} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <PaymentsPage />
      
      <div className="flex justify-end">
        <Button size="lg">
            <ArrowDown className="mr-2 h-4 w-4" /> {t('btn_withdraw_funds')}
        </Button>
      </div>
    </div>
  );
}
