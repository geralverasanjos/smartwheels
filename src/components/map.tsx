'use client';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 38.736946,
  lng: -9.142685,
};

interface MapProps {
  children?: ReactNode;
  onMapLoad?: (map: google.maps.Map) => void;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
}

export function Map({ children, onMapLoad, onMapClick }: MapProps) {
  const { isLoaded, loadError } = useGoogleMaps();

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={13}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
      }}
      onLoad={onMapLoad}
      onClick={onMapClick}
    >
      {children}
    </GoogleMap>
  );
}
