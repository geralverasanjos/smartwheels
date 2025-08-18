'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ActionCard from '@/components/action-card';
import { Car, Truck, History, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PassengerDashboard() {
  const { t } = useAppContext();

  return (
    <div className="flex flex-col gap-8">
      <div className="panel-header">
        <h1 className="font-headline title-glow">{t('passenger_panel_welcome_title')}</h1>
        <p>{t('passenger_panel_welcome_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          icon={Car}
          title={t('menu_request_transport')}
          description={t('action_request_transport_desc')}
          buttonText={t('btn_request_now')}
          href="/dashboard/passenger/transport"
        />
        <ActionCard
          icon={Truck}
          title={t('menu_request_delivery')}
          description={t('action_request_delivery_desc')}
          buttonText={t('btn_request_now')}
          href="/dashboard/passenger/delivery"
        />
        <ActionCard
          icon={History}
          title={t('menu_history')}
          description={t('action_view_history_desc')}
          buttonText={t('btn_view_history')}
          href="/dashboard/passenger/history"
        />
      </div>

      <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Wallet className="h-8 w-8 text-primary" />
            <div>
                <CardTitle>{t('menu_wallet_swg')}</CardTitle>
                <CardDescription>{t('quick_access_wallet_desc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">€50.00</p>
             <Button asChild variant="link" className="px-0">
                <Link href="/dashboard/passenger/wallet">
                    {t('btn_view_details')}
                </Link>
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
