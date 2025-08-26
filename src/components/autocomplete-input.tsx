
'use client';
import { useRef, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Input } from './ui/input';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface AutocompleteInputProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  value: string;
  placeholder?: string;
  onClear: () => void;
}

export default function AutocompleteInput({ onPlaceSelect, value, placeholder, onClear }: AutocompleteInputProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-autocomplete',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;
    if (autocompleteRef.current) return; // Prevent re-initialization

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'pt' },
    });
    autocompleteRef.current = autocomplete;
    
    const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            onPlaceSelect(place);
        }
    });

    return () => {
        if(listener) google.maps.event.removeListener(listener);
    }
  }, [isLoaded, onPlaceSelect]);
  
  return (
    <div className="relative w-full">
      <Input ref={inputRef} defaultValue={value} placeholder={placeholder} disabled={!isLoaded} />
      {value && (
         <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={onClear}>
            <X className="h-4 w-4" />
         </Button>
      )}
    </div>
  );
}
