'use client';
import { APIProvider, Map as GoogleMap, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { ReactNode } from 'react';

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
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (e: MapCameraChangedEvent) => void;
}

export function Map({
  children,
  center = defaultCenter,
  zoom = 13,
  onMapClick,
}: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-destructive text-destructive-foreground">
        Google Maps API Key is missing.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <GoogleMap
        mapId={'f913f0d1a4623e64'}
        style={containerStyle}
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        onCameraChanged={onMapClick}
      >
        {children}
      </GoogleMap>
    </APIProvider>
  );
}