'use client';

import { useState, useEffect, useReducer, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Package, User, Star, Loader2, PlayCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Map } from '@/components/map';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/currency';
import { MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { useAppContext } from '@/contexts/app-context';
import type { TranslationKeys } from '@/lib/i18n';
import { saveTripHistory } from '@/services/historyService';
import type { Trip } from '@/types';

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
  simulationStep: 'idle' | 'request' | 'enroute_to_pickup' | 'at_pickup' | 'enroute_to_destination' | 'at_destination';
  vehiclePosition: { lat: number; lng: number };
  directions: google.maps.DirectionsResult | null;
  statusMessageKey: TranslationKeys;
};

type Action =
  | { type: 'TOGGLE_ONLINE'; payload: boolean }
  | { type: 'TOGGLE_SIMULATION' }
  | { type: 'ACCEPT_RIDE' }
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

async function handleFinishRide() {
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
        driverId: 'mock_driver_id', // Replace with actual driver ID
    };
    try {
        await saveTripHistory(finalTripData);
        console.log("Trip history saved successfully!");
    } catch (error) {
        console.error("Failed to save trip history:", error);
    }
}


function simulationReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'TOGGLE_ONLINE':
            return { ...state, isOnline: action.payload, statusMessageKey: action.payload ? 'driver_status_waiting' : 'driver_status_offline' };
        case 'TOGGLE_SIMULATION':
            const isSimulating = !state.isSimulating;
            if (isSimulating && state.isOnline) {
                 return {
                    ...getInitialState(),
                    isOnline: state.isOnline,
                    isSimulating,
                    simulationStep: 'request',
                    statusMessageKey: 'driver_status_new_request',
                    vehiclePosition: state.vehiclePosition,
                };
            }
            return {
                ...getInitialState(),
                isOnline: state.isOnline,
                isSimulating: false,
                statusMessageKey: state.isOnline ? 'driver_status_waiting' : 'driver_status_offline',
                vehiclePosition: state.vehiclePosition,
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
            handleFinishRide();
            return { ...getInitialState(), isOnline: state.isOnline, isSimulating: state.isSimulating, statusMessageKey: state.isOnline ? 'driver_status_waiting' : 'driver_status_offline'};
        case 'SET_VEHICLE_POSITION':
            return { ...state, vehiclePosition: action.payload };
        case 'SET_DIRECTIONS':
            return { ...state, directions: action.payload };
        case 'SET_STATUS_MESSAGE_KEY':
            return { ...state, statusMessageKey: action.payload };
        default:
            return state;
    }
}


export default function DriverDashboardPage() {
  const { t } = useAppContext();
  const [state, dispatch] = useReducer(simulationReducer, getInitialState());
  const { isOnline, isSimulating, simulationStep, vehiclePosition, directions, statusMessageKey } = state;

  const [services, setServices] = useState({ passengers: true, deliveries: true });
  const [queueMode, setQueueMode] = useState('stand');
  const { formatCurrency } = useCurrency();

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
        const checkArrival = (target: google.maps.LatLngLiteral, nextStep: Action['type']) => {
            const distance = Math.sqrt(Math.pow(vehiclePosition.lat - target.lat, 2) + Math.pow(vehiclePosition.lng - target.lng, 2));
            if (distance < 0.001) {
                dispatch({ type: nextStep } as Action);
            }
        };

        if (simulationStep === 'enroute_to_pickup') {
            checkArrival(PASSENGER_PICKUP, 'ARRIVE_AT_PICKUP');
        } else if (simulationStep === 'enroute_to_destination') {
            checkArrival(TRIP_DESTINATION, 'FINISH_RIDE');
        }
    }, [vehiclePosition, simulationStep]);
  
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
      default:
        return (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-36">
              <p className="font-semibold text-muted-foreground">{t(statusMessageKey)}</p>
            </CardContent>
          </Card>
        );
    }
  };


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
                            <Checkbox id="passengers" checked={services.passengers} onCheckedChange={() => handleServiceChange('passengers')} />
                            <Label htmlFor="passengers" className="flex items-center gap-2 text-sm font-normal">
                            <Car className="h-4 w-4" /> {t('driver_service_taxi')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox id="deliveries" checked={services.deliveries} onCheckedChange={() => handleServiceChange('deliveries')} />
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
