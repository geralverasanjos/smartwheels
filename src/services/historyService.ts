// src/services/historyService.ts
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Trip } from '@/types';

const getUserId = () => {
    // Para prototipagem, usamos IDs fixos. Em produção, use o ID do usuário autenticado.
    // e.g., return auth.currentUser?.uid;
    return 'mock_driver_id';
};

/**
 * Saves a completed trip to the Firestore database.
 * @param tripData The trip data to save.
 */
export const saveTripHistory = async (tripData: Omit<Trip, 'id'>): Promise<void> => {
    try {
        const historyCollection = collection(db, 'tripHistory');
        await addDoc(historyCollection, tripData);
    } catch (error) {
        console.error("Error writing document: ", error);
        throw new Error("Could not save trip history.");
    }
};

/**
 * Fetches the trip history for the current driver.
 * @returns A promise that resolves to an array of trips.
 */
export const getDriverTripHistory = async (): Promise<Trip[]> => {
    const driverId = getUserId();
    const historyCollection = collection(db, 'tripHistory');
    const q = query(
        historyCollection, 
        where("driverId", "==", driverId),
        orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    const trips: Trip[] = [];
    querySnapshot.forEach((doc) => {
        trips.push({ id: doc.id, ...doc.data() } as Trip);
    });
    
    return trips;
};
