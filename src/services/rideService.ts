import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';

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
    duration: number; // in minutes
    driverId: string; // ID of the driver who completed the trip
    passengerId: string; // ID of the passenger who took the trip
    vehicleId: string; // ID of the vehicle used for the trip
}

export interface Vehicle {
    id: string; // Firestore document ID
    model: string;
    plate: string;
    type: 'taxi' | 'delivery' | 'mototaxi'; // Or other relevant types
    status: 'active' | 'pending' | 'inactive';
    driverId?: string; // ID of the driver associated with this vehicle (optional, if a vehicle can be unassigned)
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    nif?: string;
    address?: string;
    avatarUrl?: string;
    rating?: number;
    activeVehicleId?: string;
    balance: number;
    role?: 'driver' | 'passenger' | 'fleet-manager' | null;
}

export interface RideRequest {
    id?: string; // Firestore document ID (optional before creation)
    passengerId: string;
    origin: { lat: number, lng: number } | string; // Using flexible types for now
    destination: { lat: number, lng: number } | string; // Using flexible types for now
    serviceType: 'taxi' | 'delivery' | 'mototaxi';
    timestamp: Date; // Using Date for simplicity here, will use serverTimestamp in service
    status: 'pending' | 'searching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'; // Example statuses
    driverId?: string; // Optional, will be assigned later
    vehicleId?: string; // Optional, will be assigned later
    // Add other relevant fields like price estimate, route details, etc.
}

export const createRideRequest = async (
    passengerId: string,
    origin: string, // Using string for now as per UI
    destination: string, // Using string for now as per UI
    serviceType: string,
) => {
    // In a real app, you'd add validation, price calculation, etc.
    // Use serverTimestamp() in Firestore for actual timestamping
    const newRequest: Omit<RideRequest, 'id'> = {
        passengerId,
        origin,
        destination,
        serviceType: serviceType as RideRequest['serviceType'], // Cast for type safety
        timestamp: new Date(), // Placeholder, use serverTimestamp() in real app
        status: 'pending', // Initial status
    };

    // Example: Add to a 'rideRequests' collection
    // const docRef = await addDoc(collection(db, 'rideRequests'), newRequest);
    // return docRef.id;

    // Simulate successful creation
    console.log('Simulating ride request creation:', newRequest);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return 'simulated-request-id-' + Date.now();
};

export const getPendingRideRequests = async (): Promise<RideRequest[]> => {
    // Replace with your actual Firestore instance
    const db = {}; // TODO: Replace with actual Firestore instance

    const rideRequestsRef = collection(db as any, 'rideRequests');
    const q = query(
        rideRequestsRef,
        where('status', 'in', ['pending', 'searching']),
        orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q as any); // Cast to any temporarily

    const requests: RideRequest[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<RideRequest, 'id'> // Cast data to RideRequest interface
    }));

    return requests;
};

export const acceptRideRequest = async (requestId: string, driverId: string, vehicleId: string): Promise<void> => {
    // Replace with your actual Firestore instance
    const db = {}; // TODO: Replace with actual Firestore instance

    const rideRequestRef = doc(db as any, 'rideRequests', requestId);
    await updateDoc(rideRequestRef, {
        status: 'accepted',
        driverId,
        vehicleId,
    });
};

export const updateRideStatus = async (requestId: string, newStatus: RideRequest['status']): Promise<void> => {
    // Replace with your actual Firestore instance
    const db = {}; // TODO: Replace with actual Firestore instance

    const rideRequestRef = doc(db as any, 'rideRequests', requestId);
    await updateDoc(rideRequestRef, {
        status: newStatus,
    });
};