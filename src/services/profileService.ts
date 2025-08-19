// src/services/profileService.ts
import { doc, getDoc, setDoc, DocumentData } from 'firebase/firestore';
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

export const getUserProfileByAuthId = async (authId: string): Promise<(UserProfile & { role: 'driver' | 'passenger' | 'fleet-manager' }) | null> => {
    const roles: ('driver' | 'passenger' | 'fleet-manager')[] = ['driver', 'passenger', 'fleet-manager'];

    for (const role of roles) {
        try {
            const docRef = doc(db, `${role}s`, authId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() as UserProfile, role };
            }
        } catch (error) {
            console.error(`Error fetching profile for role ${role}:`, error);
        }
    }
    return null; // User ID not found in any profile collection
};