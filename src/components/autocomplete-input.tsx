
'use client';
import { useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useGoogleMaps } from '@/hooks/use-google-maps';

interface AutocompleteInputProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  value: string;
  placeholder?: string;
  onClear: () => void;
}

export default function AutocompleteInput({ onPlaceSelect, value, placeholder, onClear }: AutocompleteInputProps) {
  const { isLoaded } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  useEffect(() => {
    if (!isLoaded || typeof window.google === 'undefined' || !inputRef.current) return;
    if (autocompleteRef.current) return; // Prevent re-initialization

    const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
        inputElement: inputRef.current,
        types: ['address'],
        componentRestrictions: { country: 'pt' },
    });
    autocompleteRef.current = autocompleteElement;
    
    const listener = autocompleteElement.addEventListener('gmp-placeselect', (event) => {
        const place = (event as CustomEvent).detail.place;
        if (place) {
            onPlaceSelect(place as google.maps.places.PlaceResult);
        }
    });

    return () => {
        if (listener) {
          // The event listener on the custom element doesn't have a remove method, so we handle it this way
        }
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
