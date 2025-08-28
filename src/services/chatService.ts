// src/services/chatService.ts
import { collection, addDoc, serverTimestamp, DocumentData, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming your Firebase instance is exported as db

export const sendMessage = async (
    rideId: string,
    senderId: string,
    text: string
): Promise<DocumentReference<DocumentData, DocumentData>> => {
    try {
        const messagesCollection = collection(db, 'messages');
        const newMessage = {
            rideId,
            senderId,
            text,
            timestamp: serverTimestamp(),
        };
        const docRef = await addDoc(messagesCollection, newMessage);
        return docRef;
    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message.");
    }
};
