
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';

export default function PaymentCancelPage() {
    const { t, user } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const vehicleId = searchParams.get('vehicleId');

    const handleGoToAddVehicle = () => {
        const role = user?.role || 'driver'; // Default to driver, adjust if needed
        router.push(`/dashboard/${role}/vehicles/add`);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <XCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-headline">{t('payment_cancelled_title')}</CardTitle>
                    <CardDescription>{t('payment_cancelled_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {t('payment_cancelled_info', { vehicleId: vehicleId || '...' })}
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGoToAddVehicle} className="w-full" variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('btn_back_to_add_vehicle')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
