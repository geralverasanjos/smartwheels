'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowDown, Banknote } from "lucide-react";
import { useAppContext } from "@/contexts/app-context";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect } from 'react';
import PaymentsPage from "../../payments/page";

const data = [
  { day: 'Seg', earnings: 1200 },
  { day: 'Ter', earnings: 1500 },
  { day: 'Qua', earnings: 1800 },
  { day: 'Qui', earnings: 1300 },
  { day: 'Sex', earnings: 2500 },
  { day: 'Sáb', earnings: 3000 },
  { day: 'Dom', earnings: 2200 },
];

export default function FleetEarningsPage() {
    const { t } = useAppContext();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

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
            <div className="text-2xl font-bold">€1180,50</div>
            <p className="text-xs text-muted-foreground">{t('earnings_today_desc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('earnings_week')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€11.300,00</div>
             <p className="text-xs text-muted-foreground">{t('earnings_week_desc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('earnings_available')}</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€8500,00</div>
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
            {isClient && (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="earnings" fill="hsl(var(--primary))" name={t('earnings_week')} />
                    </BarChart>
                </ResponsiveContainer>
            )}
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
