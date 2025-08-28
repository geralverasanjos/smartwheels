
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as geofire from 'geofire-common';

const db = admin.firestore();

/**
 * Finds the nearest available driver for a new ride request.
 */
export const findDriverForRide = functions.firestore
  .document('rideRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const rideRequest = snap.data();
    const requestId = context.params.requestId;

    if (!rideRequest || rideRequest.status !== 'pending') {
      console.log(`Request ${requestId} is not in a state to be matched.`);
      return null;
    }

    const { origin, serviceType } = rideRequest;
    
    if (!origin?.coords?.lat || !origin?.coords?.lng) {
        console.error(`Request ${requestId} is missing origin coordinates.`);
        return null;
    }
    
    const center = [origin.coords.lat, origin.coords.lng];
    const radiusInM = 50 * 1000; // 50km search radius

    // 1. Get all online drivers' locations
    const driversLocationCollection = db.collection('driverLocations');
    const allDriverLocations = (await driversLocationCollection.get()).docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Find drivers within the radius
    const bounds = geofire.geohashQueryBounds(center, radiusInM);
    const promises = [];
    for (const b of bounds) {
      const q = driversLocationCollection.orderBy('geohash').startAt(b[0]).endAt(b[1]);
      promises.push(q.get());
    }

    const snapshots = await Promise.all(promises);
    const nearbyDriverDocs: any[] = [];
    snapshots.forEach(snap => {
      snap.docs.forEach(doc => {
        const { lat, lng } = doc.data().geopoint;
        const distanceInKm = geofire.distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          nearbyDriverDocs.push({ id: doc.id, ...doc.data(), distance: distanceInM });
        }
      });
    });

    if (nearbyDriverDocs.length === 0) {
        console.log(`No drivers found within ${radiusInM/1000}km for request ${requestId}.`);
        await db.doc(`rideRequests/${requestId}`).update({ status: 'no_drivers_found' });
        return null;
    }
    
    // Sort by distance to find the closest
    nearbyDriverDocs.sort((a, b) => a.distance - b.distance);

    // 3. Check driver status and vehicle compatibility
    for (const driverDoc of nearbyDriverDocs) {
      const driverId = driverDoc.id;
      const driverProfileSnap = await db.doc(`drivers/${driverId}`).get();
      const driverProfile = driverProfileSnap.data();

      if (driverProfile && driverProfile.status === 'online' && driverProfile.activeVehicleId) {
        const vehicleSnap = await db.doc(`vehicles/${driverProfile.activeVehicleId}`).get();
        const vehicle = vehicleSnap.data();
        
        // This logic is simplified. A real app might check if serviceType is in an array of allowed services.
        if (vehicle && vehicle.status === 'active') { // Assuming `type` in vehicle matches `serviceType` in request
            console.log(`Assigning request ${requestId} to driver ${driverId}`);
             await db.doc(`rideRequests/${requestId}`).update({
                status: 'accepted',
                driverId: driverId,
                vehicleId: vehicle.id,
            });

            // Set driver status to 'in_trip'
            await db.doc(`drivers/${driverId}`).update({ status: 'in_trip' });
            
            return null; // Exit after finding a driver
        }
      }
    }

    console.log(`No compatible and available drivers found for request ${requestId}.`);
    await db.doc(`rideRequests/${requestId}`).update({ status: 'no_drivers_found' });
    return null;
});

