
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Handles the completion of a trip, including payment processing and status updates.
 */
export const completeTrip = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    
    const { rideId, finalFare } = data;
    if (!rideId || typeof finalFare !== 'number') {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "rideId" and a "finalFare".');
    }

    const driverId = context.auth.uid;
    const rideRef = db.doc(`rideRequests/${rideId}`);

    return db.runTransaction(async (transaction) => {
        const rideDoc = await transaction.get(rideRef);
        if (!rideDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Ride request not found.');
        }

        const rideData = rideDoc.data();
        if (rideData?.driverId !== driverId) {
            throw new functions.https.HttpsError('permission-denied', 'You are not the driver for this ride.');
        }
        if (rideData?.status !== 'in_progress') {
             throw new functions.https.HttpsError('failed-precondition', `Ride is not in progress. Current status: ${rideData?.status}`);
        }

        const passengerId = rideData.passengerId;
        const passengerRef = db.doc(`passengers/${passengerId}`);
        const driverRef = db.doc(`drivers/${driverId}`);
        
        const passengerDoc = await transaction.get(passengerRef);
        const driverDoc = await transaction.get(driverRef);

        if (!passengerDoc.exists || !driverDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Passenger or driver profile not found.');
        }

        const passengerProfile = passengerDoc.data();
        const driverProfile = driverDoc.data();

        // 2. Process Payment (Wallet transfer)
        const passengerBalance = passengerProfile?.balance || 0;
        if (passengerBalance < finalFare) {
            // In a real app, you might try to charge a saved card here.
            throw new functions.https.HttpsError('failed-precondition', 'Insufficient passenger balance.');
        }

        const newPassengerBalance = passengerBalance - finalFare;
        const newDriverBalance = (driverProfile?.balance || 0) + finalFare; // Simplified, assuming 100% goes to driver

        transaction.update(passengerRef, { balance: newPassengerBalance });
        transaction.update(driverRef, { balance: newDriverBalance });

        // 3. Record Transactions
        const transactionsRef = db.collection('transactions');
        const now = admin.firestore.Timestamp.now();

        // Passenger's transaction
        transaction.set(transactionsRef.doc(), {
            userId: passengerId,
            amount: -finalFare,
            type: 'trip',
            description: `Viagem com ${driverProfile?.name}`,
            status: 'completed',
            timestamp: now
        });

        // Driver's transaction
        transaction.set(transactionsRef.doc(), {
            userId: driverId,
            amount: finalFare,
            type: 'trip',
            description: `Viagem de ${passengerProfile?.name}`,
            status: 'completed',
            timestamp: now
        });
        
        // 4. Update Ride and Driver Status
        transaction.update(rideRef, { status: 'completed', finalFare: finalFare });
        transaction.update(driverRef, { status: 'online' }); // Set driver back to available

        return { success: true, message: 'Trip completed and payment processed successfully.' };
    });
});

