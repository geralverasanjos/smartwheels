
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, DocumentData, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Vehicle } from '@/types';

const vehiclesCollection = collection(db, 'vehicles');

/**
 * Saves a vehicle to the Firestore database. If an ID is provided, it updates; otherwise, it creates.
 * @param vehicleData The data for the vehicle.
 * @returns A promise that resolves to the document reference.
 */
export const saveVehicle = async (vehicleData: Partial<Vehicle>): Promise<DocumentData> => {
    try {
        if (vehicleData.id) {
            const docRef = doc(db, 'vehicles', vehicleData.id);
            const { id, ...dataToUpdate } = vehicleData;
            await updateDoc(docRef, dataToUpdate);
            return docRef;
        } else {
            const dataToCreate = { ...vehicleData, createdAt: serverTimestamp() };
            return await addDoc(vehiclesCollection, dataToCreate);
        }
    } catch (error) {
        console.error("Error saving vehicle:", error);
        throw new Error("Failed to save vehicle.");
    }
};

/**
 * Fetches all vehicles for a specific driver.
 * @param driverId The ID of the driver.
 * @returns A promise that resolves to an array of vehicles.
 */
export const getVehiclesByDriver = async (driverId: string): Promise<Vehicle[]> => {
    if (!driverId) return [];
    try {
        const q = query(vehiclesCollection, where("driverId", "==", driverId));
        const snapshot = await getDocs(q);
        const vehicles: Vehicle[] = [];
        snapshot.forEach(doc => {
            vehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
        });
        return vehicles;
    } catch (error) {
        console.error("Error fetching vehicles by driver:", error);
        throw new Error("Failed to fetch vehicles.");
    }
};

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
