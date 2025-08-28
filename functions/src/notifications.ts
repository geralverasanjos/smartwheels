
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Creates a notification for passenger when a driver accepts their ride request.
 */
export const onRideAcceptedNotifyPassenger = functions.firestore
  .document("rideRequests/{requestId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if the status changed from 'pending' or 'searching' to 'accepted'
    if (after.status === "accepted" && before.status !== "accepted") {
      const passengerId = after.passengerId;
      const driverId = after.driverId;

      if (!passengerId || !driverId) {
        console.error("Missing passengerId or driverId in ride request.");
        return null;
      }

      const driverSnap = await db.doc(`drivers/${driverId}`).get();
      const driverName = driverSnap.data()?.name || "Your driver";

      const notificationPayload = {
        userId: passengerId,
        icon: "Car",
        titleKey: "notification_ride_accepted_title",
        descriptionKey: "notification_ride_accepted_desc",
        descriptionParams: {name: driverName},
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
        link: `/dashboard/passenger/transport`, // Link to trip tracking page
      };

      try {
        await db.collection("notifications").add(notificationPayload);
        const rideId = context.params.requestId;
        console.log(`Notification for passenger ${passengerId} for ${rideId}`);
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    }

    return null;
  });
