export interface UserProfile {
      id: string;
      name: string;
      email: string;
      phone: string;
      nif: string; // Assuming NIF is Number Identification Fiscal
      address: string;
      avatarUrl: string;
      rating: number;
      activeVehicleId?: string; // Optional, only for drivers
      balance: number; // Add this field
    }
import { collection, addDoc, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import firebase from 'firebase/compat/app'; // Import firebase for FieldValue

export const submitRating = async (
    rideId: string,
    raterId: string,
    ratedUserId: string,
    rating: number,
    comment: string | null
): Promise<void> => {
    try {
        const ratingsCollection = collection(db, 'ratings');
        const newRating = {
            rideId,
            raterId,
            ratedUserId,
            rating,
            comment,
            timestamp: FieldValue.serverTimestamp(),
        };
        await addDoc(ratingsCollection, newRating);
        console.log("Rating submitted successfully!");
    } catch (error) {
        console.error("Error submitting rating:", error);
        throw new Error("Failed to submit rating. Please try again.");
    }
};