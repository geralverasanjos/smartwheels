// src/services/locationService.ts
import { doc, setDoc, GeoPoint, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming db is exported from your firebase config file

export const updateDriverLocation = async (
  driverId: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  const locationDocRef = doc(db, 'driverLocations', driverId);

  try {
    // geohash can be added here for more complex geo queries
    await setDoc(locationDocRef, {
      geopoint: new GeoPoint(latitude, longitude),
      timestamp: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error(`Error updating driver location for ${driverId}:`, error);
    // In a real app, you might want to handle this more gracefully
    // For now, we'll let the caller handle it.
    throw error;
  }
};
