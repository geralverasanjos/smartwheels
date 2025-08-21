'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MarkerF } from '@react-google-maps/api';
import { Map } from '@/components/map';
import VehicleList from '@/components/fleet/vehicle-list';
import VehicleEditModal from '@/components/fleet/vehicle-edit-modal';
import { Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { useAppContext } from '@/contexts/app-context';
import { getDriversByFleetManager } from '@/services/profileService';
import type { UserProfile } from '@/types';

const LISBON_CENTER = { lat: 38.736946, lng: -9.142685 };

const getVehicleIcon = (status: string, isSelected: boolean) => {
    if (typeof window === 'undefined' || !window.google) return null;

    let fillColor = 'hsl(var(--primary))';
    switch (status) {
        case 'em_viagem': fillColor = 'hsl(var(--secondary-foreground))'; break;
        case 'em_manutencao': fillColor = '#f59e0b'; break;
        case 'inativo': fillColor = '#ef4444'; break;
    }

    return {
        path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
        fillColor: fillColor,
        fillOpacity: 1,
        strokeWeight: 1.5,
        strokeColor: 'hsl(var(--background))',
        scale: isSelected ? 2.2 : 1.5,
        anchor: new window.google.maps.Point(12, 12)
    };
};

export default function FleetMonitoringPage() {
    const { isLoaded, loadError } = useGoogleMaps();
    const { t, user } = useAppContext();
    
    const [vehicles, setVehicles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        if (user?.id) {
            getDriversByFleetManager(user.id).then(drivers => {
                // Here we might enrich driver data with real-time vehicle location data from another service
                // For now, we'll assign random locations for demonstration
                const vehiclesWithLocation = drivers.map(driver => ({
                    ...driver,
                    lat: LISBON_CENTER.lat + (Math.random() - 0.5) * 0.1,
                    lng: LISBON_CENTER.lng + (Math.random() - 0.5) * 0.1,
                    vehicleStatus: { state: (driver as any).status || 'disponivel' } // Mock status
                }));
                setVehicles(vehiclesWithLocation);
            }).finally(() => setLoading(false));
        }
    }, [user]);

    const handleOpenAddModal = () => {
        setSelectedVehicle(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (vehicle: any) => {
        setSelectedVehicle(vehicle); 
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
    };

    const handleSaveVehicle = (formData: any) => {
        // This should call a service to save the driver/vehicle data
        if (formData.id) {
            setVehicles(vehicles.map(v => v.id === formData.id ? { ...v, ...formData } : v));
        } else { 
            const newVehicle = { ...formData, id: `driver_${Date.now()}`, lat: 38.73, lng: -9.14 };
            setVehicles([...vehicles, newVehicle]);
        }
        handleCloseModal();
    };

    const handleDeleteVehicle = (vehicleId: string) => {
        // This should call a service to delete the driver/vehicle
        setVehicles(vehicles.filter(v => v.id !== vehicleId));
        handleCloseModal();
    };
    
    const handleSelectOnMap = useCallback((vehicle: any) => {
        setSelectedVehicle(vehicle);
    }, []);

    if (loadError) return <div>{t('map_load_error')}</div>;
    if (!isLoaded || loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;

    return (
        <div className="grid md:grid-cols-3 gap-6 md:h-[calc(100vh-10rem)]">
            <div className="md:col-span-2 h-[50vh] md:h-full w-full">
                 <Map>
                    {vehicles.map(vehicle => (
                        <MarkerF
                            key={vehicle.id}
                            position={{ lat: (vehicle as any).lat, lng: (vehicle as any).lng }}
                            icon={getVehicleIcon(vehicle.vehicleStatus.state, selectedVehicle?.id === vehicle.id) as google.maps.Icon | null}
                            onClick={() => handleSelectOnMap(vehicle)}
                            zIndex={selectedVehicle?.id === vehicle.id ? 10 : 1}
                        />
                    ))}
                </Map>
            </div>

            <div className="md:col-span-1 flex flex-col h-full">
                <VehicleList 
                    vehicles={vehicles} 
                    onVehicleClick={handleOpenEditModal} 
                    onAddClick={handleOpenAddModal}
                />
            </div>

            <VehicleEditModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                vehicle={selectedVehicle}
                onSave={handleSaveVehicle}
                onDelete={handleDeleteVehicle}
            />
        </div>
    );
}
