
'use client';

import { useState, useCallback, useReducer, useEffect, useMemo } from 'react';
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
  Loader2, Send,
  CheckCircle,
  Phone,
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

import { createRideRequest, updateRideStatus } from '@/services/rideService';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { getProfileByIdAndRole } from '@/services/profileService';
import { sendMessage } from '@/services/chatService';
import { getVehicleById } from '@/services/vehicleService';
import { getExchangeRate } from '@/services/currencyService';

import type { UserProfile, Message, RideRequest, Vehicle } from '@/types';

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
  activeRideId: string | null;
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
  | { type: 'CONFIRM_PAYMENT'; payload: string }
  | { type: 'DRIVER_FOUND'; payload: { driverId: string, vehicleId: string } }
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
  activeRideId: null,
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
        case 'CONFIRM_PAYMENT': return { ...state, step: 'searching', activeRideId: action.payload };
        case 'DRIVER_FOUND': return { ...state, step: 'driver_enroute' };
        case 'DRIVER_ARRIVED': return { ...state, step: 'driver_arrived' };
        case 'TRIP_START': return { ...state, step: 'trip_inprogress' };
        case 'TRIP_FINISH': return { ...state, step: 'rating' };
        case 'CANCEL_RIDE': return { ...initialState, origin: state.origin, activeRideId: null };
        case 'RESET': return { ...initialState, origin: state.origin };
        default: return state;
    }
}


export default function RequestTransportPage() {
  const { toast } = useToast();
  const { language, t, user } = useAppContext();
  const { formatCurrency } = useCurrency(language.value);
  const { reverseGeocode, isLoaded } = useGeocoding();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [assignedDriverProfile, setAssignedDriverProfile] = useState<UserProfile | null>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const { step, origin, destination, driverPosition, directions, selectedService, selectedPayment, selectingField, rating, tip, activeRideId } = state;

  const [convertedPrices, setConvertedPrices] = useState<Record<string, number | null>>({});
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  
  const paymentMethods = useMemo(() => [
    {id: 'wallet', icon: Wallet, label: 'payment_wallet', value: formatCurrency(user?.balance || 0)},
    {id: 'card', icon: CreditCard, label: 'payment_card', value: 'credit_card_value'},
    {id: 'pix', icon: Landmark, label: 'payment_pix', value: ''},
    {id: 'mbway', icon: Landmark, label: 'payment_mbway', value: ''},
    {id: 'cash', icon: Landmark, label: 'payment_cash', value: ''},
  ], [user?.balance, formatCurrency]);

  const serviceCategories = useMemo(() => [
    { id: 'economico', icon: Car, title: t('transport_service_economic_title'), description: t('transport_service_economic_desc'), price: 6.50, eta: t('eta_5min') },
    { id: 'smart', icon: Car, title: t('transport_service_smart_title'), description: t('transport_service_smart_desc'), price: 8.00, eta: t('eta_5min') },
    { id: 'executivo', icon: Briefcase, title: t('transport_service_executive_title'), description: t('transport_service_executive_desc'), price: 15.00, eta: t('eta_4min') },
    { id: 'van', icon: Users, title: t('transport_service_van_title'), description: t('transport_service_van_desc'), price: 18.00, eta: t('eta_8min') },
    { id: 'pet', icon: Dog, title: t('transport_service_pet_title'), description: t('transport_service_pet_desc'), price: 10.00, eta: t('eta_6min') }
  ], [t]);

  useEffect(() => {
    async function fetchConvertedPrices() {
        setIsPriceLoading(true);
        const userCurrency = language.currency.code;
        const baseCurrency = 'EUR'; // Assuming all base prices are in EUR

        if (userCurrency === baseCurrency) {
            const prices = Object.fromEntries(serviceCategories.map(s => [s.id, s.price]));
            setConvertedPrices(prices);
            setIsPriceLoading(false);
            return;
        }

        const rate = await getExchangeRate(baseCurrency, userCurrency);
        if (rate) {
            const prices = Object.fromEntries(
                serviceCategories.map(s => [s.id, s.price * rate])
            );
            setConvertedPrices(prices);
        } else {
            const prices = Object.fromEntries(serviceCategories.map(s => [s.id, null]));
            setConvertedPrices(prices);
            toast({ title: "Erro de Conversão", description: "Não foi possível obter as taxas de câmbio.", variant: "destructive" });
        }
        setIsPriceLoading(false);
    }
    fetchConvertedPrices();
  }, [language.currency.code, serviceCategories, toast]);


  useEffect(() => {
    if (!activeRideId) return;

    const rideDocRef = doc(db, 'rideRequests', activeRideId);
    const unsubscribeRide = onSnapshot(rideDocRef, async (docSnap) => {
        if (docSnap.exists()) {
            const rideData = docSnap.data() as RideRequest;
            if (rideData.driverId && !assignedDriverProfile) {
                const profile = await getProfileByIdAndRole(rideData.driverId, 'driver');
                setAssignedDriverProfile(profile);
            }
            if (rideData.vehicleId && !assignedVehicle) {
                const vehicleData = await getVehicleById(rideData.vehicleId);
                setAssignedVehicle(vehicleData);
            }

            if (rideData.driverId && rideData.vehicleId && state.step === 'searching') {
                dispatch({ type: 'DRIVER_FOUND', payload: { driverId: rideData.driverId, vehicleId: rideData.vehicleId } });
            }
            
            if (rideData.status === 'at_pickup') dispatch({ type: 'DRIVER_ARRIVED' });
            else if (rideData.status === 'in_progress') dispatch({ type: 'TRIP_START' });
            else if (rideData.status === 'completed') dispatch({ type: 'TRIP_FINISH' });
            else if (rideData.status === 'cancelled') dispatch({ type: 'CANCEL_RIDE' });
        }
    });

    const messagesQuery = query(collection(db, 'messages'), where('rideId', '==', activeRideId), orderBy('timestamp', 'asc'));
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(newMessages);
    });

    return () => {
        unsubscribeRide();
        unsubscribeMessages();
    };
}, [activeRideId, state.step, assignedDriverProfile, assignedVehicle]);


  const handleRequestRide = () => {
      if(!origin.text || !destination.text || !origin.coords || !destination.coords) {
          toast({ title: t('error_title'), description: t('error_select_origin_destination'), variant: "destructive" });
          return;
      }
    dispatch({ type: 'REQUEST_RIDE' });
    handleDirections(origin.coords, destination.coords);
  };
  
  const handleConfirm = async () => {
    if (!user || !user.id) {
        toast({ title: t('error_title'), description: 'User not authenticated.', variant: "destructive" });
        return;
    }
    try {
        const docRef = await createRideRequest(user.id, origin, destination, selectedService as any);
        dispatch({ type: 'CONFIRM_PAYMENT', payload: docRef.id });
        toast({
            title: t('searching_driver_title'),
            description: t('searching_driver_desc'),
        });
    } catch(error) {
        console.error('Error creating ride request:', error);
        toast({ title: t('error_title'), description: t('error_request_failed'), variant: "destructive" });
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult, field: 'origin' | 'destination') => {
      if(place.geometry?.location){
        const coords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        const address = place.formatted_address || place.name || '';
        if(field === 'origin') dispatch({ type: 'SET_ORIGIN', payload: { text: address, coords } });
        if(field === 'destination') dispatch({ type: 'SET_DESTINATION', payload: { text: address, coords } });
        dispatch({ type: 'SET_SELECTING_FIELD', payload: null });
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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                const address = await reverseGeocode(coords);
                dispatch({ type: 'SET_ORIGIN', payload: { text: address, coords } });
            })
        }
    }, [reverseGeocode]);

    useEffect(() => {
        if (isLoaded && !origin.text) {
            handleUseCurrentLocation();
        }
    }, [isLoaded, origin.text, handleUseCurrentLocation]);


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
  
  const handleRating = async () => {
    if (!activeRideId) return;
    toast({ title: t('rating_sent_title'), description: t('rating_sent_desc') });
    dispatch({ type: 'RESET' });
    setAssignedDriverProfile(null);
    setAssignedVehicle(null);
    setMessages([]);
  }
  
  const handleCancelRide = async () => {
    if (!activeRideId) return;
    await updateRideStatus(activeRideId, 'cancelled');
    toast({ title: t('ride_cancelled_title'), description: t('ride_cancelled_desc') });
    setAssignedDriverProfile(null);
    setAssignedVehicle(null);
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !activeRideId || !user?.id) return;
    try {
        await sendMessage(activeRideId, user.id, currentMessage);
        setCurrentMessage('');
    } catch (error) {
        console.error('Error sending message:', error);
        toast({ title: t('error_title'), description: t('error_sending_message'), variant: "destructive" });
    }
  };


  useEffect(() => {
    if (step === 'driver_enroute' && origin.coords) {
        handleDirections(driverPosition, origin.coords);
    } else if (step === 'trip_inprogress' && origin.coords && destination.coords) {
        handleDirections(driverPosition, destination.coords);
    }
  }, [step, origin.coords, destination.coords, driverPosition, handleDirections]);
  
  const servicePrice = convertedPrices[selectedService] ?? 0;
  
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
                                onPlaceSelect={(place: google.maps.places.PlaceResult) => handlePlaceSelect(place, 'destination')}
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
                        service={{...service, price: convertedPrices[service.id] ?? service.price}}
                        isSelected={selectedService === service.id}
                        onSelect={() => dispatch({ type: 'SELECT_SERVICE', payload: service.id })}
                        isLoading={isPriceLoading}
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
                            <span>{isPriceLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : formatCurrency(servicePrice)}</span>
                        </div>
                        <Button size="lg" className="w-full text-lg mt-4" onClick={handleConfirm} disabled={isPriceLoading}>
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
         case 'trip_inprogress':
            return (
                 <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                            {step === 'driver_enroute' ? <CheckCircle className="h-10 w-10 text-primary" /> : <Car className="h-10 w-10 text-primary" />}
                        </div>
                        <CardTitle className="font-headline">{step === 'driver_enroute' ? t('driver_enroute_title') : t('trip_inprogress_title')}</CardTitle>
                        <CardDescription>{step === 'driver_enroute' ? t('driver_enroute_desc', { name: assignedDriverProfile?.name || '...', time: 5 }) : t('trip_inprogress_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Separator />
                         {assignedDriverProfile && assignedVehicle ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage src={assignedDriverProfile.avatarUrl} data-ai-hint="person face" />
                                        <AvatarFallback>{assignedDriverProfile.name?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">{assignedDriverProfile.name}</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold">{assignedDriverProfile.rating?.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                         {assignedDriverProfile.phone && <Button size="icon" variant="outline"><Phone /></Button>}
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-accent text-center">
                                    <p className="font-bold text-lg">{assignedVehicle.make} {assignedVehicle.model}</p>
                                    <p className="font-mono text-muted-foreground text-sm">{assignedVehicle.plate}</p>
                                </div>
                            </>
                        ) : <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin"/></div>}
                        
                        <div className="h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                            {messages.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm py-4">{t('chat_no_messages')}</p>
                            ) : (
                                messages.map((msg: Message) => {
                                    const senderProfile = msg.senderId === user?.id ? user : assignedDriverProfile;
                                    const isCurrentUser = msg.senderId === user?.id;
                                    return (
                                        <div key={msg.id} className={cn('flex items-start gap-2', isCurrentUser ? 'flex-row-reverse' : '')}>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={senderProfile?.avatarUrl} />
                                                <AvatarFallback>{senderProfile?.name?.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div className={cn('rounded-lg p-2 max-w-[80%]', isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-accent')}>
                                                <p className="text-sm">{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <form onSubmit={handleSendMessage} className="mt-2 space-y-2">
                            <Label htmlFor="chat-input" className="sr-only">{t('chat_label')}</Label>
                            <div className="flex gap-2">
                                <Textarea id="chat-input" placeholder={t('chat_placeholder')} value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} />
                                <Button type="submit" disabled={!currentMessage.trim()}><Send /></Button>
                            </div>
                        </form>

                    </CardContent>
                    <CardFooter>
                         <Button variant="destructive" className="w-full" onClick={handleCancelRide}>
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

  if (!isLoaded) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 md:h-[calc(100vh-10rem)]">
        <div className="md:col-span-2 rounded-lg bg-muted flex items-center justify-center min-h-[400px] md:min-h-0 relative overflow-hidden">
             <Map onMapLoad={() => {}} onMapClick={handleMapClick}>
                {origin.coords && step !== 'rating' && <MarkerF position={origin.coords} />}
                {destination.coords && step !== 'rating' && <MarkerF position={destination.coords} />}
                {(step === 'driver_enroute' || step === 'trip_inprogress') && driverPosition && (
                     <MarkerF position={driverPosition} icon={{ url: '/car.svg' }} />
                )}
                 {step === 'driver_arrived' && origin.coords && (
                     <MarkerF position={origin.coords} icon={{ url: '/car.svg' }} />
                )}
                {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: 'hsl(var(--primary))',
                                strokeWeight: 4,
                            },
                        }}
                    />
                )}
            </Map>
        </div>
        <div className="md:col-span-1 md:overflow-y-auto">
            {renderContent()}
        </div>
    </div>
  );
}

