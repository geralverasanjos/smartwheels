
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MapPin, PlusCircle, Trash2, Loader2, Edit } from 'lucide-react';
import { Map } from '@/components/map';
import { Label } from '@/components/ui/label';
import { MarkerF } from '@react-google-maps/api';
import { useAppContext } from '@/contexts/app-context';
import { getStands, saveStand, deleteStand } from '@/services/standsService';
import type { TaxiStand } from '@/types';
import { useGoogleMaps } from '@/hooks/use-google-maps';

const LISBON_CENTER = { lat: 38.736946, lng: -9.142685 };

export default function TaxiStandsPage() {
    const { t } = useAppContext();
    const { toast } = useToast();

    const [stands, setStands] = useState<TaxiStand[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [standData, setStandData] = useState<Partial<TaxiStand> | null>(null);

    const { isLoaded } = useGoogleMaps();
    
    const fetchStands = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getStands();
            setStands(data);
        } catch (error) {
            console.error(error);
            toast({ title: t('error_title'), description: "Failed to load stands.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [t, toast]);

    useEffect(() => {
        fetchStands();
    }, [fetchStands]);

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (isAddingMode && e.latLng) {
            setStandData({ name: '', location: { lat: e.latLng.lat(), lng: e.latLng.lng() } });
            setIsDialogOpen(true);
            setIsAddingMode(false); // Exit adding mode after selecting a point
        }
    }, [isAddingMode]);
    

    const handleOpenAddMode = () => {
        setIsAddingMode(true);
        toast({
            title: t('stands_add_mode_title'),
            description: t('stands_add_mode_desc'),
        });
    }

    const handleOpenEditDialog = (stand: TaxiStand) => {
        setStandData(stand);
        setIsDialogOpen(true);
    }
    
    const handleSaveStand = async () => {
        if (!standData || !standData.name || !standData.location) return;
        setSaving(true);
        try {
            await saveStand(standData as TaxiStand);
            toast({ 
                title: standData.id ? t('toast_stand_updated_title') : t('toast_stand_added_title'), 
                description: standData.id ? t('toast_stand_updated_desc', { standName: standData.name }) : t('toast_stand_added_desc', { standName: standData.name })
            });
            fetchStands();
            setIsDialogOpen(false);
            setStandData(null);
        } catch (error) {
            console.error(error);
            toast({ title: t('error_title'), description: "Failed to save stand.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStand = async (id: string) => {
        const standToDelete = stands.find(s => s.id === id);
        if (standToDelete) {
            try {
                await deleteStand(id);
                toast({
                    title: t('toast_stand_deleted_title'),
                    description: t('toast_stand_deleted_desc', { standName: standToDelete.name }),
                });
                fetchStands();
            } catch (error) {
                 console.error(error);
                 toast({ title: t('error_title'), description: "Failed to delete stand.", variant: "destructive" });
            }
        }
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t('stands_page_title')}</h1>
                <p className="text-muted-foreground">{t('stands_page_subtitle')}</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsDialogOpen(false);
                    setStandData(null);
                    setIsAddingMode(false);
                } else {
                    setIsDialogOpen(true);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{standData?.id ? t('stands_edit_dialog_title') : t('stands_add_dialog_title')}</DialogTitle>
                        <DialogDescription>
                            {standData?.id ? t('stands_edit_dialog_desc') : t('stands_add_dialog_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Label htmlFor="stand-name">{t('stands_dialog_name_label')}</Label>
                        <Input 
                            id="stand-name"
                            placeholder={t('stands_dialog_name_placeholder')}
                            value={standData?.name || ''}
                            onChange={(e) => standData && setStandData({...standData, name: e.target.value})}
                        />
                         <p className="text-xs text-muted-foreground mt-2">{t('stands_dialog_helper_text')}</p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">{t('btn_cancel')}</Button></DialogClose>
                        <Button onClick={handleSaveStand} disabled={!standData?.name || saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('btn_save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="h-[400px] md:h-[500px] w-full">
                 {(loading || !isLoaded) ? (
                    <div className="flex h-full items-center justify-center bg-muted">
                        <Loader2 className="h-16 w-16 animate-spin" />
                    </div>
                 ) : (
                    <Map
                        center={LISBON_CENTER}
                        zoom={12}
                        onMapClick={handleMapClick}
                    >
                    {stands.map(stand => (
                            <MarkerF
                                key={stand.id}
                                position={stand.location}
                                title={stand.name}
                            />
                        ))}
                    </Map>
                 )}
            </Card>

             <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>{t('stands_list_title')}</CardTitle>
                        <CardDescription>{t('stands_list_desc')}</CardDescription>
                    </div>
                     <Button onClick={handleOpenAddMode}><PlusCircle className="h-4 w-4 mr-2"/>{t('btn_add_stand')}</Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : stands.length > 0 ? (
                        <div className="space-y-2">
                            {stands.map(stand => (
                                <div key={stand.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <p className="font-medium">{stand.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(stand)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStand(stand.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">{t('stands_no_stands_yet')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
