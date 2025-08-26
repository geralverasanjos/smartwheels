'use client';
import { useApiIsLoaded } from '@vis.gl/react-google-maps';

export const useGoogleMaps = () => {
  const isLoaded = useApiIsLoaded();
  return { isLoaded };
};
