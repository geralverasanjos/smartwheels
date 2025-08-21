'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Pencil, PlusCircle, Loader2 } from 'lucide-react';
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
import { getVehicleById } from '@/services/vehicleService';
import type { Vehicle } from '@/types';


export default function VehiclesPage() {
    const { t, user } = useAppContext();
    const { toast } = useToast();
    const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicle = async () => {
            // This logic needs to be adapted for fleet managers.
            // A fleet manager might have many vehicles, so we'd probably list them.
            // For now, this mimics the driver's view, fetching a single vehicle if an ID is present.
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                // In a real fleet manager scenario, you'd fetch a list of vehicles.
                // For this example, we'll try to fetch one if an activeVehicleId is on the user profile,
                // which might not be the case for a fleet manager.
                if (user.activeVehicleId) {
                     const vehicle = await getVehicleById(user.activeVehicleId);
                     setVehicleData(vehicle);
                }
            } catch (error) {
                console.error("Failed to fetch vehicle data:", error);
                toast({ title: t('error_title'), description: "Falha ao carregar dados do veículo.", variant: "destructive"});
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [user, t, toast]);


    const getStatusVariant = (status: string): 'default' | 'destructive' | 'secondary' => {
        switch (status) {
            case 'status_approved':
            case 'active':
                return 'default';
            case 'status_pending':
            case 'pending':
                return 'secondary';
            case 'status_rejected':
            case 'rejected':
            case 'maintenance':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const handleSave = (data: any) => {
        // Here you would typically send the data to your API to update the vehicle
        console.log("Saving vehicle data:", data);
        toast({
            title: t('toast_vehicle_updated_title'),
            description: t('toast_vehicle_updated_desc'),
        });
        setVehicleData(prev => prev ? { ...prev, ...data } : data);
    }

    const handleUploadDocument = () => {
         toast({
            title: t('toast_doc_uploaded_title'),
            description: t('toast_doc_uploaded_desc'),
        });
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
                    <Link href="/dashboard/fleet-manager/vehicles/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('btn_add_vehicle')}
                    </Link>
                </Button>
            </div>
            
            {!vehicleData ? (
                <Card className="text-center py-16">
                     <CardHeader>
                        <CardTitle>{t('no_vehicle_title')}</CardTitle>
                        <CardDescription>{t('no_vehicle_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                             <Link href="/dashboard/fleet-manager/vehicles/add">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('btn_add_your_first_vehicle')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Coluna do Veículo */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{vehicleData.make} {vehicleData.model}</CardTitle>
                                <CardDescription>{vehicleData.plate}</CardDescription>
                            </div>
                            <Badge variant={getStatusVariant(vehicleData.status)}>
                                {t(`status_${vehicleData.status}` as TranslationKeys)}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4 bg-muted">
                                <Image 
                                    src={vehicleData.imageUrl || 'https://placehold.co/600x400.png'} 
                                    alt={`${vehicleData.make} ${vehicleData.model}`} 
                                    layout="fill" 
                                    objectFit="cover" 
                                    data-ai-hint={vehicleData.aiHint || 'side view of a car'}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-muted-foreground">{t('field_year')}:</p><p className="font-semibold">{vehicleData.year}</p></div>
                                <div><p className="text-muted-foreground">{t('field_color')}:</p><p className="font-semibold">{vehicleData.color}</p></div>
                            </div>
                            <VehicleFormDialog onSave={handleSave} vehicle={vehicleData}>
                                 <Button className="w-full mt-6">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t('btn_edit_vehicle')}
                                 </Button>
                            </VehicleFormDialog>
                        </CardContent>
                    </Card>

                    {/* Coluna dos Documentos */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>{t('vehicle_docs_title')}</CardTitle>
                            <CardDescription>{t('vehicle_docs_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {/*  TODO: Replace with real document data */}
                             <Dialog>
                                <DialogTrigger asChild>
                                     <Button variant="outline" className="w-full">
                                        <Upload className="mr-2 h-4 w-4" />
                                        {t('btn_upload_document')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('btn_upload_document')}</DialogTitle>
                                        <DialogDescription>{t('upload_new_doc_desc')}</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="doc-type">{t('doc_type_label')}</Label>
                                            <Input id="doc-type" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="doc-file">{t('doc_file_label')}</Label>
                                            <Input id="doc-file" type="file" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="ghost">{t('cancel_button')}</Button></DialogClose>
                                        <DialogClose asChild><Button onClick={handleUploadDocument}>{t('btn_send')}</Button></DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
