
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
    id: string; // This should be the Firebase Auth UID
    name: string;
    email: string;
    phone?: string;
    nif?: string; 
    address?: string;
    avatarUrl?: string;
    balance?: number; 
    role: 'passenger' | 'driver' | 'fleet-manager';
    status?: 'active' | 'pending' | 'inactive';
    rating?: number;
    activeVehicleId?: string; // Optional, only for drivers
    fleetManagerId?: string; // Optional, only for drivers in a fleet
    
    // Driver & Personal Documents
    identityDocumentUrl?: string;
    driverLicenseUrl?: string;
    vehicleDocumentUrl?: string;

    // Fleet Manager Documents & Info
    companyName?: string;
    companyNif?: string;
    commercialLicenseUrl?: string;
    operatorLicenseUrl?: string;
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
    // Enriched data, not stored in DB
    driver?: UserProfile;
    passenger?: UserProfile;
}

export interface Message {
    id: string; // Document ID
    rideId: string;
    senderId: string;
    text: string;
    timestamp: any; // Use any for firebase.firestore.FieldValue or Date for now
}


export interface RideRequest {
 id: string;
 passengerId: string;
 origin: string; 
 destination: string;
 serviceType: 'economico' | 'smart' | 'executivo' | 'van' | 'pet' | 'delivery_moto' | 'delivery_car' | 'delivery_van' | 'moto_economica' | 'moto_rapida' | 'moto_bau' | 'tuk_tuk';
 status: 'pending' | 'searching' | 'accepted' | 'driver_enroute' | 'at_pickup' | 'in_progress' | 'completed' | 'cancelled';
 timestamp: any; 
 driverId?: string;
 vehicleId?: string;
}


export interface Vehicle {
    id: string;
    driverId?: string;
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

export interface Transaction {
    id: string;
    userId: string; // The user this transaction belongs to (passenger, driver, or fleet manager)
    type: 'top-up' | 'withdraw' | 'trip' | 'transfer-in' | 'transfer-out' | 'fee';
    amount: number; // Positive for income, negative for expenses
    description: string;
    status: 'completed' | 'pending' | 'failed';
    timestamp: any; // Firestore Server Timestamp
    relatedUserId?: string; // e.g., for transfers
}

export type TaxiStand = {
    id: string;
    name: string;
    location: { lat: number; lng: number };
};

export interface PayoutMethod {
    id: string;
    userId: string;
    type: 'bank' | 'paypal' | 'pix' | 'mbway' | 'card';
    isDefault: boolean;
    details: {
        accountHolder?: string;
        bankName?: string;
        iban?: string;
        email?: string;
        keyType?: string;
        key?: string;
        phone?: string;
        cardholderName?: string;
        cardNumber?: string;
        cardExpiry?: string;
        cardCvv?: string;
    };
}

export interface ExchangeRateResponse {
  amount: number;
  base: string;
  date: string;
  rates: {
    [key: string]: number; // Ex: { "BRL": 5.50 }
  };
}
