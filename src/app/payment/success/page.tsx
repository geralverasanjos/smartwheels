
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { updateVehicleStatus } from '@/services/vehicleService'; // You will need to create this service function

export default function PaymentSuccessPage() {
    const { t, user } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const vehicleId = searchParams.get('vehicleId');

    useEffect(() => {
        if (vehicleId) {
            // This is where you would update the vehicle's status in your database
            // from 'pending_payment' to 'pending_approval' or 'active'.
            console.log(`Payment successful for vehicleId: ${vehicleId}. Updating status...`);
            // Example of a service function you would call:
            // updateVehicleStatus(vehicleId, 'pending_approval');
        }
    }, [vehicleId]);

    const handleGoToVehicles = () => {
        const role = user?.role || 'driver'; // Default to driver, adjust if needed
        router.push(`/dashboard/${role}/vehicles`);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-headline">{t('payment_success_title')}</CardTitle>
                    <CardDescription>{t('payment_success_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {t('payment_success_processing', { vehicleId: vehicleId || '...' })}
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGoToVehicles} className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('btn_back_to_vehicles')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
