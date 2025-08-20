'use client';
// src/services/standsService.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TaxiStand } from '@/types';

const standsCollection = collection(db, 'stands');

export const getStands = async (): Promise<TaxiStand[]> => {
    try {
        const snapshot = await getDocs(standsCollection);
        const stands: TaxiStand[] = [];
        snapshot.forEach(doc => {
            stands.push({ id: doc.id, ...doc.data() } as TaxiStand);
        });
        return stands;
    } catch (error) {
        console.error("Error fetching stands:", error);
        throw new Error("Failed to fetch stands.");
    }
};

export const saveStand = async (stand: Partial<TaxiStand>): Promise<DocumentData> => {
    try {
        if (stand.id) {
            const docRef = doc(db, 'stands', stand.id);
            const { id, ...standData } = stand;
            await updateDoc(docRef, standData);
            return docRef;
        } else {
            return await addDoc(standsCollection, stand);
        }
    } catch (error) {
        console.error("Error saving stand:", error);
        throw new Error("Failed to save stand.");
    }
};

export const deleteStand = async (standId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'stands', standId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting stand:", error);
        throw new Error("Failed to delete stand.");
    }
};
