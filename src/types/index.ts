export interface Promotion {
    id: string; // Firestore IDs are strings
    title: string;
    description: string;
    type: 'percentage' | 'fixed_discount' | 'fixed_price';
    value: number;
    startDate: string;
    endDate: string;
    status: 'Ativa' | 'Inativa';
}

export interface UserProfile {
    id?: string;
    name: string;
    email: string;
    phone: string;
    nif: string;
    address: string;
    avatarUrl?: string;
    rating?: number;
    activeVehicleId?: string;
}

export interface Trip {
    id: string; // Firestore document ID
    type: 'trip' | 'delivery';
    passengerName: string;
    date: string; // ISO 8601 format
    value: number;
    earnings?: number; // Optional, can be calculated
    status: 'completed' | 'cancelled';
    originAddress: string;
    destinationAddress: string;
    distance: number; // in kilometers
    driverId: string; // ID of the driver who completed the trip
    passengerId: string; // ID of the passenger who took the trip
    vehicleId: string; // ID of the vehicle used for the trip
    duration: number; // in minutes
}

export interface Vehicle {
    id: string;
    driverId: string;
    make: string;
    model: string;
    year: string;
    color: string;
    plate: string;
    status: 'active' | 'pending' | 'rejected' | 'maintenance' | 'inactive';
    imageUrl?: string;
    aiHint?: string;
    allowedServices: ('passengers' | 'deliveries')[];
}
