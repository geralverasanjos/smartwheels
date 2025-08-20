
// src/services/paymentService.ts
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/types';


export const getTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
    const transactions: Transaction[] = [];
    if (!userId) return transactions;

    try {
        const transactionsCollection = collection(db, 'transactions');
        const q = query(
            transactionsCollection,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });

        return transactions;
    } catch (error) {
        console.error("Error fetching transactions for user:", error);
        throw new Error("Failed to fetch transaction history.");
    }
};


export const recordTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'timestamp'>
): Promise<void> => {
    try {
        const transactionsCollection = collection(db, 'transactions');
        const newTransaction = {
            ...transactionData,
            timestamp: serverTimestamp(),
        };
        await addDoc(transactionsCollection, newTransaction);
    } catch (error) {
        console.error("Error recording transaction:", error);
        throw new Error("Failed to record transaction.");
    }
};
