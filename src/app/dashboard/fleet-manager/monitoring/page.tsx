
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MarkerF } from '@react-google-maps/api';
import { Map } from '@/components/map';
import VehicleList from '@/components/fleet/vehicle-list';
import VehicleEditModal from '@/components/fleet/vehicle-edit-modal';
import { Loader2, Car } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { getDriversByFleetManager } from '@/services/profileService';
import type { UserProfile } from '@/types';

const LISBON_CENTER = { lat: 38.736946, lng: -9.142685 };


export default function FleetMonitoringPage() {
    const { t, user } = useAppContext();
    
    const [vehicles, setVehicles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        if (user?.id) {
            getDriversByFleetManager(user.id).then(drivers => {
                const vehiclesWithLocation = drivers.map(driver => ({
                    ...driver,
                    lat: LISBON_CENTER.lat + (Math.random() - 0.5) * 0.1,
                    lng: LISBON_CENTER.lng + (Math.random() - 0.5) * 0.1,
                    vehicleStatus: { state: (driver as any).status || 'disponivel' }
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
        if (formData.id) {
            setVehicles(vehicles.map(v => v.id === formData.id ? { ...v, ...formData } : v));
        } else { 
            const newVehicle = { ...formData, id: `driver_${Date.now()}`, lat: 38.73, lng: -9.14 };
            setVehicles([...vehicles, newVehicle]);
        }
        handleCloseModal();
    };

    const handleDeleteVehicle = (vehicleId: string) => {
        setVehicles(vehicles.filter(v => v.id !== vehicleId));
        handleCloseModal();
    };
    
    const handleSelectOnMap = useCallback((vehicle: any) => {
        setSelectedVehicle(vehicle);
    }, []);


    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    
    return (
        <div className="grid md:grid-cols-3 gap-6 md:h-[calc(100vh-10rem)]">
            <div className="md:col-span-2 h-[50vh] md:h-full w-full">
                <Map>
                    {vehicles.map(vehicle => (
                        <MarkerF
                            key={vehicle.id}
                            position={{ lat: (vehicle as any).lat, lng: (vehicle as any).lng }}
                            onClick={() => handleSelectOnMap(vehicle)}
                            icon={{
                                url: `/car.svg`,
                                scaledSize: selectedVehicle?.id === vehicle.id ? new google.maps.Size(40, 40) : new google.maps.Size(30, 30),
                                anchor: new google.maps.Point(15, 15)
                            }}
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
