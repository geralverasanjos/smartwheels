// src/services/promotionService.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Promotion } from '@/types';

const getPromotions = async (role: 'driver' | 'fleet-manager'): Promise<Promotion[]> => {
    const promotionsCol = collection(db, `${role}_promotions`);
    const snapshot = await getDocs(promotionsCol);
    const promotions: Promotion[] = [];
    snapshot.forEach(doc => {
        promotions.push({ id: doc.id, ...doc.data() } as Promotion);
    });
    return promotions;
};

export const getDriverPromotions = (): Promise<Promotion[]> => getPromotions('driver');
export const getFleetPromotions = (): Promise<Promotion[]> => getPromotions('fleet-manager');

export const savePromotion = async (role: string, promo: Omit<Promotion, 'id'> | Promotion): Promise<void> => {
    if ('id' in promo && promo.id) {
        const docRef = doc(db, `${role}_promotions`, promo.id);
        await updateDoc(docRef, promo);
    } else {
        await addDoc(collection(db, `${role}_promotions`), promo);
    }
};

export const deletePromotion = async (role: string, promoId: string): Promise<void> => {
    const docRef = doc(db, `${role}_promotions`, promoId);
    await deleteDoc(docRef);
};
