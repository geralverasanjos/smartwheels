'use client';

import { useState, useCallback, useReducer, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map } from '@/components/map';
import {
  ArrowRight,
  Briefcase,
  Car,
  Dog,
  Users,
  CreditCard,
  Wallet,
  Landmark,
  MapPin,
  LocateFixed,
  Loader2,
  CheckCircle,
  Phone,
  MessageSquare,
  X,
  Star,
  PlayCircle,
  ThumbsUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/app-context';
import { useCurrency } from '@/lib/currency';
import ServiceCategoryCard from '@/components/service-category-card';
import { MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import AutocompleteInput from '@/components/autocomplete-input';
import { useGeocoding } from '@/hooks/use-geocoding';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useGoogleMaps } from '@/hooks/use-google-maps';


const paymentMethods = [
    {id: 'wallet', icon: Wallet, label: 'payment_wallet', value: '€ 37,50'},
    {id: 'card', icon: CreditCard, label: 'payment_card', value: 'credit_card_value'},
    {id: 'pix', icon: Landmark, label: 'payment_pix', value: ''},
    {id: 'mbway', icon: Landmark, label: 'payment_mbway', value: ''},
    {id: 'cash', icon: Landmark, label: 'payment_cash', value: ''},
];

type Address = {
    text: string;
    coords: google.maps.LatLngLiteral | null;
};

const DRIVER_INITIAL_POSITION = { lat: 38.72, lng: -9.15 };


type State = {
  step: 'address' | 'service' | 'payment' | 'searching' | 'driver_enroute' | 'driver_arrived' | 'trip_inprogress' | 'rating' | 'cancelled';
  origin: Address;
  destination: Address;
  driverPosition: { lat: number; lng: number };
  directions: google.maps.DirectionsResult | null;
  selectedService: string;
  selectedPayment: string;
  selectingField: 'origin' | 'destination' | null;
  rating: number;
  tip: number | null;
};

type Action =
  | { type: 'SET_STEP'; payload: State['step'] }
  | { type: 'SET_ORIGIN'; payload: Address }
  | { type: 'SET_DESTINATION'; payload: Address }
  | { type: 'SET_DRIVER_POSITION'; payload: { lat: number; lng: number } }
  | { type: 'SET_DIRECTIONS'; payload: google.maps.DirectionsResult | null }
  | { type: 'SELECT_SERVICE'; payload: string }
  | { type: 'SELECT_PAYMENT'; payload: string }
  | { type: 'SET_SELECTING_FIELD'; payload: State['selectingField'] }
  | { type: 'SET_RATING', payload: number }
  | { type: 'SET_TIP', payload: number | null }
  | { type: 'REQUEST_RIDE' }
  | { type: 'CONFIRM_PAYMENT' }
  | { type: 'DRIVER_ARRIVED' }
  | { type: 'TRIP_START' }
  | { type: 'TRIP_FINISH' }
  | { type: 'CANCEL_RIDE' }
  | { type: 'RESET' };

const initialState: State = {
  step: 'address',
  origin: { text: '', coords: null },
  destination: { text: '', coords: null },
  driverPosition: DRIVER_INITIAL_POSITION,
  directions: null,
  selectedService: 'economico',
  selectedPayment: 'wallet',
  selectingField: null,
  rating: 0,
  tip: null,
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_STEP': return { ...state, step: action.payload };
        case 'SET_ORIGIN': return { ...state, origin: action.payload };
        case 'SET_DESTINATION': return { ...state, destination: action.payload };
        case 'SET_DRIVER_POSITION': return { ...state, driverPosition: action.payload };
        case 'SET_DIRECTIONS': return { ...state, directions: action.payload };
        case 'SELECT_SERVICE': return { ...state, selectedService: action.payload };
        case 'SELECT_PAYMENT': return { ...state, selectedPayment: action.payload };
        case 'SET_SELECTING_FIELD': return { ...state, selectingField: action.payload };
        case 'SET_RATING': return { ...state, rating: action.payload };
        case 'SET_TIP': return { ...state, tip: action.payload };
        case 'REQUEST_RIDE': return { ...state, step: 'service' };
        case 'CONFIRM_PAYMENT': return { ...state, step: 'searching' };
        case 'DRIVER_ARRIVED': return { ...state, step: 'driver_arrived' };
        case 'TRIP_START': return { ...state, step: 'trip_inprogress' };
        case 'TRIP_FINISH': return { ...state, step: 'rating' };
        case 'CANCEL_RIDE': return { ...initialState, origin: state.origin };
        case 'RESET': return { ...initialState, origin: state.origin };
        default: return state;
    }
}


export default function RequestTransportPage() {
  const { toast } = useToast();
  const { language, t } = useAppContext();
  const { formatCurrency } = useCurrency(language.value);
  const { geocode, reverseGeocode } = useGeocoding();
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, origin, destination, driverPosition, directions, selectedService, selectedPayment, selectingField, rating, tip } = state;

  const serviceCategories = [
    { id: 'economico', icon: Car, title: t('transport_service_economic_title'), description: t('transport_service_economic_desc'), price: 6.50, eta: t('eta_5min') },
    { id: 'smart', icon: Car, title: t('transport_service_smart_title'), description: t('transport_service_smart_desc'), price: 8.00, eta: t('eta_5min') },
    { id: 'executivo', icon: Briefcase, title: t('transport_service_executive_title'), description: t('transport_service_executive_desc'), price: 15.00, eta: t('eta_4min') },
    { id: 'van', icon: Users, title: t('transport_service_van_title'), description: t('transport_service_van_desc'), price: 18.00, eta: t('eta_8min') },
    { id: 'pet', icon: Dog, title: t('transport_service_pet_title'), description: t('transport_service_pet_desc'), price: 10.00, eta: t('eta_6min') }
  ];

  useEffect(() => {
    async function getInitialOriginCoords() {
      if (isLoaded && t && !origin.coords) {
          const initialAddress = t('initial_address');
          if (initialAddress !== 'initial_address') {
            try {
              const coords = await geocode(initialAddress);
              dispatch({ type: 'SET_ORIGIN', payload: { text: initialAddress, coords } });
            } catch (error) {
              console.error("Failed to geocode initial address:", error);
            }
          }
      }
    }
    getInitialOriginCoords();
  }, [isLoaded, geocode, t, origin.coords]);

  const handleRequestRide = () => {
      if(!origin.text || !destination.text || !origin.coords || !destination.coords) {
          toast({ title: t('error_title'), description: t('error_select_origin_destination'), variant: "destructive" });
          return;
      }
    dispatch({ type: 'REQUEST_RIDE' });
    handleDirections(origin.coords, destination.coords);
  };
  
  const handleConfirm = () => {
    dispatch({ type: 'CONFIRM_PAYMENT' });
    toast({
      title: t('searching_driver_title'),
      description: t('searching_driver_desc'),
    });
  };

  const handlePlaceSelect = async (place: google.maps.places.PlaceResult, field: 'origin' | 'destination') => {
      if(place.geometry?.location){
        const coords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        const address = place.formatted_address || place.name || '';
        if(field === 'origin') dispatch({ type: 'SET_ORIGIN', payload: { text: address, coords } });
        if(field === 'destination') dispatch({ type: 'SET_DESTINATION', payload: { text: address, coords } });
        dispatch({ type: 'SET_SELECTING_FIELD', payload: null });
        if(map) map.panTo(coords);
      }
  }

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (selectingField && e.latLng) {
        const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        const address = await reverseGeocode(coords);
        if(selectingField === 'origin') dispatch({ type: 'SET_ORIGIN', payload: { text: address, coords } });
        else if (selectingField === 'destination') dispatch({ type: 'SET_DESTINATION', payload: { text: address, coords } });
        dispatch({ type: 'SET_SELECTING_FIELD', payload: null });
    }
  }, [selectingField, reverseGeocode]);

  const handleUseCurrentLocation = useCallback(() => {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async (position) => {
            const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
            const address = await reverseGeocode(coords);
            dispatch({ type: 'SET_ORIGIN', payload: { text: address, coords } });
            if(map) map.panTo(coords);
        })
    }
}, [reverseGeocode, map]);

  const handleSelectOnMap = (field: 'origin' | 'destination') => {
    dispatch({ type: 'SET_SELECTING_FIELD', payload: field });
    toast({
        title: t('select_on_map_title'),
        description: t('select_on_map_desc', { field: field === 'origin' ? t('origin_label') : t('destination_label') }),
    })
  }

  const handleDirections = useCallback((origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) => {
    if (typeof window.google === 'undefined' || !origin || !destination) return;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
            dispatch({ type: 'SET_DIRECTIONS', payload: result });
        } else {
            console.error(`error fetching directions ${result}`);
        }
    });
  }, []);
  
  const handleRating = () => {
    toast({ title: t('rating_sent_title'), description: t('rating_sent_desc') });
    dispatch({ type: 'RESET' });
  }

  useEffect(() => {
    if (step === 'searching') {
        const searchTimeout = setTimeout(() => {
            dispatch({ type: 'SET_STEP', payload: 'driver_enroute' });
        }, 3000);
        return () => clearTimeout(searchTimeout);
    }
  }, [step]);
  
  useEffect(() => {
    if (step === 'driver_enroute' && origin.coords) {
        handleDirections(driverPosition, origin.coords);
    } else if (step === 'trip_inprogress' && origin.coords && destination.coords) {
        handleDirections(driverPosition, destination.coords);
    }
  }, [step, origin.coords, destination.coords, driverPosition, handleDirections]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const moveVehicle = (target: google.maps.LatLngLiteral, onArrival: () => void) => {
        return setInterval(() => {
            dispatch({
                type: 'SET_DRIVER_POSITION',
                payload: {
                    lat: driverPosition.lat + (target.lat - driverPosition.lat) * 0.1,
                    lng: driverPosition.lng + (target.lng - driverPosition.lng) * 0.1,
                },
            });

            const distance = Math.sqrt(Math.pow(driverPosition.lat - target.lat, 2) + Math.pow(driverPosition.lng - target.lng, 2));
            if (distance < 0.001) {
                onArrival();
            }
        }, 1000);
    }

    if (step === 'driver_enroute' && origin.coords) {
        interval = moveVehicle(origin.coords, () => dispatch({ type: 'DRIVER_ARRIVED' }));
    } else if (step === 'trip_inprogress' && destination.coords) {
         interval = moveVehicle(destination.coords, () => dispatch({ type: 'TRIP_FINISH' }));
    }

    if (step === 'driver_arrived') {
      const startTimeout = setTimeout(() => {
        if (state.step === 'driver_arrived') {
          dispatch({ type: 'TRIP_START' });
        }
      }, 4000);
      return () => clearTimeout(startTimeout);
    }

    return () => clearInterval(interval);
  }, [step, driverPosition, origin.coords, destination.coords, state.step]);


  const servicePrice = serviceCategories.find(s => s.id === selectedService)?.price || 0;
  
  const getVehicleIcon = () => {
    if (typeof window === 'undefined' || !window.google) return null;
    return {
        path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
        fillColor: 'hsl(var(--primary))',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: 'hsl(var(--background))',
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 12)
    };
  };

  const renderContent = () => {
      switch(step) {
          case 'address':
            return (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">{t('where_to_title')}</CardTitle>
                  <CardDescription>
                    {t('where_to_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="origin">{t('origin_label')}</Label>
                        <div className="flex gap-2">
                             <AutocompleteInput 
                                onPlaceSelect={(place) => handlePlaceSelect(place, 'origin')}
                                value={origin.text}
                                placeholder={t('origin_placeholder')}
                                onClear={() => dispatch({ type: 'SET_ORIGIN', payload: { text: '', coords: null } })}
                            />
                            <Button variant="outline" size="icon" onClick={() => handleSelectOnMap('origin')}><MapPin className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="destination">{t('destination_label')}</Label>
                        <div className="flex gap-2">
                            <AutocompleteInput 
                                onPlaceSelect={(place) => handlePlaceSelect(place, 'destination')}
                                value={destination.text}
                                placeholder={t('destination_placeholder')}
                                onClear={() => dispatch({ type: 'SET_DESTINATION', payload: { text: '', coords: null } })}
                            />
                            <Button variant="outline" size="icon" onClick={() => handleSelectOnMap('destination')}><MapPin className="h-4 w-4"/></Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={handleRequestRide}
                    disabled={!origin.coords || !destination.coords}
                  >
                    {t('request_ride_button')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          case 'service':
            return (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    {t('select_service_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  {serviceCategories.map((service) => (
                    <ServiceCategoryCard
                        key={service.id}
                        service={service}
                        isSelected={selectedService === service.id}
                        onSelect={() => dispatch({ type: 'SELECT_SERVICE', payload: service.id })}
                    />
                  ))}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                   <Button size="lg" className="w-full text-lg" onClick={() => dispatch({ type: 'SET_STEP', payload: 'payment' })}>
                    {t('continue_button')}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => dispatch({ type: 'SET_STEP', payload: 'address' })}>
                    {t('back_button')}
                  </Button>
                </CardFooter>
              </Card>
            );
          case 'payment':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('payment_title')}</CardTitle>
                        <CardDescription>{t('payment_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {paymentMethods.map(method => {
                            const Icon = method.icon;
                            return (
                                <div 
                                    key={method.id} 
                                    onClick={() => dispatch({ type: 'SELECT_PAYMENT', payload: method.id })}
                                    className={cn("flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors",
                                        selectedPayment === method.id ? 'border-primary ring-2 ring-primary' : 'hover:bg-accent'
                                    )}
                                >
                                    <Icon className="w-6 h-6 text-muted-foreground"/>
                                    <div className="flex-1">
                                        <p className="font-bold">{t(method.label as any)}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{method.id === 'card' ? t(method.value as any) : method.value}</p>
                                </div>
                            )
                        })}
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Separator className="mb-4" />
                        <div className="w-full flex justify-between text-lg font-bold">
                            <span>{t('total_label')}:</span>
                            <span>{formatCurrency(servicePrice)}</span>
                        </div>
                        <Button size="lg" className="w-full text-lg mt-4" onClick={handleConfirm}>
                            {t('confirm_ride_button')}
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => dispatch({ type: 'SET_STEP', payload: 'service' })}>
                            {t('back_button')}
                        </Button>
                    </CardFooter>
                </Card>
            );
         case 'searching':
            return (
                <Card className="flex flex-col items-center justify-center h-full text-center">
                    <CardContent className="p-8">
                        <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary mb-6" />
                        <h2 className="text-2xl font-semibold font-headline">{t('searching_driver_title')}</h2>
                        <p className="text-muted-foreground mt-2">{t('searching_driver_desc')}</p>
                    </CardContent>
                </Card>
            );
         case 'driver_enroute':
            return (
                 <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                            <CheckCircle className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="font-headline">{t('driver_enroute_title')}</CardTitle>
                        <CardDescription>{t('driver_enroute_desc', { name: 'Carlos', time: 5 })}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Separator />
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person face" />
                                <AvatarFallback>CS</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-bold text-lg">Carlos Silva</p>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-semibold">4.9</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                 <Button size="icon" variant="outline"><Phone /></Button>
                                 <Button size="icon" variant="outline"><MessageSquare /></Button>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-accent text-center">
                            <p className="font-bold text-lg">Mercedes-Benz E-Class</p>
                            <p className="font-mono text-muted-foreground text-sm">ABC-1234</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button variant="destructive" className="w-full" onClick={() => dispatch({ type: 'CANCEL_RIDE' })}>
                           <X className="mr-2 h-4 w-4" /> {t('cancel_ride_button')}
                        </Button>
                    </CardFooter>
                </Card>
            );
          case 'driver_arrived':
            return (
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                    <CheckCircle className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline">{t('driver_arrived_title')}</CardTitle>
                  <CardDescription>{t('driver_arrived_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    <PlayCircle className="mr-2" /> {t('awaiting_trip_start_button')}
                  </Button>
                </CardContent>
              </Card>
            );
         case 'trip_inprogress':
            return (
                <Card>
                    <CardHeader className="text-center">
                         <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                            <Car className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle>{t('trip_inprogress_title')}</CardTitle>
                        <CardDescription>{t('trip_inprogress_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-sm text-muted-foreground">{t('destination_label')}: {destination.text}</p>
                    </CardContent>
                </Card>
            )
        case 'rating':
            return (
                 <Card>
                    <CardHeader className="text-center">
                        <ThumbsUp className="mx-auto h-10 w-10 text-primary mb-4" />
                        <CardTitle>{t('rating_title')}</CardTitle>
                        <CardDescription>{t('rating_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center gap-2">
                             {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                key={star}
                                className={cn(
                                    "w-10 h-10 cursor-pointer",
                                    rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
                                )}
                                onClick={() => dispatch({ type: 'SET_RATING', payload: star })}
                                />
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="comment">{t('rating_comment_label')}</Label>
                            <Textarea id="comment" placeholder={t('rating_comment_placeholder')} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('rating_tip_label')}</Label>
                             <div className="flex gap-2">
                                {[0.5, 1, 2, 5].map(amount => (
                                    <Button key={amount} variant={tip === amount ? "default" : "outline"} onClick={() => dispatch({type: 'SET_TIP', payload: amount})}>
                                        {formatCurrency(amount)}
                                    </Button>
                                ))}
                                 <Button variant={tip === null ? "default" : "outline"} onClick={() => dispatch({type: 'SET_TIP', payload: null})}>
                                     {t('rating_no_tip_button')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleRating}>{t('rating_submit_button')}</Button>
                    </CardFooter>
                </Card>
            )
        default:
            return null;
      }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <div className="md:col-span-2 rounded-lg bg-muted flex items-center justify-center min-h-[400px] md:min-h-0 relative overflow-hidden">
        {isLoaded ? (
            <Map onMapLoad={setMap} onMapClick={handleMapClick}>
                {origin.coords && step !== 'rating' && <MarkerF position={origin.coords} label="O"/>}
                {destination.coords && step !== 'rating' && <MarkerF position={destination.coords} label="D"/>}
                {(step === 'driver_enroute' || step === 'trip_inprogress') && driverPosition && (
                     <MarkerF position={driverPosition} icon={getVehicleIcon() as google.maps.Icon | null} />
                )}
                 {step === 'driver_arrived' && origin.coords && (
                     <MarkerF position={origin.coords} icon={getVehicleIcon() as google.maps.Icon | null} />
                )}
                {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: 'hsl(var(--primary))', strokeWeight: 6 } }} />}
            </Map>
        ) : (
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
        )}
      </div>
      <div className="md:col-span-1 h-full overflow-y-auto">
        {isLoaded ? renderContent() : (
            <Card className="h-full flex flex-col items-center justify-center">
                <CardContent>
                    <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
