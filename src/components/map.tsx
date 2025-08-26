
'use client';
import { GoogleMap, type GoogleMapProps } from '@react-google-maps/api';
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
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  onMapLoad?: (map: google.maps.Map) => void;
}

export function Map({
  children,
  center = defaultCenter,
  zoom = 13,
  onMapClick,
  onMapLoad,
}: MapProps) {

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        mapId: 'f913f0d1a4623e64',
        gestureHandling: 'greedy',
        disableDefaultUI: true,
      }}
      onLoad={onMapLoad}
      onClick={onMapClick}
    >
      {children}
    </GoogleMap>
  );
}
