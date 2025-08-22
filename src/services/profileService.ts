'use client';
// src/services/profileService.ts
import { doc, getDoc, setDoc, DocumentData, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';

/**
 * Fetches a user's profile from a specific collection.
 * @param userId The ID of the user (should match the Firestore document ID).
 * @param role The collection to search in ('passenger', 'driver', 'fleet-manager').
 * @returns A promise that resolves to the user's profile or null if not found.
 */
const getProfile = async (userId: string, role: 'passenger' | 'driver' | 'fleet-manager'): Promise<UserProfile | null> => {
    if (!userId) return null;
    
    const collectionName = `${role}s`;
    const docRef = doc(db, collectionName, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, role, ...docSnap.data() } as UserProfile;
    } else {
        // This is not an error, just means the user is not in this collection.
        // console.warn(`Profile for user ${userId} not found in ${collectionName}.`);
        return null;
    }
};

export const getDriverProfile = (userId: string): Promise<UserProfile | null> => getProfile(userId, 'driver');
export const getPassengerProfile = (userId: string): Promise<UserProfile | null> => getProfile(userId, 'passenger');
export const getFleetManagerProfile = (userId: string): Promise<UserProfile | null> => getProfile(userId, 'fleet-manager');


/**
 * Saves a user's profile to the appropriate Firestore collection based on their role.
 * @param profileData The complete user profile data, including role and ID.
 */
export const saveUserProfile = async (profileData: UserProfile): Promise<void> => {
    if (!profileData.id || !profileData.role) {
        throw new Error("User ID and role are required to save profile.");
    }
    const collectionName = `${profileData.role}s`;
    const docRef = doc(db, collectionName, profileData.id);
    
    // Do not save the 'id' field inside the document itself
    const dataToSave = { ...profileData };
    delete (dataToSave as any).id;

    await setDoc(docRef, dataToSave, { merge: true });
};


/**
 * Finds a user's profile across all possible role collections using their Firebase Auth ID.
 * @param authId The Firebase Authentication user ID.
 * @returns A promise that resolves to the complete UserProfile object (including the role) or null if not found.
 */
export const getUserProfileByAuthId = async (authId: string): Promise<UserProfile | null> => {
    if (!authId) return null;
    
    const roles: ('passenger' | 'driver' | 'fleet-manager')[] = ['passenger', 'driver', 'fleet-manager'];

    for (const role of roles) {
        try {
            const profile = await getProfile(authId, role);
            if (profile) {
                return profile; // Return the first profile found
            }
        } catch (error) {
            console.error(`Error fetching profile for role ${role}:`, error);
        }
    }
    
    console.warn(`Profile for authId ${authId} not found in any collection.`);
    return null; // User profile not found in any collection
};


/**
 * Fetches a user's profile by their ID and role. This is more direct than searching all collections.
 * @param userId The ID of the user.
 * @param role The specific role collection to look in.
 * @returns A promise that resolves to the user's profile or null if not found.
 */
export const getProfileByIdAndRole = async (userId: string, role: 'passenger' | 'driver' | 'fleet-manager'): Promise<UserProfile | null> => {
    return getProfile(userId, role);
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
    const q = query(driversCollection, where("fleetManagerId", "==", fleetManagerId));

    try {
        const querySnapshot = await getDocs(q);
        const drivers: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            drivers.push({ id: doc.id, role: 'driver', ...doc.data() } as UserProfile);
        });
        return drivers;
    } catch (error) {
        console.error("Error fetching drivers for fleet manager:", error);
        return [];
    }
};

/**
 * Uploads a profile photo to Firebase Storage and returns the download URL.
 * @param file The image file to upload.
 * @param userId The ID of the user to associate the photo with.
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
    if (!file) throw new Error("No file provided for upload.");
    if (!userId) throw new Error("User ID is required for photo upload.");

    const storage = getStorage();
    const filePath = `profile-photos/${userId}/${file.name}`;
    const storageRef = ref(storage, filePath);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading profile photo:", error);
        throw new Error("Failed to upload photo.");
    }
};
