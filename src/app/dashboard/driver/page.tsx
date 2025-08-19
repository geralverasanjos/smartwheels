'use client';

import { useState, useEffect, useReducer, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Package, User, Star, Loader2, PlayCircle, ShieldCheck } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import Map from '@/components/map';
import { Button } from '@/components/ui/button'; // Ensure Button is imported
import { useCurrency } from '@/lib/currency';
import { MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { useAppContext } from '@/contexts/app-context';
import { TranslationKeys } from '@/lib/i18n';
import { saveTripHistory } from '@/services/historyService';
import { getDriverProfile } from '@/services/profileService';
import { getPendingRideRequests, updateRideStatus, acceptRideRequest } from '@/services/rideService';
import { getVehicleById } from '@/services/vehicleService'; // Ensure getVehicleById is imported
import type { Trip, UserProfile, Vehicle } from '@/types';
import { getProfileByIdAndRole } from '@/services/profileService'; // Import the profile fetching function
import type { Message } from '@/types';
import { sendMessage } from '@/services/chatService'; // Import the sendMessage function
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components
import StatCard from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
// Simulation Data - REPLACE WITH REAL DATA FROM Firestore
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


type State = {
  isOnline: boolean;
  isSimulating: boolean;
  simulationStep: 'idle' | 'request' | 'enroute_to_pickup' | 'at_pickup' | 'enroute_to_destination' | 'at_destination' | 'ride_accepted';
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
                    isOnline: state.isOnline,
                    isSimulating,
                    simulationStep: 'request',
                    statusMessageKey: 'driver_status_new_request',
                    vehiclePosition: state.vehiclePosition,
                };
            }
            return {
                ...state,
                isOnline: state.isOnline,
                isSimulating: false,
                statusMessageKey: state.isOnline ? 'driver_status_waiting' : 'driver_status_offline',
                vehiclePosition: state.vehiclePosition,
            };
        case 'ACCEPT_RIDE':
 return { ...state, simulationStep: 'ride_accepted', statusMessageKey: 'driver_status_pickup_enroute' };
        case 'DECLINE_RIDE':
             return { ...state, simulationStep: 'idle', statusMessageKey: 'driver_status_waiting' };
        case 'ARRIVE_AT_PICKUP':
            return { ...state, simulationStep: 'at_pickup', statusMessageKey: 'driver_status_pickup_arrived' };
        case 'START_TRIP_TO_DESTINATION':
            return { ...state, simulationStep: 'enroute_to_destination', statusMessageKey: 'driver_status_destination_enroute' };
        case 'FINISH_RIDE':
            return { ...getInitialState(), isOnline: state.isOnline, statusMessageKey: state.isOnline ? 'driver_status_waiting' : 'driver_status_offline', isSimulating: state.isSimulating };
         case 'SIMULATION_STEP':
            return { ...getInitialState(), isOnline: state.isOnline, isSimulating: state.isSimulating, statusMessageKey: state.isOnline ? 'driver_status_waiting' : 'driver_status_offline'};
        case 'SET_VEHICLE_POSITION':
            return { ...state, vehiclePosition: action.payload };
        case 'SET_DIRECTIONS':
            return { ...state, directions: action.payload };
        case 'SET_STATUS_MESSAGE_KEY':
            return { ...state, statusMessageKey: action.payload };
        case 'START_SIMULATION':
            return { ...state, statusMessageKey: action.payload };
        default:
            return state;
    }
}


export default function DriverDashboardPage() {
  const { t } = useAppContext();
  const [state, dispatch] = useReducer(simulationReducer, getInitialState());
  const { isOnline, isSimulating, simulationStep, vehiclePosition, directions, statusMessageKey } = state;
  const [driver, setDriver] = useState<UserProfile | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([]);
  const [assignedPassengerProfile, setAssignedPassengerProfile] = useState<UserProfile | null>(null);

  const [services, setServices] = useState({ passengers: true, deliveries: true });
  const [queueMode, setQueueMode] = useState('stand');
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const driverProfile = await getDriverProfile();
        setDriver(driverProfile);
        if (driverProfile?.activeVehicleId) {
            const vehicleData = await getVehicleById(driverProfile.activeVehicleId);
            setVehicle(vehicleData);
        }
        setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchPendingRequests() {
      if (isOnline) {
        try {
          const requests = await getPendingRideRequests();
          setPendingRequests(requests);
        } catch (error) {
          console.error("Failed to fetch pending ride requests:", error);
        }
      }
    }
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 10000); // Fetch every 10 seconds
  }, [isOnline]);
  
  // Listen for messages for the active ride
useEffect(() => {
    let unsubscribe: () => void;

    if (activeRideId) {
        const messagesCollectionRef = collection(db, 'messages');
        const messagesQuery = query(
            messagesCollectionRef,
            where('rideId', '==', activeRideId),
            orderBy('timestamp', 'asc')
        );

        unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(newMessages);
        }, (error) => {
            console.error("Error listening to messages:", error);
        });
    }
    return () => unsubscribe && unsubscribe(); // Cleanup listener on component unmount or activeRideId change
}, [activeRideId]);

  // Listen for activeRideId to fetch passenger profile
  useEffect(() => {
    const fetchPassengerProfile = async () => {
      if (activeRideId) {
        try {
          const rideDocRef = doc(db, 'rideRequests', activeRideId);
          const rideSnap = await getDoc(rideDocRef);

          if (rideSnap.exists() && rideSnap.data()?.passengerId) {
            const passengerId = rideSnap.data().passengerId;
            const profile = await getProfileByIdAndRole(passengerId, 'passenger'); // Assuming getProfileByIdAndRole exists
            setAssignedPassengerProfile(profile);
          }
        } catch (error) {
          console.error("Error fetching passenger profile:", error);
        }
      } else {
        setAssignedPassengerProfile(null); // Clear passenger profile when ride ends
      }
    };
    fetchPassengerProfile();
}, [activeRideId]);
  const handleFinishRide = async () => {
    if (!driver || !vehicle) return;

    const finalTripData: Omit<Trip, 'id'> = {
        type: 'trip',
        passengerName: tripData.passengerName!,
        date: new Date().toISOString(),
        value: tripData.value!,
        status: 'completed',
        originAddress: tripData.originAddress!,
        destinationAddress: tripData.destinationAddress!,
        distance: tripData.distance!,
        duration: tripData.duration!,
        passengerId: 'mock_passenger_id',
        vehicleId: vehicle.id,
        driverId: driver.id!,
    };
    try {
        await saveTripHistory(finalTripData);
        dispatch({ type: 'SIMULATION_STEP', payload: 'idle' });
        console.log("Trip history saved successfully!");
    } catch (error) {
        console.error("Failed to save trip history:", error);
    }
  };
  
  const handleAcceptRequest = async (requestId: string) => {
    if (!driver || !vehicle) {
      toast({ title: t('error_title'), description: t('driver_accept_no_data'), variant: "destructive" });
      return;
    }
    
    const driverId = driver.id!;
    const vehicleId = driver.activeVehicleId; // Get vehicleId from driver profile

    if (!vehicleId) {
        toast({ title: t('error_title'), description: t('driver_accept_no_vehicle'), variant: "destructive" });
        return;
    }

    try {
      await acceptRideRequest(requestId, driverId, vehicleId);
 setActiveRideId(requestId);
      console.log(`Ride request ${requestId} accepted successfully!`);
 toast({ title: t('request_accepted_title'), description: t('request_accepted_desc') }); // Optional success toast
 dispatch({ type: 'ACCEPT_RIDE' });
      setPendingRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
    }
  };
  
  const handleStartTrip = async () => {
      if (!activeRideId) {
          toast({ title: t('error_title'), description: t('driver_start_no_ride'), variant: "destructive" });
      }
      
      try {
          await updateRideStatus(activeRideId, 'in_progress');
          console.log(`Ride request ${activeRideId} status updated to in_progress`);
          toast({ title: t('trip_started_title'), description: t('trip_started_desc') });
          dispatch({ type: 'START_TRIP_TO_DESTINATION' }); // Dispatch action to update UI state
      } catch (error) {
 console.error('Error starting trip:', error);
          toast({ title: t('error_title'), description: t('error_start_trip_failed'), variant: "destructive" });
      }
  }

  const handleCancelTrip = async () => {
    if (!activeRideId) {
      toast({ title: t('error_title'), description: t('driver_cancel_no_ride'), variant: "destructive" });
      return;
    }

    try {
      await updateRideStatus(activeRideId, 'cancelled');
      console.log(`Ride request ${activeRideId} status updated to cancelled`);
      toast({ title: t('ride_cancelled_title'), description: t('ride_cancelled_desc') });

      // Dispatch the UI action to reset the state after cancellation
      // This might be the same as FINISH_RIDE or a specific CANCEL_RIDE action
      dispatch({ type: 'FINISH_RIDE' }); // Assuming FINISH_RIDE resets state to waiting
      setActiveRideId(null); // Clear the active ride ID

    } catch (error) {
      console.error('Error cancelling trip:', error);
      toast({ title: t('error_title'), description: t('error_cancel_failed'), variant: "destructive" });
    }
  }
  


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

  useEffect(() => {
    if (simulationStep === 'enroute_to_pickup') {
        handleDirections(vehiclePosition, PASSENGER_PICKUP);
    } else if (simulationStep === 'enroute_to_destination') {
        handleDirections(vehiclePosition, TRIP_DESTINATION);
    } else {
        dispatch({ type: 'SET_DIRECTIONS', payload: null });
    }
  }, [simulationStep, handleDirections, vehiclePosition]);


    useEffect(() => {
        let interval: NodeJS.Timeout;
        const moveVehicle = (target: google.maps.LatLngLiteral) => {
            return setInterval(() => {
                dispatch({
                    type: 'SET_VEHICLE_POSITION',
                    payload: {
                        lat: vehiclePosition.lat + (target.lat - vehiclePosition.lat) * 0.1,
                        lng: vehiclePosition.lng + (target.lng - vehiclePosition.lng) * 0.1,
                    },
                });
            }, 1000);
        };

        if (simulationStep === 'enroute_to_pickup') {
 interval = moveVehicle(PASSENGER_PICKUP);
        } else if (simulationStep === 'enroute_to_destination') {
            interval = moveVehicle(TRIP_DESTINATION);
        }

        return () => clearInterval(interval);
    }, [simulationStep, vehiclePosition]);

   useEffect(() => {
        const checkArrival = (target: google.maps.LatLngLiteral, nextStepAction: Action) => {
            const distance = Math.sqrt(Math.pow(vehiclePosition.lat - target.lat, 2) + Math.pow(vehiclePosition.lng - target.lng, 2));
            if (distance < 0.001) {
                dispatch(nextStepAction);
            }
        };
    
        if (simulationStep === 'enroute_to_pickup') {
            checkArrival(PASSENGER_PICKUP, { type: 'ARRIVE_AT_PICKUP' });
        } else if (simulationStep === 'enroute_to_destination') {            
            checkArrival(TRIP_DESTINATION, { type: 'FINISH_RIDE' });
        }
    }, [vehiclePosition, simulationStep]);
  
 const renderPendingRequestsCard = () => {
    if (!isOnline || isSimulating) return null;
    if (activeRideId) return null; // Hide pending requests if a ride is active
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
                <div key={request.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <p className="font-semibold">{request.serviceType === 'delivery' ? t('service_type_delivery') : t('service_type_ride')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('from')}: {request.origin}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('to')}: {request.destination}
                  </p>
 <Button size="sm" className="mt-2" onClick={() => handleAcceptRequest(request.id)}>{t('accept_button')}</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
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

  const renderCurrentActionCard = () => {
    switch (simulationStep) {
      case 'request':
        return (
          <Card className="border-dashed border-primary animate-pulse">
            <CardHeader>
              <CardTitle className="text-primary">{t('driver_request_title')}</CardTitle>
              <CardDescription>{t('driver_request_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-muted-foreground" />
                <p className="font-semibold">{tripData.passengerName} (4.8 <Star className="inline w-4 h-4 text-yellow-400 fill-yellow-400" />)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('driver_request_from')} {tripData.originAddress}</p>
                <p className="text-sm text-muted-foreground">{t('driver_request_to')} {tripData.destinationAddress}</p>
              </div>
              <p className="text-xl font-bold text-right">{formatCurrency(tripData.value || 0)}</p>
            </CardContent>
            <CardContent className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => dispatch({ type: 'DECLINE_RIDE' })}>{t('decline_button')}</Button>
              <Button className="w-full" onClick={() => dispatch({ type: 'ACCEPT_RIDE' })}>{t('accept_button')}</Button>
            </CardContent>
          </Card>
        );
      case 'at_pickup':
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-primary">{t('driver_pickup_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t('driver_pickup_desc')}</p>
                    <Button className="w-full mt-4" onClick={() => dispatch({type: 'START_TRIP_TO_DESTINATION'})}><PlayCircle className="mr-2"/> {t('driver_pickup_start_button')}</Button>
                </CardContent>
            </Card>
        )
 case 'enroute_to_pickup':
 case 'ride_accepted': // The driver is enroute after accepting
 return (
 <Card>
 <CardHeader className="text-center">
 <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
 <Car className="h-10 w-10 text-primary" />
 </div>
 <CardTitle className="font-headline">{t('driver_enroute_title')}</CardTitle>
 <CardDescription>{t('driver_enroute_desc', { name: tripData.passengerName, time: 5 })}</CardDescription>
 </CardHeader>
 <CardContent>
 <p className="text-center text-sm text-muted-foreground">{t('passenger_label')}: {tripData.passengerName}</p>{/* Add messages display area */}
                <div className="h-32 overflow-y-auto border rounded-md p-2 mt-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`text-sm mb-1 ${msg.senderId === driver?.id ? 'text-right' : 'text-left'}`}>
                            <span className={`inline-block p-2 rounded-lg ${msg.senderId === driver?.id ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                                {msg.text}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Chat Input */}
                <div className="mt-2 space-y-2">
 <Label htmlFor="driver-chat-input">{t('chat_label')}</Label>
 <Textarea
 id="driver-chat-input"
 value={currentMessage}
 onChange={(e) => setCurrentMessage(e.target.value)}
 />
 <Button className="w-full" onClick={async () => {
 if (!currentMessage.trim()) return; // Don't send empty messages
 if (!activeRideId) {
 toast({ title: t('error_title'), description: 'No active ride to send message.', variant: "destructive" });
 return;
 }
 const driverId = driver?.id; // Get driver ID from state
 if (!driverId) {
 toast({ title: t('error_title'), description: 'Driver not authenticated.', variant: "destructive" });
 return;
 }
 try {
 await sendMessage(activeRideId, driverId, currentMessage);
 setCurrentMessage(''); // Clear input
 } catch (error) {
 console.error('Error sending message:', error);
 toast({ title: t('error_title'), description: t('error_sending_message'), variant: "destructive" });
 }
 }}>{t('send_button')}</Button>
 </div>
 <p className="text-center text-sm text-muted-foreground">{t('pickup_label')}: {tripData.originAddress}</p>
 </CardContent>
 <CardFooter className="flex flex-col gap-2">
 {/* The button to start the trip will be enabled when simulationStep is 'at_pickup' */}
 <Button className="w-full mt-4" onClick={handleStartTrip} disabled={simulationStep !== 'at_pickup' || !activeRideId}><PlayCircle className="mr-2" /> {t('awaiting_trip_start_button')}</Button>
 <Button variant="destructive" className="w-full" onClick={handleCancelTrip} disabled={simulationStep !== 'enroute_to_pickup' && simulationStep !== 'ride_accepted'}><X className="mr-2" /> {t('cancel_ride_button')}</Button>
 </CardContent>
 </Card>);

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
 <CardContent className="space-y-4"> {/* Adjusted CardContent for spacing */}
 {/* Chat Interface */}
 {/* Add messages display area */}
                <div className="h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                    {messages.length === 0 ? (
                        <p className="text-center text-muted-foreground">{t('chat_no_messages')}</p> // Placeholder if no messages
                    ) : (
 messages.map((msg) => (
                        <div key={msg.id} className={`text-sm ${msg.senderId === driver?.id ? 'text-right' : 'text-left'}`}>
                           {/* Determine sender's profile */}
                           {(() => {
                             const senderProfile = msg.senderId === driver?.id ? driver : assignedPassengerProfile;
                             const isDriver = msg.senderId === driver?.id;
                             return (
                               <div className={`flex items-start gap-2 ${isDriver ? 'flex-row-reverse' : ''}`}>
                                 <Avatar className=\"h-8 w-8\">
                                   <AvatarImage src={senderProfile?.avatarUrl} />
                                   <AvatarFallback>{senderProfile?.name?.substring(0, 2)}</AvatarFallback>
                                 </Avatar>
                                 <div className={`rounded-lg p-2 max-w-[80%] ${isDriver ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                                   <p className=\"font-semibold text-xs\">{senderProfile?.name}</p>
                                   <p className=\"text-sm\">{msg.text}</p>
                                 </div>
                               </div>
                             );
                           })()}
                        </div>
 </div>
                        <p className="text-center text-sm text-muted-foreground">{t('destination_label')}: {tripData.destinationAddress}</p> {/* Use tripData for destination */}
                    </CardContent>
 {/* Chat Interface */}
                {/* Add messages display area */}
                <div className="h-32 overflow-y-auto border rounded-md p-2 mt-4">
                    {messages.map((msg) => (
                       <div key={msg.id} className={`text-sm ${msg.senderId === driver?.id ? 'text-right' : 'text-left'}`}>
                           {/* Determine sender's profile */}
                           {(() => {
                             const senderProfile = msg.senderId === driver?.id ? driver : assignedPassengerProfile;
                             const isDriver = msg.senderId === driver?.id;
                             return (
                               <div className={`flex items-start gap-2 ${isDriver ? 'flex-row-reverse' : ''}`}>
                                 <Avatar className=\"h-8 w-8\">
                                   <AvatarImage src={senderProfile?.avatarUrl} />
                                   <AvatarFallback>{senderProfile?.name?.substring(0, 2)}</AvatarFallback>
                                 </Avatar>
                                 <div className={`rounded-lg p-2 max-w-[80%] ${isDriver ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                                   <p className=\"font-semibold text-xs\">{senderProfile?.name}</p>
                                   <p className=\"text-sm\">{msg.text}</p>
                                 </div>
                               </div>
                             );
                           })()}
                       </div>))}</div>
 <div className="mt-4 space-y-2">
 <Label htmlFor="driver-chat-input">{t('chat_label')}</Label>
 <Textarea
 id="driver-chat-input"
 placeholder={t('chat_placeholder')}
 value={currentMessage}
 onChange={(e) => setCurrentMessage(e.target.value)}
 />
 <Button className="w-full" onClick={async () => {
 if (!currentMessage.trim()) return; // Don't send empty messages
 if (!activeRideId) {
 toast({ title: t('error_title'), description: 'No active ride to send message.', variant: "destructive" });
 return;
 }
 const driverId = driver?.id; // Get driver ID from state
 if (!driverId) {
 toast({ title: t('error_title'), description: 'Driver not authenticated.', variant: "destructive" });
 return;
 }
 try {
 await sendMessage(activeRideId, driverId, currentMessage);
 setCurrentMessage(''); // Clear input
 } catch (error) {
 console.error('Error sending message:', error);
 toast({ title: t('error_title'), description: t('error_sending_message'), variant: "destructive" });
 }
 }}>{t('send_button')}</Button>
 </div>
                    <CardFooter className="flex flex-col gap-2">
                         <Button className="w-full" onClick={handleFinishRide}
                         disabled={!activeRideId} // Disable if no active ride ID

                         ><CheckCircle className="mr-2" /> {t('end_trip_button')}</Button>
                         {/* Cancel Trip Button */}
                         <Button variant="destructive" className="w-full" onClick={handleCancelTrip}><X className="mr-2"/> {t('cancel_trip_button')}</Button>
                    </CardFooter>
                </Card>);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 md:h-[calc(100vh-10rem)]">
        <div className="md:col-span-2 rounded-lg bg-muted min-h-[400px] md:min-h-0 relative overflow-hidden">
            <Map>
              {isSimulating && (
                <>
                    <MarkerF position={vehiclePosition} icon={getVehicleIcon() as google.maps.Icon | null} />
                    <MarkerF position={PASSENGER_PICKUP} label="P" />
                    {simulationStep === 'enroute_to_destination' && <MarkerF position={TRIP_DESTINATION} label="D" />}
                </>
              )}
              {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: 'hsl(var(--primary))', strokeWeight: 6 } }} />}
            </Map>
        </div>
        <div className="md:col-span-1 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Star} title={driver?.rating?.toFixed(1) || 'N/A'} subtitle="Sua Avaliação"/>
                <StatCard icon={ShieldCheck} title={vehicle?.model || 'N/A'} subtitle="Veículo Ativo">
                    {vehicle && <Badge>{t(vehicle.status)}</Badge>}
                </StatCard>
            </div>

            {isSimulating && renderCurrentActionCard()}
            
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
                    {isOnline ? t('driver_online_desc') : t('driver_offline_desc')}
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
                            <Checkbox id="passengers" checked={services.passengers} onCheckedChange={() => handleServiceChange('passengers')} disabled={!vehicle?.allowedServices.includes('passengers')} />
                            <Label htmlFor="passengers" className="flex items-center gap-2 text-sm font-normal">
                            <Car className="h-4 w-4" /> {t('driver_service_taxi')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox id="deliveries" checked={services.deliveries} onCheckedChange={() => handleServiceChange('deliveries')} disabled={!vehicle?.allowedServices.includes('deliveries')} />
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

            {isOnline && (
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
            {renderPendingRequestsCard()}

            <Card className="border-primary/50">
                <CardHeader>
                    <CardTitle>{t('driver_simulation_title')}</CardTitle>
                </CardHeader>
                 <CardContent className="flex items-center justify-between">
                     <Label htmlFor="simulation-switch">{t('driver_simulation_enable')}</Label>
                    <Switch id="simulation-switch" checked={isSimulating} onCheckedChange={() => dispatch({ type: 'TOGGLE_SIMULATION' })} />
                 </CardContent>
            </Card>
            
        </div>
    </div>
  );
}
