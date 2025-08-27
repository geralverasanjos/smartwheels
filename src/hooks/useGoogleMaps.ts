
'use client';
import { useJsApiLoader } from '@react-google-maps/api';

export const useGoogleMaps = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script-main',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: ['places', 'visualization'],
    });
  return { isLoaded };
};
