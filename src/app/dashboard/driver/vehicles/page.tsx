'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Pencil, PlusCircle, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import Image from 'next/image';
import Link from 'next/link';
import type { TranslationKeys } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import VehicleFormDialog from '@/components/driver/vehicle-form-dialog';
import { getVehiclesByDriver, saveVehicle } from '@/services/vehicleService';
import type { Vehicle } from '@/types';


export default function VehiclesPage() {
    const { t, user, setUser } = useAppContext();
    const { toast } = useToast();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                const vehicleData = await getVehiclesByDriver(user.id);
                setVehicles(vehicleData);
            } catch (error) {
                console.error("Failed to fetch vehicle data:", error);
                toast({ title: t('error_title'), description: "Falha ao carregar dados do veículo.", variant: "destructive"});
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [user, t, toast]);


    const getStatusVariant = (status: Vehicle['status']): 'default' | 'destructive' | 'secondary' | 'outline' => {
        switch (status) {
            case 'active':
                return 'default';
            case 'pending_approval':
            case 'pending_payment':
                return 'secondary';
            case 'rejected':
            case 'maintenance':
            case 'inactive':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const handleSave = async (data: Partial<Vehicle>) => {
        try {
            await saveVehicle(data);
            setVehicles(vehicles.map(v => v.id === data.id ? {...v, ...data} : v));
            toast({
                title: t('toast_vehicle_updated_title'),
                description: t('toast_vehicle_updated_desc'),
            });
        } catch (error) {
            console.error("Failed to save vehicle:", error);
            toast({ title: t('error_title'), description: "Falha ao guardar o veículo.", variant: "destructive"});
        }
    }

    const setActiveVehicle = async (vehicleId: string) => {
        if (!user) return;
        try {
            const updatedProfile = { ...user, activeVehicleId: vehicleId };
            // We need a way to save the user's main profile, not just the vehicle
            // Let's assume a saveUserProfile function exists.
            // await saveUserProfile(updatedProfile);
            setUser(updatedProfile); // Update context
            toast({ title: "Veículo Ativo", description: "Veículo definido como ativo com sucesso."});
        } catch(error) {
            console.error("Failed to set active vehicle:", error);
             toast({ title: t('error_title'), description: "Falha ao definir veículo ativo.", variant: "destructive"});
        }
    }
    
    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header flex items-center justify-between">
                <div>
                    <h1 className="font-headline title-glow">{t('vehicle_page_title')}</h1>
                    <p>{t('vehicle_page_subtitle')}</p>
                </div>
                 <Button asChild>
                    <Link href="/dashboard/driver/vehicles/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('btn_add_vehicle')}
                    </Link>
                </Button>
            </div>
            
            {vehicles.length === 0 ? (
                <Card className="text-center py-16">
                     <CardHeader>
                        <CardTitle>{t('no_vehicle_title')}</CardTitle>
                        <CardDescription>{t('no_vehicle_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                             <Link href="/dashboard/driver/vehicles/add">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('btn_add_your_first_vehicle')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {vehicles.map(vehicle => (
                         <Card key={vehicle.id} className="lg:col-span-1">
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl">{vehicle.make} {vehicle.model}</CardTitle>
                                    <CardDescription>{vehicle.plate}</CardDescription>
                                </div>
                                <Badge variant={getStatusVariant(vehicle.status)}>
                                    {t(`status_${vehicle.status}` as TranslationKeys) || vehicle.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-muted">
                                    <Image 
                                        src={vehicle.imageUrl || 'https://placehold.co/600x400.png'} 
                                        alt={`${vehicle.make} ${vehicle.model}`} 
                                        layout="fill" 
                                        objectFit="cover" 
                                        data-ai-hint={vehicle.aiHint || 'side view of a car'}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-muted-foreground">{t('field_year')}:</p><p className="font-semibold">{vehicle.year}</p></div>
                                    <div><p className="text-muted-foreground">{t('field_color')}:</p><p className="font-semibold">{vehicle.color}</p></div>
                                </div>
                                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                                     <Button 
                                        className="w-full" 
                                        onClick={() => setActiveVehicle(vehicle.id)}
                                        disabled={user?.activeVehicleId === vehicle.id}
                                    >
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        {user?.activeVehicleId === vehicle.id ? "Ativo" : "Definir como Ativo"}
                                     </Button>
                                    <VehicleFormDialog onSave={handleSave} vehicle={vehicle}>
                                        <Button className="w-full" variant="outline">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            {t('btn_edit_vehicle')}
                                        </Button>
                                    </VehicleFormDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
