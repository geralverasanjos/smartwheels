import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
            timestamp: serverTimestamp(),
        };
        await addDoc(ratingsCollection, newRating);
        console.log("Rating submitted successfully!");
    } catch (error) {
        console.error("Error submitting rating:", error);
        throw new Error("Failed to submit rating. Please try again.");
    }
};
