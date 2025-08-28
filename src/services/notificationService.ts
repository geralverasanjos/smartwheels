// src/services/notificationService.ts
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppNotification } from '@/types';

/**
 * Fetches all notifications for a given user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of notifications.
 */
export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
    const notificationsCol = collection(db, 'notifications');
    const q = query(
        notificationsCol,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const notifications: AppNotification[] = [];
    snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() } as AppNotification);
    });

    return notifications;
};

/**
 * Marks a specific notification as read.
 * @param notificationId The ID of the notification to update.
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    const notificationRef = doc(db, 'notifications', notificationId);
    try {
        await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw new Error("Failed to update notification.");
    }
};
