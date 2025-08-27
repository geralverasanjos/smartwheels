
'use client';

import { useCallback } from 'react';
import { useGoogleMaps } from './useGoogleMaps';

export const useGeocoding = () => {
    const { isLoaded } = useGoogleMaps();

  const geocode = useCallback(
    (address: string): Promise<google.maps.LatLngLiteral> => {
      return new Promise((resolve, reject) => {
        if (!isLoaded) return reject(new Error('Google Maps not loaded'));

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({ lat: location.lat(), lng: location.lng() });
          } else {
            reject(new Error(`Geocode was not successful for the following reason: ${status}`));
          }
        });
      });
    },
    [isLoaded]
  );

  const reverseGeocode = useCallback(
    (coords: google.maps.LatLngLiteral): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!isLoaded) return reject(new Error('Google Maps not loaded'));

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error(`Reverse geocode was not successful for the following reason: ${status}`));
          }
        });
      });
    },
    [isLoaded]
  );

  return { geocode, reverseGeocode, isLoaded };
};
