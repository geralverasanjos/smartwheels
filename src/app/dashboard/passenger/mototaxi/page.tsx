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
  type LucideProps,
  Bike,
  Box,
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

const ScooterIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5.5 17.5a2.5 2.5 0 0 1-5 0" />
    <path d="M16 17.5a2.5 2.5 0 0 0 5 0" />
    <path d="M.5 17.5H3l2-7 6-1.5-4-5.5 4 1h3l2 3" />
    <path d="m14 6 2-3" />
  </svg>
);

const FastMotorcycleIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="6" cy="18" r="3" />
    <circle cx="19" cy="18" r="3" />
    <path d="M12 18h-2" />
    <path d="M19 15h-4l-2.5-4" />
    <path d="m14 4-2 3h3l2-3" />
    <path d="m12 8 2-3" />
  </svg>
);

const TukTukIcon = (props: LucideProps) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M11 18V8" />
        <path d="M21 18h-4.83a.5.5 0 0 0-.49.58l.64 2.87c.05.21.26.35.48.35h3.7a.5.5 0 0 0 .5-.5V18Z"/>
        <path d="M9 18H3.5A1.5 1.5 0 0 1 2 16.5v-7.25c0-.44.2-.86.53-1.12l3-2.5a1.49 1.49 0 0 1 1.44-.13L11 7" />
        <path d="M11 7h10v1.5a1.5 1.5 0 0 1-1.5 1.5H11" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
    </svg>
);


const serviceCategories = [
  { id: 'moto_economica', icon: ScooterIcon, title: 'Moto Econômica', description: 'Viagens rápidas e baratas.', price: 4.50, eta: '~5 min' },
  { id: 'moto_rapida', icon: FastMotorcycleIcon, title: 'Moto Rápida', description: 'Menos tempo no trânsito.', price: 6.00, eta: '~4 min' },
  { id: 'moto_bau', icon: Box, title: 'Moto com Baú', description: 'Leve um volume consigo.', price: 7.00, eta: '~6 min' },
  { id: 'tuk_tuk', icon: TukTukIcon, title: 'Tuk-Tuk', description: 'Passeios para até 2 pessoas.', price: 10.00, eta: '~8 min' }
];

const paymentMethods = [
    {id: 'wallet', icon: Wallet, label: 'Carteira SmartWheels', value: '€ 37,50'},
    {id: 'card', icon: CreditCard, label: '**** 1234', value: 'Crédito'},
    {id: 'pix', icon: Landmark, label: 'PIX', value: ''},
    {id: 'mbway', icon: Landmark, label: 'MB WAY', value: ''},
    {id: 'cash', icon: Landmark, label: 'Dinheiro', value: ''},
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
  origin: { text: 'Minha Localização Atual', coords: null },
  destination: { text: '', coords: null },
  driverPosition: DRIVER_INITIAL_POSITION,
  directions: null,
  selectedService: 'moto_economica',
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


export default function PassengerMotoTaxiPage() {
  const { toast } = useToast();
  const { language, t } = useAppContext();
  const { formatCurrency } = useCurrency(language.value);
  const { reverseGeocode } = useGeocoding();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, origin, destination, driverPosition, directions, selectedService, selectedPayment, selectingField, rating, tip } = state;
  
  useEffect(() => {
    handleUseCurrentLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestRide = () => {
      if(!origin.text || !destination.text || !origin.coords || !destination.coords) {
          toast({ title: "Erro", description: "Por favor, selecione uma origem e um destino válidos.", variant: "destructive" });
          return;
      }
    dispatch({ type: 'REQUEST_RIDE' });
    handleDirections(origin.coords, destination.coords);
  };
  
  const handleConfirm = () => {
    dispatch({ type: 'CONFIRM_PAYMENT' });
    toast({
      title: 'Procurando Motorista...',
      description: 'Sua solicitação foi enviada. Estamos procurando o motorista mais próximo.',
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
          }, (error) => {
              console.error("Geolocation error:", error);
              toast({ title: "Erro de Localização", description: "Não foi possível obter a sua localização atual.", variant: "destructive" });
          })
      }
  }, [reverseGeocode, map, toast]);

  const handleSelectOnMap = (field: 'origin' | 'destination') => {
    dispatch({ type: 'SET_SELECTING_FIELD', payload: field });
    toast({
        title: "Selecione no mapa",
        description: `Clique no mapa para definir o local de ${field === 'origin' ? 'partida' : 'destino'}.`,
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
    toast({ title: 'Avaliação Enviada', description: 'Obrigado pelo seu feedback!' });
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
                  <CardTitle className="font-headline text-2xl">Onde vamos?</CardTitle>
                  <CardDescription>
                    Insira os locais de partida e chegada.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="origin">Origem</Label>
                        <div className="flex gap-2">
                            <Button variant="outline" className="w-full justify-start" onClick={handleUseCurrentLocation}>
                                <LocateFixed className="mr-2 h-4 w-4" />
                                {origin.text || "Minha Localização Atual"}
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleSelectOnMap('origin')}><MapPin className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="destination">Destino</Label>
                        <div className="flex gap-2">
                            <AutocompleteInput 
                                onPlaceSelect={(place) => handlePlaceSelect(place, 'destination')}
                                value={destination.text}
                                placeholder='Ex: Av. da Liberdade, 100, Lisboa'
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
                    Solicitar Corrida
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
                    Selecione uma categoria
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
                    Pedir {serviceCategories.find(s => s.id === selectedService)?.title} - {formatCurrency(servicePrice)}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => dispatch({ type: 'SET_STEP', payload: 'address' })}>
                    Voltar
                  </Button>
                </CardFooter>
              </Card>
            );
          case 'payment':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Pagamento</CardTitle>
                        <CardDescription>Selecione o método de pagamento</CardDescription>
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
                                        <p className="font-bold">{method.label}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{method.value}</p>
                                </div>
                            )
                        })}
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Separator className="mb-4" />
                        <div className="w-full flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(servicePrice)}</span>
                        </div>
                        <Button size="lg" className="w-full text-lg mt-4" onClick={handleConfirm}>
                            Confirmar Corrida
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => dispatch({ type: 'SET_STEP', payload: 'service' })}>
                            Voltar
                        </Button>
                    </CardFooter>
                </Card>
            );
         case 'searching':
            return (
                <Card className="flex flex-col items-center justify-center h-full text-center">
                    <CardContent className="p-8">
                        <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary mb-6" />
                        <h2 className="text-2xl font-semibold font-headline">Procurando motorista...</h2>
                        <p className="text-muted-foreground mt-2">Por favor, aguarde enquanto conectamos você ao motorista mais próximo.</p>
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
                        <CardTitle className="font-headline">Motorista a Caminho!</CardTitle>
                        <CardDescription>O seu motorista, Carlos, está a 5 minutos de distância.</CardDescription>
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
                            <p className="font-bold text-lg">Honda PCX</p>
                            <p className="font-mono text-muted-foreground text-sm">ABC-1234</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button variant="destructive" className="w-full" onClick={() => dispatch({ type: 'CANCEL_RIDE' })}>
                           <X className="mr-2 h-4 w-4" /> Cancelar Viagem
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
                  <CardTitle className="font-headline">O seu motorista chegou!</CardTitle>
                  <CardDescription>Por favor, entre no veículo para iniciar a sua viagem.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    <PlayCircle className="mr-2" /> Aguardando início da viagem...
                  </Button>
                </CardContent>
              </Card>
            );
         case 'trip_inprogress':
            return (
                <Card>
                    <CardHeader className="text-center">
                         <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                            <Bike className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle>Viagem em Andamento</CardTitle>
                        <CardDescription>Aproveite sua viagem!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-sm text-muted-foreground">Destino: {destination.text}</p>
                    </CardContent>
                </Card>
            )
        case 'rating':
            return (
                 <Card>
                    <CardHeader className="text-center">
                        <ThumbsUp className="mx-auto h-10 w-10 text-primary mb-4" />
                        <CardTitle>Avalie sua Viagem</CardTitle>
                        <CardDescription>Seu feedback nos ajuda a melhorar.</CardDescription>
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
                            <Label htmlFor="comment">Adicione um comentário (opcional)</Label>
                            <Textarea id="comment" placeholder="Deixe sua mensagem..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Adicione uma gorjeta (opcional)</Label>
                             <div className="flex gap-2">
                                {[0.5, 1, 2, 5].map(amount => (
                                    <Button key={amount} variant={tip === amount ? "default" : "outline"} onClick={() => dispatch({type: 'SET_TIP', payload: amount})}>
                                        {formatCurrency(amount)}
                                    </Button>
                                ))}
                                 <Button variant={tip === null ? "default" : "outline"} onClick={() => dispatch({type: 'SET_TIP', payload: null})}>
                                     Nenhuma
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleRating}>Enviar Avaliação</Button>
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
      </div>
      <div className="md:col-span-1 h-full overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
