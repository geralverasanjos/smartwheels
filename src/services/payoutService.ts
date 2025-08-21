// src/services/payoutService.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PayoutMethod } from '@/types';

const payoutMethodsCollection = collection(db, 'payoutMethods');

export const getPayoutMethods = async (userId: string): Promise<PayoutMethod[]> => {
    if (!userId) return [];
    try {
        const q = query(payoutMethodsCollection, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const methods: PayoutMethod[] = [];
        snapshot.forEach(doc => {
            methods.push({ id: doc.id, ...doc.data() } as PayoutMethod);
        });
        return methods;
    } catch (error) {
        console.error("Error fetching payout methods:", error);
        throw new Error("Failed to fetch payout methods.");
    }
};

export const savePayoutMethod = async (method: Omit<PayoutMethod, 'id'>, methodId?: string): Promise<DocumentData> => {
    try {
        if (methodId) {
            const docRef = doc(db, 'payoutMethods', methodId);
            await updateDoc(docRef, method);
            return docRef;
        } else {
            return await addDoc(payoutMethodsCollection, method);
        }
    } catch (error) {
        console.error("Error saving payout method:", error);
        throw new Error("Failed to save payout method.");
    }
};

export const deletePayoutMethod = async (methodId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'payoutMethods', methodId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting payout method:", error);
        throw new Error("Failed to delete payout method.");
    }
};
