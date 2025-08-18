'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart2, DollarSign, Milestone, TrendingUp } from "lucide-react";
import { useAppContext } from "@/contexts/app-context";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatCard from "@/components/ui/stat-card";
import { useCurrency } from "@/lib/currency";
import React, { useState, useEffect } from 'react';

const monthlyEarningsData = [
  { month: 'Jan', earnings: 11500 },
  { month: 'Fev', earnings: 13200 },
  { month: 'Mar', earnings: 15800 },
  { month: 'Abr', earnings: 14100 },
  { month: 'Mai', earnings: 17200 },
  { month: 'Jun', earnings: 16500 },
];

const reportSummaryData = [
    { month: 'Junho 2024', trips: 850, revenue: 16500, avgRating: 4.85 },
    { month: 'Maio 2024', trips: 890, revenue: 17200, avgRating: 4.82 },
    { month: 'Abril 2024', trips: 720, revenue: 14100, avgRating: 4.79 },
    { month: 'Março 2024', trips: 810, revenue: 15800, avgRating: 4.88 },
];

export default function FleetReportsPage() {
    const { t } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

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
            <StatCard icon={TrendingUp} title="3270" subtitle={t('reports_total_trips')} />
            <StatCard icon={DollarSign} title={formatCurrency(63600)} subtitle={t('reports_total_revenue')} />
            <StatCard icon={Milestone} title="12.5 Km" subtitle={t('reports_avg_trip_distance')} />
            <StatCard icon={BarChart2} title="4.83" subtitle={t('reports_avg_rating')} />
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
                        <Tooltip formatter={(value) => formatCurrency(Number(value))}/>
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
                    {reportSummaryData.map((row) => (
                        <TableRow key={row.month}>
                            <TableCell className="font-medium">{row.month}</TableCell>
                            <TableCell className="text-center">{row.trips}</TableCell>
                            <TableCell className="text-center">{formatCurrency(row.revenue)}</TableCell>
                            <TableCell className="text-center">{row.avgRating.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-3 w-3" />
                                    {t('btn_download')}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
