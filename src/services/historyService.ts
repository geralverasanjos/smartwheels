// src/services/historyService.ts
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Trip, UserProfile } from '@/types';
import { getProfileByIdAndRole } from './profileService';

/**
 * Fetches the trip history for a specific user (driver or passenger).
 * @param userId The ID of the user.
 * @param role The role of the user ('driver' or 'passenger').
 * @returns A promise that resolves to an array of trips.
 */
export const getUserTripHistory = async (userId: string, role: 'driver' | 'passenger'): Promise<Trip[]> => {
    const tripsCollection = collection(db, 'trips');
    const fieldToFilter = role === 'driver' ? 'driverId' : 'passengerId';

    const q = query(
        tripsCollection,
        where(fieldToFilter, '==', userId),
        orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const trips: Trip[] = [];
    for (const doc of querySnapshot.docs) {
        const tripData = doc.data() as Trip;
        
        // Fetch driver and passenger profiles to enrich the trip data
        const driver = await getProfileByIdAndRole(tripData.driverId, 'driver');
        const passenger = await getProfileByIdAndRole(tripData.passengerId, 'passenger');

        trips.push({ 
            id: doc.id, 
            ...tripData,
            driver: driver || undefined,
            passenger: passenger || undefined,
        });
    }

    return trips;
};

export const getDriverTripHistory = (userId: string): Promise<Trip[]> => {
    return getUserTripHistory(userId, 'driver');
};

/**
 * Fetches the trip history for an entire fleet.
 * This assumes fleet managers have a way to be associated with drivers,
 * which is not implemented yet. For now, it will fetch all trips.
 * In a real scenario, you'd filter by drivers belonging to the fleet manager.
 * @param fleetManagerId The ID of the fleet manager.
 * @returns A promise that resolves to an array of trips.
 */
export const getFleetTripHistory = async (fleetManagerId: string): Promise<Trip[]> => {
    // NOTE: This is a simplified version. A real implementation would involve
    // querying drivers associated with the fleetManagerId first.
    const tripsCollection = collection(db, 'trips');
    const q = query(tripsCollection, orderBy('date', 'desc')); // Fetch all trips for now
    
    const querySnapshot = await getDocs(q);
    const trips: Trip[] = [];

    for (const doc of querySnapshot.docs) {
        const tripData = doc.data() as Trip;
        
        // Enrich with driver and passenger info
        const driver = await getProfileByIdAndRole(tripData.driverId, 'driver');
        const passenger = await getProfileByIdAndRole(tripData.passengerId, 'passenger');
        
        trips.push({ 
            id: doc.id, 
            ...tripData,
            driver: driver || undefined,
            passenger: passenger || undefined,
        });
    }

    return trips;
};


/**
 * Saves a completed trip to the Firestore database.
 * @param tripData The trip data to save.
 */
export const saveTripHistory = async (tripData: Omit<Trip, 'id'>): Promise<void> => {
    try {
        const historyCollection = collection(db, 'trips');
        // Remove nested objects before saving to avoid Firestore issues with complex objects in arrays
        const { driver, passenger, ...savableTripData } = tripData;
        await addDoc(historyCollection, savableTripData);
    } catch (error) {
        console.error("Error writing document: ", error);
        throw new Error("Could not save trip history.");
    }
};
