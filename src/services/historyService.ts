// src/services/historyService.ts
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Trip } from '@/types';

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
    querySnapshot.forEach((doc) => {
        trips.push({ id: doc.id, ...doc.data() } as Trip);
    });

    return trips;
};


export const getDriverTripHistory = (userId: string): Promise<Trip[]> => {
    return getUserTripHistory(userId, 'driver');
};

/**
 * Saves a completed trip to the Firestore database.
 * @param tripData The trip data to save.
 */
export const saveTripHistory = async (tripData: Omit<Trip, 'id'>): Promise<void> => {
    try {
        const historyCollection = collection(db, 'trips');
        await addDoc(historyCollection, tripData);
    } catch (error) {
        console.error("Error writing document: ", error);
        throw new Error("Could not save trip history.");
    }
};
