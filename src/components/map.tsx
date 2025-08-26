
'use client';
import { Map as GoogleMap, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
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

  return (
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
  );
}
