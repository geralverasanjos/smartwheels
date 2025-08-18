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
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { MarkerF } from '@react-google-maps/api';
import { useAppContext } from '@/contexts/app-context';


const LISBON_CENTER = { lat: 38.736946, lng: -9.142685 };

type TaxiStand = {
    id: string;
    name: string;
    location: { lat: number; lng: number };
};

const mockStands: TaxiStand[] = [
    { id: 'stand_1', name: 'Aeroporto - Chegadas', location: { lat: 38.768, lng: -9.128 } },
    { id: 'stand_2', name: 'Estação do Oriente', location: { lat: 38.767, lng: -9.099 } },
    { id: 'stand_3', name: 'Praça do Comércio', location: { lat: 38.707, lng: -9.136 } },
];


export default function TaxiStandsPage() {
    const { t } = useAppContext();
    const { toast } = useToast();
    const { isLoaded, loadError } = useGoogleMaps();

    const [stands, setStands] = useState<TaxiStand[]>([]);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [standData, setStandData] = useState<{id: string | null, name: string, location: {lat: number, lng: number}} | null>(null);
    
    useEffect(() => {
        if (isLoaded) {
            setStands(mockStands);
        }
    }, [isLoaded]);

    const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setStandData({ id: null, name: '', location: { lat: e.latLng.lat(), lng: e.latLng.lng() } });
            setIsDialogOpen(true);
        }
    }, []);

    const handleOpenAddDialog = () => {
        if (map) {
            const center = map.getCenter();
            if (center) {
                setStandData({ id: null, name: '', location: { lat: center.lat(), lng: center.lng() } });
                setIsDialogOpen(true);
            }
        }
    }

    const handleOpenEditDialog = (stand: TaxiStand) => {
        setStandData(stand);
        setIsDialogOpen(true);
    }
    
    const handleSaveStand = () => {
        if (!standData || !standData.name) return;
        
        if (standData.id) { // Editing
             setStands(prev => prev.map(s => s.id === standData.id ? { ...s, name: standData.name, location: standData.location } : s));
             toast({ title: t('toast_stand_updated_title'), description: t('toast_stand_updated_desc', { standName: standData.name })});
        } else { // Adding
            const newStand: TaxiStand = {
                id: `stand_${Date.now()}`,
                name: standData.name,
                location: standData.location,
            };
            setStands(prev => [...prev, newStand]);
            toast({ title: t('toast_stand_added_title'), description: t('toast_stand_added_desc', { standName: standData.name }) });
        }

        setIsDialogOpen(false);
        setStandData(null);
    };

    const handleDeleteStand = (id: string) => {
        const standToDelete = stands.find(s => s.id === id);
        if (standToDelete) {
             setStands(prev => prev.filter(stand => stand.id !== id));
             toast({
                title: t('toast_stand_deleted_title'),
                description: t('toast_stand_deleted_desc', { standName: standToDelete.name }),
             });
        }
    }
    
    if (loadError) return <div>{t('map_load_error')}</div>;

    const getNewStandMarkerIcon = () => {
        if (typeof window !== 'undefined' && window.google) {
            return {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "hsl(var(--primary))",
                fillOpacity: 0.8,
                strokeColor: "white",
                strokeWeight: 2,
            };
        }
        return undefined;
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
                        <Button onClick={handleSaveStand} disabled={!standData?.name}>{t('btn_save')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="h-[400px] md:h-[500px] w-full">
                 {!isLoaded ? (
                    <div className="flex h-full items-center justify-center bg-muted">
                        <Loader2 className="h-16 w-16 animate-spin" />
                    </div>
                 ) : (
                    <Map
                        center={LISBON_CENTER}
                        zoom={12}
                        onMapLoad={onMapLoad}
                        onMapClick={handleMapClick}
                    >
                       {stands.map(stand => (
                            <MarkerF
                                key={stand.id}
                                position={stand.location}
                                title={stand.name}
                            />
                        ))}
                        {isDialogOpen && standData && (
                            <MarkerF
                                position={standData.location}
                                draggable={true}
                                onDragEnd={(e) => e.latLng && setStandData({...standData, location: { lat: e.latLng.lat(), lng: e.latLng.lng() }})}
                                icon={getNewStandMarkerIcon()}
                            />
                        )}
                    </Map>
                 )}
            </Card>

             <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>{t('stands_list_title')}</CardTitle>
                        <CardDescription>{t('stands_list_desc')}</CardDescription>
                    </div>
                     <Button onClick={handleOpenAddDialog}><PlusCircle className="h-4 w-4 mr-2"/>{t('btn_add_stand')}</Button>
                </CardHeader>
                <CardContent>
                    {!isLoaded ? (
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
