import { collection, query, where, orderBy, getDocs, doc, updateDoc, addDoc, serverTimestamp, DocumentReference, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RideRequest } from '@/types';


export const createRideRequest = async (
    passengerId: string,
    origin: string,
    destination: string,
    serviceType: 'taxi' | 'delivery' | 'mototaxi' // Or your defined types
): Promise<DocumentReference<DocumentData, DocumentData>> => {
    try {
        const rideRequestsCollection = collection(db, 'rideRequests');
        const newRequest: Omit<RideRequest, 'id'> = {
            passengerId,
            origin,
            destination,
            serviceType,
            status: 'pending',
            timestamp: serverTimestamp(),
        };
        const docRef = await addDoc(rideRequestsCollection, newRequest);
        return docRef;
    } catch (error) {
        console.error("Error creating ride request:", error); // Log original error
        throw new Error("Failed to create ride request. Please try again."); // User-friendly error
    }
};

export const getPendingRideRequests = async (): Promise<RideRequest[]> => {
    try {
        const rideRequestsRef = collection(db, 'rideRequests');
        const q = query(
            rideRequestsRef,
            where('status', 'in', ['pending', 'searching']),
            orderBy('timestamp', 'asc')
        );
        const querySnapshot = await getDocs(q);

        const requests: RideRequest[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<RideRequest, 'id'>
        }));

        return requests;
    } catch (error: any) {
        console.error('Error fetching pending ride requests:', error);
        throw new Error('Failed to fetch pending ride requests: ' + error.message);
    }
};

export const acceptRideRequest = async (requestId: string, driverId: string, vehicleId: string): Promise<void> => {
    try {
        const rideRequestRef = doc(db, 'rideRequests', requestId);
        await updateDoc(rideRequestRef, {
            status: 'accepted',
            driverId,
            vehicleId,
        });
    } catch (error: any) {
        console.error(`Error accepting ride request ${requestId}:`, error);
        throw new Error(`Failed to accept ride request ${requestId}: ` + error.message);
    }
};

export const updateRideStatus = async (requestId: string, newStatus: RideRequest['status']): Promise<void> => {
    const rideRequestRef = doc(db, 'rideRequests', requestId);
    try {
        await updateDoc(rideRequestRef, {
            status: newStatus,
        });
    } catch (error: any) {
        console.error(`Error updating ride status for request ${requestId} to ${newStatus}:`, error);
        throw new Error(`Failed to update ride status for request ${requestId}: ` + error.message);
    }
};
