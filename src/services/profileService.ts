// src/services/profileService.ts
import { doc, getDoc, setDoc, DocumentData, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';

// O ID do usuário seria obtido a partir da sessão de autenticação
const getUserId = () => {
    // Para prototipagem, usamos IDs fixos. Em produção, use o ID do usuário autenticado.
    // e.g., return auth.currentUser?.uid;
    return 'mock_user_id';
};

const getProfile = async (role: 'passenger' | 'driver' | 'fleet-manager'): Promise<UserProfile | null> => {
    const userId = getUserId();
    const docRef = doc(db, `${role}s`, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
        // Se o perfil não existir, podemos criar um com dados padrão
        const defaultProfile: UserProfile = {
            id: userId,
            name: 'Novo Utilizador',
            email: 'user@example.com',
            phone: '',
            nif: '',
            address: '',
            avatarUrl: `https://placehold.co/100x100.png?text=${role.substring(0,1).toUpperCase()}`,
            balance: 0,
            role: role,
            rating: 4.8, // Default rating
            activeVehicleId: 'mock_vehicle_id', // Default vehicle
        };
        await setDoc(docRef, defaultProfile);
        return defaultProfile;
    }
};

export const getDriverProfile = (): Promise<UserProfile | null> => getProfile('driver');
export const getPassengerProfile = (): Promise<UserProfile | null> => getProfile('passenger');
export const getFleetManagerProfile = (): Promise<UserProfile | null> => getProfile('fleet-manager');

export const saveUserProfile = async (role: string, profileData: UserProfile): Promise<void> => {
    const userId = getUserId();
    const docRef = doc(db, `${role}s`, userId);
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
