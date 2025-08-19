allow read: if request.auth != null &&
               get(/databases/$(database)/documents/drivers/$(driverId)).data.isOnline == true;
// src/services/locationService.ts
import { doc, setDoc, GeoPoint, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming db is exported from your firebase config file

export const updateDriverLocation = async (
  driverId: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  const locationDocRef = doc(db, 'driverLocations', driverId);

  try {
    await setDoc(locationDocRef, {
      geopoint: new GeoPoint(latitude, longitude),
      timestamp: FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`Driver ${driverId} location updated.`);
  } catch (error) {
    console.error(`Error updating driver location for ${driverId}:`, error);
    throw error; // Re-throw the error for handling in the component
  }
};