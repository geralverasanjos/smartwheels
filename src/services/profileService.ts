// src/services/profileService.ts
import { doc, getDoc, setDoc, DocumentData, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';

const getProfile = async (userId: string, role: 'passenger' | 'driver' | 'fleet-manager'): Promise<UserProfile | null> => {
    if (!userId) return null;
    
    const docRef = doc(db, `${role}s`, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
        console.warn(`Profile for user ${userId} with role ${role} not found.`);
        return null;
    }
};

export const getDriverProfile = (userId: string): Promise<UserProfile | null> => getProfile(userId, 'driver');
export const getPassengerProfile = (userId: string): Promise<UserProfile | null> => getProfile(userId, 'passenger');
export const getFleetManagerProfile = (userId: string): Promise<UserProfile | null> => getProfile(userId, 'fleet-manager');

export const saveUserProfile = async (role: string, profileData: UserProfile): Promise<void> => {
    if (!profileData.id) {
        throw new Error("User ID is required to save profile.");
    }
    const docRef = doc(db, `${role}s`, profileData.id);
    await setDoc(docRef, profileData, { merge: true });
};

export const getUserProfileByAuthId = async (authId: string): Promise<(UserProfile) | null> => {
    const roles: ('driver' | 'passenger' | 'fleet-manager')[] = ['driver', 'passenger', 'fleet-manager'];

    for (const role of roles) {
        try {
            const docRef = doc(db, `${role}s`, authId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, role, ...docSnap.data() } as UserProfile;
            }
        } catch (error) {
            console.error(`Error fetching profile for role ${role}:`, error);
        }
    }
    return null; // User ID not found in any profile collection
};

export const getProfileByIdAndRole = async (userId: string, role: 'passenger' | 'driver' | 'fleet-manager'): Promise<UserProfile | null> => {
    if (!userId || !role) return null;
    const docRef = doc(db, `${role}s`, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
        console.warn(`Profile with ID ${userId} and role ${role} not found.`);
        return null;
    }
};

/**
 * Fetches all drivers associated with a specific fleet manager.
 * This assumes drivers have a 'fleetManagerId' field.
 * @param fleetManagerId The ID of the fleet manager.
 * @returns A promise that resolves to an array of driver profiles.
 */
export const getDriversByFleetManager = async (fleetManagerId: string): Promise<UserProfile[]> => {
    if (!fleetManagerId) return [];
    
    const driversCollection = collection(db, 'drivers');
    // NOTE: This assumes drivers have a `fleetManagerId` field.
    // If your data model is different, this query needs to be adjusted.
    const q = query(driversCollection, where("fleetManagerId", "==", fleetManagerId));

    try {
        const querySnapshot = await getDocs(q);
        const drivers: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            drivers.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
        return drivers;
    } catch (error) {
        console.error("Error fetching drivers for fleet manager:", error);
        return [];
    }
};
