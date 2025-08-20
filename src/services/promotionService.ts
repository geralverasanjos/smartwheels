// src/services/promotionService.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Promotion } from '@/types';

// Assuming promotions are stored in a single collection `promotions`
// with a field like `createdBy` to link to a driver or fleet manager.
// For now, let's assume a simpler model where we have separate collections.

const getPromotions = async (): Promise<Promotion[]> => {
    // This is a simplified fetch. In a real app, you would likely filter by user ID.
    const promotionsCol = collection(db, `promotions`);
    const snapshot = await getDocs(promotionsCol);
    const promotions: Promotion[] = [];
    snapshot.forEach(doc => {
        promotions.push({ id: doc.id, ...doc.data() } as Promotion);
    });
    return promotions;
};

// Functions can be specified per role if collections are separate
export const getDriverPromotions = (): Promise<Promotion[]> => getPromotions();
export const getFleetPromotions = (): Promise<Promotion[]> => getPromotions();

export const savePromotion = async (promo: Partial<Promotion>): Promise<DocumentData> => {
    if (promo.id) {
        const docRef = doc(db, 'promotions', promo.id);
        const { id, ...promoData } = promo;
        await updateDoc(docRef, promoData);
        return docRef;
    } else {
        return await addDoc(collection(db, `promotions`), promo);
    }
};

export const deletePromotion = async (promoId: string): Promise<void> => {
    const docRef = doc(db, 'promotions', promoId);
    await deleteDoc(docRef);
};
