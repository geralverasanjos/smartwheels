
'use client';

import { useState, useEffect, useReducer, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Package, User, Star, Loader2, PlayCircle, ShieldCheck, CheckCircle, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Map } from '@/components/map';
import { Button } from '@/components/ui/button'; 
import { useCurrency } from '@/lib/currency';
import { MarkerF, DirectionsRenderer, HeatmapLayer } from '@react-google-maps/api';
import { useAppContext } from '@/contexts/app-context';
import { TranslationKeys } from '@/lib/i18n';
import { saveTripHistory } from '@/services/historyService';
import { getDriverProfile, getProfileByIdAndRole } from '@/services/profileService';
import { getPendingRideRequests, updateRideStatus, acceptRideRequest } from '@/services/rideService';
import { getVehicleById } from '@/services/vehicleService';
import type { Trip, UserProfile, Vehicle, Message, RideRequest } from '@/types';
import { sendMessage } from '@/services/chatService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const DRIVER_INITIAL_POSITION = { lat: 38.72, lng: -9.15 };
const PASSENGER_PICKUP = { lat: 38.74, lng: -9.15 };
const TRIP_DESTINATION = { lat: 38.725, lng: -9.13 };

const tripData: Partial<Trip> = {
    passengerName: 'Ana Sousa',
    value: 12.50,
    originAddress: 'Av. da Liberdade, Lisboa',
    destinationAddress: 'Rua Augusta, Lisboa',
    distance: 5.2, // km
    duration: 15, // minutes
};

const mockStands = [
    { id: 'stand_1', name: 'Aeroporto - Chegadas', location: { lat: 38.768, lng: -9.128 } },
    { id: 'stand_2', name: 'Estação do Oriente', location: { lat: 38.767, lng: -9.099 } },
    { id: 'stand_3', name: 'Praça do Comércio', location: { lat: 38.707, lng: -9.136 } },
];

const nearbyDrivers = [
  { id: 'driver_nearby_1', position: { lat: 38.722, lng: -9.155 } },
  { id: 'driver_nearby_2', position: { lat: 38.718, lng: -9.145 } },
  { id: 'driver_nearby_3', position: { lat: 38.725, lng: -9.158 } },
];

const heatmapRawData = [
  { lat: 38.71, lng: -9.14 },
  { lat: 38.712, lng: -9.142 },
  { lat: 38.715, lng: -9.138 },
  { lat: 38.711, lng: -9.141 },
  { lat: 38.708, lng: -9.139 },
  { lat: 38.73, lng: -9.16 },
  { lat: 38.733, lng: -9.158 },
];


type State = {
  isOnline: boolean;
  isSimulating: boolean;
  simulationStep: 'idle' | 'request' | 'enroute_to_pickup' | 'at_pickup' | 'enroute_to_destination' | 'at_destination' | 'ride_accepted' | 'trip_inprogress';
  vehiclePosition: { lat: number; lng: number };
  directions: google.maps.DirectionsResult | null;
  statusMessageKey: TranslationKeys;
};

type Action =
  | { type: 'TOGGLE_ONLINE'; payload: boolean }
  | { type: 'TOGGLE_SIMULATION' }
  | { type: 'START_SIMULATION'; payload: 'request' }
  | { type: 'ACCEPT_RIDE' }
  | { type: 'SIMULATION_STEP', payload: State['simulationStep'] } 
  | { type: 'DECLINE_RIDE' }
  | { type: 'ARRIVE_AT_PICKUP' }
  | { type: 'START_TRIP_TO_DESTINATION' }
  | { type: 'FINISH_RIDE' }
  | { type: 'SET_VEHICLE_POSITION'; payload: { lat: number; lng: number } }
  | { type: 'SET_DIRECTIONS'; payload: google.maps.DirectionsResult | null }
  | { type: 'SET_STATUS_MESSAGE_KEY', payload: TranslationKeys };
  
const getInitialState = (): State => ({
  isOnline: false,
  isSimulating: false,
  simulationStep: 'idle',
  vehiclePosition: DRIVER_INITIAL_POSITION,
  directions: null,
  statusMessageKey: 'driver_status_offline' as TranslationKeys,
});

function simulationReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'TOGGLE_ONLINE':
            return { ...getInitialState(), isOnline: action.payload, statusMessageKey: action.payload ? 'driver_status_waiting' : 'driver_status_offline' };
        case 'TOGGLE_SIMULATION':
            const isSimulating = !state.isSimulating;
            if (isSimulating && state.isOnline) {
                return {
                    ...state,
                    isSimulating,
                    simulationStep: 'request',
                    statusMessageKey: 'driver_status_new_request',
                };
            }
            return {
                ...state,
                isSimulating: false,
                simulationStep: 'idle',
                statusMessageKey: state.isOnline ? 'driver_status_waiting' : 'driver_status_offline',
            };
        case 'ACCEPT_RIDE':
            return { ...state, simulationStep: 'enroute_to_pickup', statusMessageKey: 'driver_status_pickup_enroute' };
        case 'DECLINE_RIDE':
            return { ...state, simulationStep: 'idle', statusMessageKey: 'driver_status_waiting' };
        case 'ARRIVE_AT_PICKUP':
            return { ...state, simulationStep: 'at_pickup', statusMessageKey: 'driver_status_pickup_arrived' };
        case 'START_TRIP_TO_DESTINATION':
            return { ...state, simulationStep: 'enroute_to_destination', statusMessageKey: 'driver_status_destination_enroute' };
        case 'FINISH_RIDE':
            return { ...getInitialState(), isOnline: state.isOnline, isSimulating: state.isSimulating, statusMessageKey: state.isOnline ? 'driver_status_waiting' : 'driver_status_offline' };
        case 'SIMULATION_STEP':
            return { ...getInitialState(), isOnline: state.isOnline, isSimulating: state.isSimulating, statusMessageKey: state.isOnline ? 'driver_status_waiting' : 'driver_status_offline'};
        case 'SET_VEHICLE_POSITION':
            return { ...state, vehiclePosition: action.payload };
        case 'SET_DIRECTIONS':
            return { ...state, directions: action.payload };
        case 'SET_STATUS_MESSAGE_KEY':
            return { ...state, statusMessageKey: action.payload };
        case 'START_SIMULATION':
            return { ...state, simulationStep: 'request', statusMessageKey: 'driver_status_new_request' };
        default:
            return state;
    }
}

export default function DriverDashboardPage() {
  const { t, user } = useAppContext();
  const { toast } = useToast();
  const [state, dispatch] = useReducer(simulationReducer, getInitialState());
  const { isOnline, isSimulating, simulationStep, vehiclePosition, directions, statusMessageKey } = state;
  const [driver, setDriver] = useState<UserProfile | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([]);
  const [assignedPassengerProfile, setAssignedPassengerProfile] = useState<UserProfile | null>(null);
  const [notifiedStand, setNotifiedStand] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<google.maps.LatLng[]>([]);

  const [services, setServices] = useState({ passengers: true, deliveries: true });
  const [queueMode, setQueueMode] = useState('stand');
  const { formatCurrency } = useCurrency();

  // Create heatmap data only on the client-side when google object is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
        setHeatmapData(heatmapRawData.map(point => new google.maps.LatLng(point.lat, point.lng)));
    }
  }, []);

  // Proximity check for taxi stands
  useEffect(() => {
    if (!isOnline || queueMode === 'global') return;

    const checkProximity = () => {
        const R = 6371; // Radius of the Earth in km
        mockStands.forEach(stand => {
            const dLat = (stand.location.lat - vehiclePosition.lat) * Math.PI / 180;
            const dLon = (stand.location.lng - vehiclePosition.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(vehiclePosition.lat * Math.PI / 180) * Math.cos(stand.location.lat * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c; // Distance in km

            if (distance < 0.5 && notifiedStand !== stand.id) { // 500 meters threshold
                setNotifiedStand(stand.id);
                toast({
                    title: t('toast_stand_nearby_title'),
                    description: t('toast_stand_nearby_desc', {standName: stand.name}),
                    duration: 5000,
                    action: (
                        <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => console.log('Accepted queue for', stand.name)}>{t('accept_button')}</Button>
                            <Button size="sm" variant="outline" onClick={() => console.log('Ignored queue for', stand.name)}>{t('ignore_button')}</Button>
                        </div>
                    )
                });
            }
        });
    }
    
    // Simulate position check every 10 seconds
    const intervalId = setInterval(checkProximity, 10000);
    return () => clearInterval(intervalId);
  }, [isOnline, vehiclePosition, t, toast, notifiedStand, queueMode]);


  // Fetch driver and vehicle data
  useEffect(() => {
    const fetchData = async () => {
        if (!user || !user.id) return;
        setLoading(true);
        const driverProfile = await getProfileByIdAndRole(user.id, 'driver');
        setDriver(driverProfile);
        if (driverProfile?.activeVehicleId) {
            const vehicleData = await getVehicleById(driverProfile.activeVehicleId);
            setVehicle(vehicleData);
        }
        setLoading(false);
    }
    fetchData();
  }, [user]);

    // Listen for pending ride requests
    useEffect(() => {
        if (!isOnline || activeRide) return;

        const rideRequestsRef = collection(db, 'rideRequests');
        const q = query(rideRequestsRef, where('status', '==', 'pending'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RideRequest));
            setPendingRequests(requests);
        });

        return () => unsubscribe();
    }, [isOnline, activeRide]);

    // Listen for changes in the active ride (e.g., status updates, new messages)
    useEffect(() => {
        if (!activeRide?.id) return;
    
        const rideDocRef = doc(db, 'rideRequests', activeRide.id);
        const unsubscribeRide = onSnapshot(rideDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const rideData = docSnap.data() as RideRequest;
            setActiveRide({ id: docSnap.id, ...rideData });
            
            // Update UI based on status
            switch(rideData.status) {
                case 'accepted':
                    dispatch({ type: 'ACCEPT_RIDE' });
                    break;
                case 'at_pickup':
                    dispatch({ type: 'ARRIVE_AT_PICKUP' });
                    break;
                case 'in_progress':
                    dispatch({ type: 'START_TRIP_TO_DESTINATION' });
                    break;
                case 'completed':
                case 'cancelled':
                    dispatch({ type: 'FINISH_RIDE' });
                    setActiveRide(null);
                    setMessages([]);
                    setAssignedPassengerProfile(null);
                    break;
            }

            if (rideData.passengerId && !assignedPassengerProfile) {
              const profile = await getProfileByIdAndRole(rideData.passengerId, 'passenger');
              setAssignedPassengerProfile(profile);
            }
          }
        });
    
        const messagesQuery = query(collection(db, 'messages'), where('rideId', '==', activeRide.id), orderBy('timestamp', 'asc'));
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(newMessages);
        });
    
        return () => {
          unsubscribeRide();
          unsubscribeMessages();
        };
      }, [activeRide?.id, assignedPassengerProfile]);


  const handleFinishRide = async () => {
    if (!driver || !vehicle || !activeRide) {
      toast({ title: t('error_title'), description: t('driver_finish_no_data'), variant: "destructive" });
      return;
    }

    const finalTripData: Omit<Trip, 'id'> = {
        type: 'trip',
        passengerName: assignedPassengerProfile?.name || 'N/A',
        date: new Date().toISOString(),
        value: tripData.value!, // This should come from the ride request
        status: 'completed',
        originAddress: activeRide.origin,
        destinationAddress: activeRide.destination,
        distance: tripData.distance!, // This should be calculated
        duration: tripData.duration!, // This should be calculated
        passengerId: activeRide.passengerId,
        vehicleId: vehicle.id,
        driverId: driver.id!,
    };
    try {
        await updateRideStatus(activeRide.id, 'completed');
        toast({ title: t('trip_completed_title'), description: t('trip_completed_desc') });
        await saveTripHistory(finalTripData);        
        
        // State will be reset by the useEffect listener
    } catch (error) {
        console.error("Failed to finish ride or save history:", error);
        toast({ title: t('error_title'), description: t('error_finish_ride_failed'), variant: "destructive" });
    }
  };
  
  const handleAcceptRequest = async (request: RideRequest) => {
    if (!driver || !driver.id || !driver.activeVehicleId) {
      toast({ title: t('error_title'), description: t('driver_accept_no_data'), variant: "destructive" });
      return;
    }

    try {
      await acceptRideRequest(request.id, driver.id, driver.activeVehicleId);
      setActiveRide(request); // Set the active ride to trigger useEffect listeners
      setPendingRequests([]); // Clear pending requests from UI
      toast({ title: t('request_accepted_title'), description: t('request_accepted_desc') });
    } catch (error) {
        console.error('Error accepting ride request:', error);
        toast({ title: t('error_title'), description: t('error_accept_ride_failed'), variant: "destructive" });
    }
  };
  
  const handleStartTrip = async () => {
      if (!activeRide?.id) {
          toast({ title: t('error_title'), description: t('driver_start_no_ride'), variant: "destructive" });
          return;
      }
      
      try {
          await updateRideStatus(activeRide.id, 'in_progress');
          toast({ title: t('trip_started_title'), description: t('trip_started_desc') });
          // State will be updated by the useEffect listener
      } catch (error) {
          console.error('Error starting trip:', error);
          toast({ title: t('error_title'), description: t('error_start_trip_failed'), variant: "destructive" });
      }
  }

  const handleCancelTrip = async () => {
    if (!activeRide?.id) {
      toast({ title: t('error_title'), description: t('driver_cancel_no_ride'), variant: "destructive" });
      return;
    }

    try {
      await updateRideStatus(activeRide.id, 'cancelled');
      toast({ title: t('ride_cancelled_title'), description: t('ride_cancelled_desc') });
       // State will be reset by the useEffect listener
    } catch (error) {
      console.error('Error cancelling trip:', error);
      toast({ title: t('error_title'), description: t('error_cancel_failed'), variant: "destructive" });
    }
  }

    const handleSendMessage = async () => {
        if (!currentMessage.trim() || !activeRide?.id || !driver?.id) return;
        try {
            await sendMessage(activeRide.id, driver.id, currentMessage);
            setCurrentMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast({ title: t('error_title'), description: t('error_sending_message'), variant: "destructive" });
        }
    };
  
  const handleDirections = useCallback((origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) => {
    if (typeof window.google === 'undefined') return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          dispatch({ type: 'SET_DIRECTIONS', payload: result });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }, []);

  const handleServiceChange = (service: keyof typeof services) => {
    setServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

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
  
    const getNearbyVehicleIcon = () => {
    if (typeof window === 'undefined' || !window.google) return null;
    return {
      path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
      fillColor: 'hsl(var(--secondary-foreground))',
      fillOpacity: 0.7,
      strokeWeight: 1,
      strokeColor: 'hsl(var(--background))',
      scale: 1.2,
      anchor: new window.google.maps.Point(12, 12)
    };
  };

  const getServiceTypeName = (serviceType: RideRequest['serviceType']) => {
    const keyMap: Record<RideRequest['serviceType'], TranslationKeys> = {
        'economico': 'transport_service_economic_title',
        'smart': 'transport_service_smart_title',
        'executivo': 'transport_service_executive_title',
        'van': 'transport_service_van_title',
        'pet': 'transport_service_pet_title',
        'delivery_moto': 'delivery_service_moto_title',
        'delivery_car': 'delivery_service_car_title',
        'delivery_van': 'delivery_service_van_title',
        'moto_economica': 'mototaxi_service_economic_title',
        'moto_rapida': 'mototaxi_service_fast_title',
        'moto_bau': 'mototaxi_service_box_title',
        'tuk_tuk': 'mototaxi_service_tuktuk_title'
    };
    return t(keyMap[serviceType] || (serviceType as any));
  }


  const renderPendingRequestsCard = () => {
    if (!isOnline || activeRide) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pending_requests_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground">{t('no_pending_requests')}</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <p className="font-semibold">{getServiceTypeName(request.serviceType)}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{t('from')}:</span> {request.origin}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{t('to')}:</span> {request.destination}
                  </p>
                  <Button size="sm" className="mt-4 w-full" onClick={() => handleAcceptRequest(request)}>{t('accept_button')}</Button>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const renderCurrentActionCard = () => {
    if (!activeRide) return null;

    const currentStep = activeRide.status;

    if (currentStep === 'accepted' || currentStep === 'at_pickup' || currentStep === 'in_progress') {
        return (
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                        <Car className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="font-headline">
                        {currentStep === 'accepted' && t('driver_enroute_title')}
                        {currentStep === 'at_pickup' && t('driver_pickup_title')}
                        {currentStep === 'in_progress' && t('trip_inprogress_title')}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 'accepted' && t('driver_enroute_desc', { name: assignedPassengerProfile?.name || 'Passageiro', time: 5 })}
                        {currentStep === 'at_pickup' && t('driver_pickup_desc')}
                        {currentStep === 'in_progress' && t('trip_inprogress_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                        {messages.length === 0 ? (
                            <p className="text-center text-muted-foreground">{t('chat_no_messages')}</p>
                        ) : (
                            messages.map((msg) => {
                                const senderProfile = msg.senderId === driver?.id ? driver : assignedPassengerProfile;
                                const isDriver = msg.senderId === driver?.id;
                                return (
                                    <div key={msg.id} className={`flex items-start gap-2 ${isDriver ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={senderProfile?.avatarUrl} />
                                            <AvatarFallback>{senderProfile?.name?.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className={`rounded-lg p-2 max-w-[80%] ${isDriver ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                                            <p className="font-semibold text-xs">{senderProfile?.name}</p>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="driver-chat-input">{t('chat_label')}</Label>
                        <div className="flex gap-2">
                            <Textarea id="driver-chat-input" placeholder={t('chat_placeholder')} value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} />
                            <Button onClick={handleSendMessage}>{t('send_button')}</Button>
                        </div>
                    </div>
                     <p className="text-center text-sm text-muted-foreground">{currentStep === 'in_progress' ? t('destination_label') : t('pickup_label')}: {currentStep === 'in_progress' ? activeRide.destination : activeRide.origin}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {currentStep === 'at_pickup' && (
                        <Button className="w-full" onClick={handleStartTrip}><PlayCircle className="mr-2" /> {t('driver_pickup_start_button')}</Button>
                    )}
                    {currentStep === 'in_progress' && (
                        <Button className="w-full" onClick={handleFinishRide}><CheckCircle className="mr-2" /> {t('end_trip_button')}</Button>
                    )}
                    {(currentStep === 'accepted' || currentStep === 'at_pickup' || currentStep === 'in_progress') && (
                         <Button variant="destructive" className="w-full" onClick={handleCancelTrip}><X className="mr-2"/> {t('cancel_trip_button')}</Button>
                    )}
                </CardFooter>
            </Card>
        );
    }
    return null;
  };


  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 md:h-[calc(100vh-10rem)]">
        <div className="md:col-span-2 rounded-lg bg-muted min-h-[400px] md:min-h-0 relative overflow-hidden">
            <Map>
              {isOnline && (
                <>
                    {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
                    <MarkerF position={vehiclePosition} icon={getVehicleIcon() as google.maps.Icon | null} />
                    {activeRide?.origin && <MarkerF position={{lat: 38.74, lng: -9.15}} label="P" />}
                    {activeRide?.destination && (simulationStep === 'enroute_to_destination' || simulationStep === 'trip_inprogress') && <MarkerF position={TRIP_DESTINATION} label="D" />}
                    {nearbyDrivers.map(nearby => (
                        <MarkerF key={nearby.id} position={nearby.position} icon={getNearbyVehicleIcon() as google.maps.Icon | null} />
                    ))}
                </>
              )}
              {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: 'hsl(var(--primary))', strokeWeight: 6 } }} />}
            </Map>
        </div>
        <div className="md:col-span-1 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Star} title={driver?.rating?.toFixed(1) || 'N/A'} subtitle={t('rating_label')}/>
                <StatCard icon={ShieldCheck} title={vehicle?.model || 'N/A'} subtitle={t('active_vehicle_label')}>
                    {vehicle && <Badge>{t(vehicle.status as any)}</Badge>}
                </StatCard>
            </div>

            {activeRide ? renderCurrentActionCard() : renderPendingRequestsCard()}
            
            <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{t('driver_online_status_title')}</CardTitle>
                    <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isOnline ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isOnline ? t('status_online') : t('status_offline')}
                    </span>
                    <Switch checked={isOnline} onCheckedChange={(checked) => dispatch({ type: 'TOGGLE_ONLINE', payload: checked })} />
                    </div>
                </div>
                <CardDescription>
                    {isOnline ? (activeRide ? t(statusMessageKey) : t('driver_status_waiting')) : t('driver_status_offline')}
                </CardDescription>
                </CardHeader>
                 {isOnline && (
                <>
                    <Separator />
                    <CardContent className="pt-6 space-y-6">
                    <div>
                        <Label className="font-semibold">{t('driver_service_types_label')}:</Label>
                        <div className="space-y-3 mt-3">
                        <div className="flex items-center space-x-3">
                            <Checkbox id="passengers" checked={services.passengers} onCheckedChange={(checked) => handleServiceChange('passengers')} disabled={!vehicle?.allowedServices.includes('passengers')} />
                            <Label htmlFor="passengers" className="flex items-center gap-2 text-sm font-normal">
                            <Car className="h-4 w-4" /> {t('driver_service_taxi')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox id="deliveries" checked={services.deliveries} onCheckedChange={(checked) => handleServiceChange('deliveries')} disabled={!vehicle?.allowedServices.includes('deliveries')} />
                            <Label htmlFor="deliveries" className="flex items-center gap-2 text-sm font-normal">
                            <Package className="h-4 w-4" /> {t('driver_service_delivery')}
                            </Label>
                        </div>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <Label className="font-semibold">{t('driver_queue_label')}:</Label>
                        <RadioGroup value={queueMode} onValueChange={setQueueMode} className="mt-3 space-y-2">
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="global" id="globalQueue" />
                            <Label htmlFor="globalQueue" className="font-normal">{t('driver_queue_global')}</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="stand" id="standQueue" />
                            <Label htmlFor="standQueue" className="font-normal">{t('driver_queue_stand')}</Label>
                        </div>
                         <div className="flex items-center space-x-3">
                            <RadioGroupItem value="both" id="bothQueues" />
                            <Label htmlFor="bothQueues" className="font-normal">{t('driver_queue_both')}</Label>
                        </div>
                        </RadioGroup>
                        {queueMode === 'stand' && (
                        <div className="mt-4 pl-8">
                            <Label htmlFor="taxiStand" className="text-xs text-muted-foreground">{t('driver_select_stand_label')}</Label>
                            <Select defaultValue="aeroporto-chegadas">
                            <SelectTrigger id="taxiStand">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aeroporto-chegadas">{t('driver_stand_airport')}</SelectItem>
                                <SelectItem value="estacao-oriente">{t('driver_stand_oriente')}</SelectItem>
                                <SelectItem value="praca-comercio">{t('driver_stand_comercio')}</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        )}
                    </div>
                    </CardContent>
                </>
                )}
            </Card>

            {!activeRide && isOnline && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('driver_queue_position_title')}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-around text-center">
                  <div>
                    <p className="text-3xl font-bold">5</p>
                    <p className="text-xs text-muted-foreground">{t('driver_your_position')}</p>
                  </div>
                   <Separator orientation="vertical" className="h-12" />
                  <div>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">{t('driver_total_in_queue')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
        </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, title, subtitle, children }: { icon: React.ElementType, title: string, subtitle: string, children?: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{subtitle}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{title}</div>
            {children}
        </CardContent>
    </Card>
);

    
