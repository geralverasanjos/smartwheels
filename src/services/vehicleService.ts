// src/services/vehicleService.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Vehicle } from '@/types';

/**
 * Fetches a specific vehicle from the database.
 * @param vehicleId The ID of the vehicle to fetch.
 * @returns A promise that resolves to the vehicle data or null if not found.
 */
export const getVehicleById = async (vehicleId: string): Promise<Vehicle | null> => {
    if (!vehicleId) return null;

    const docRef = doc(db, 'vehicles', vehicleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Vehicle;
    } else {
        console.warn(`Vehicle with ID ${vehicleId} not found.`);
        return null;
    }
};
