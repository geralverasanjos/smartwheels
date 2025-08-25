
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

/**
 * Updates the status of a specific vehicle.
 * @param vehicleId The ID of the vehicle to update.
 * @param status The new status for the vehicle.
 */
export const updateVehicleStatus = async (vehicleId: string, status: Vehicle['status']): Promise<void> => {
    if (!vehicleId) {
        throw new Error("Vehicle ID is required to update status.");
    }
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    try {
        await updateDoc(vehicleRef, { status: status });
        console.log(`Vehicle ${vehicleId} status updated to ${status}`);
    } catch (error) {
        console.error(`Error updating vehicle status for ${vehicleId}:`, error);
        throw new Error("Failed to update vehicle status.");
    }
};
