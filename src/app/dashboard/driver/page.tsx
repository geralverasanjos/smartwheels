
'use client';

import { useState, useEffect, useReducer, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Package, User, Star, ArrowRight, Loader2, PlayCircle, CheckCircle, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Map } from '@/components/map';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/currency';
import { MarkerF, DirectionsRenderer, HeatmapLayer } from '@react-google-maps/api';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/app-context';
import { useGoogleMaps } from '@/hooks/use-google-maps';

const LISBON_CENTER = { lat: 38.736946, lng: -9.142685 };
const DRIVER_INITIAL_POSITION = { lat: 38.72, lng: -9.15 };
const PASSENGER_PICKUP = { lat: 38.74, lng: -9.15 };
const TRIP_DESTINATION = { lat: 38.725, lng: -9.13 };

// Mock data for new features
const nearbyDriversData = [
  { lat: 38.722, lng: -9.155 },
  { lat: 38.718, lng: -9.145 },
  { lat: 38.725, lng: -9.152 },
];
const taxiStands = [
    { name: 'Oriente', location: { lat: 38.767, lng: -9.099 } },
    { name: 'Comercio', location: { lat: 38.707, lng: -9.136 } },
];

type State = {
  isOnline: boolean;
  isSimulating: boolean;
  simulationStep: 'idle' | 'request' | 'enroute_to_pickup' | 'at_pickup' | 'enroute_to_destination' | 'at_destination';
  vehiclePosition: { lat: number; lng: number };
  directions: google.maps.DirectionsResult | null;
  statusMessage: string;
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
  | { type: 'SET_STATUS_MESSAGE', payload: string };
  
const initialState: State = {
  isOnline: false,
  isSimulating: false,
  simulationStep: 'idle',
  vehiclePosition: DRIVER_INITIAL_POSITION,
  directions: null,
  statusMessage: 'Você está offline.'
};

function simulationReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'TOGGLE_ONLINE':
            return { ...state, isOnline: action.payload, statusMessage: action.payload ? 'Aguardando novas solicitações...' : 'Você está offline.' };
        case 'TOGGLE_SIMULATION':
            const isSimulating = !state.isSimulating;
            return {
                ...initialState,
                isOnline: state.isOnline,
                isSimulating,
                simulationStep: isSimulating ? 'request' : 'idle',
                statusMessage: isSimulating ? state.statusMessage : (state.isOnline ? 'Aguardando novas solicitações...' : 'Você está offline.')
            };
        case 'ACCEPT_RIDE':
            return { ...state, simulationStep: 'enroute_to_pickup', statusMessage: 'A caminho para buscar o passageiro...' };
        case 'DECLINE_RIDE':
             return { ...state, simulationStep: 'idle', statusMessage: 'Aguardando novas solicitações...' };
        case 'ARRIVE_AT_PICKUP':
            return { ...state, simulationStep: 'at_pickup', statusMessage: 'Passageiro coletado. Inicie a viagem para o destino.' };
        case 'START_TRIP_TO_DESTINATION':
            return { ...state, simulationStep: 'enroute_to_destination', statusMessage: 'Viagem em andamento para o destino final.' };
        case 'FINISH_RIDE':
            return { ...initialState, isOnline: state.isOnline, isSimulating: state.isSimulating };
        case 'SET_VEHICLE_POSITION':
            return { ...state, vehiclePosition: action.payload };
        case 'SET_DIRECTIONS':
            return { ...state, directions: action.payload };
        case 'SET_STATUS_MESSAGE':
            return { ...state, statusMessage: action.payload };
        default:
            return state;
    }
}


export default function DriverDashboardPage() {
  const { t } = useAppContext();
  const { toast } = useToast();
  const { isLoaded } = useGoogleMaps();
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  const { isOnline, isSimulating, simulationStep, vehiclePosition, directions, statusMessage } = state;
  
  const [services, setServices] = useState({ passengers: true, deliveries: true });
  const [queueMode, setQueueMode] = useState('stand');
  const [heatmapData, setHeatmapData] = useState<google.maps.LatLng[]>([]);
  const { formatCurrency } = useCurrency();

  // Initialize heatmap data once Google Maps is loaded
  useEffect(() => {
    if (isLoaded && typeof window.google !== 'undefined') {
        setHeatmapData([
            new google.maps.LatLng(38.71, -9.14),
            new google.maps.LatLng(38.712, -9.142),
            new google.maps.LatLng(38.715, -9.138),
            new google.maps.LatLng(38.711, -9.141),
            new google.maps.LatLng(38.708, -9.135),
            new google.maps.LatLng(38.714, -9.145),
        ]);
    }
  }, [isLoaded]);

  // Simulate proximity check for taxi stands
  useEffect(() => {
    if (!isOnline) return;

    const proximityCheckInterval = setInterval(() => {
        const nearbyStand = taxiStands.find(stand => {
             const distance = Math.sqrt(
                Math.pow(vehiclePosition.lat - stand.location.lat, 2) +
                Math.pow(vehiclePosition.lng - stand.location.lng, 2)
            );
            return distance < 0.05; // Adjust threshold as needed
        });

        if (nearbyStand) {
            toast({
                title: t('toast_stand_nearby_title'),
                description: t('toast_stand_nearby_desc', { standName: nearbyStand.name }),
                duration: 5000,
                action: (
                    <>
                        <Button onClick={() => console.log('Joining queue for', nearbyStand.name)}>Aceitar</Button>
                        <Button variant="ghost" onClick={() => console.log('Ignored queue for', nearbyStand.name)}>{t('ignore_button')}</Button>
                    </>
                ),
            });
        }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(proximityCheckInterval);
  }, [isOnline, vehiclePosition, t, toast]);


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

  const getVehicleIcon = (isSelf: boolean = false) => {
    if (typeof window === 'undefined' || !window.google) return null;
    return {
        path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
        fillColor: isSelf ? 'hsl(var(--primary))' : 'hsl(var(--secondary-foreground))',
        fillOpacity: isSelf ? 1 : 0.7,
        strokeWeight: 1,
        strokeColor: 'hsl(var(--background))',
        scale: isSelf ? 1.5 : 1.2,
        anchor: new window.google.maps.Point(12, 12)
    };
  };

  const renderCurrentActionCard = () => {
    switch (simulationStep) {
      case 'request':
        return (
          <Card className="border-dashed border-primary animate-pulse">
            <CardHeader>
              <CardTitle className="text-primary">Nova Solicitação de Corrida!</CardTitle>
              <CardDescription>Um passageiro próximo precisa de uma viagem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-muted-foreground" />
                <p className="font-semibold">Ana Sousa (4.8 <Star className="inline w-4 h-4 text-yellow-400 fill-yellow-400" />)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">De: Ponto de Partida</p>
                <p className="text-sm text-muted-foreground">Para: Destino Final</p>
              </div>
              <p className="text-xl font-bold text-right">{formatCurrency(12.50)}</p>
            </CardContent>
            <CardContent className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => dispatch({ type: 'DECLINE_RIDE' })}>Recusar</Button>
              <Button className="w-full" onClick={() => dispatch({ type: 'ACCEPT_RIDE' })}>Aceitar</Button>
            </CardContent>
          </Card>
        );
      case 'at_pickup':
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-primary">Aguardando Passageiro</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Você chegou ao local de partida. Aguarde o passageiro e inicie a viagem.</p>
                    <Button className="w-full mt-4" onClick={() => dispatch({type: 'START_TRIP_TO_DESTINATION'})}><PlayCircle className="mr-2"/> Iniciar Viagem para o Destino</Button>
                </CardContent>
            </Card>
        )
      default:
        return (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center h-36">
              <p className="font-semibold text-muted-foreground">{statusMessage}</p>
            </CardContent>
          </Card>
        );
    }
  };


  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
        <div className="md:col-span-2 rounded-lg bg-muted flex items-center justify-center min-h-[400px] md:min-h-0">
            <Map>
              {isLoaded && heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
              {isOnline && nearbyDriversData.map((driver, index) => (
                <MarkerF key={`driver-${index}`} position={driver} icon={getVehicleIcon(false) as google.maps.Icon | null} />
              ))}

              <MarkerF position={vehiclePosition} icon={getVehicleIcon(true) as google.maps.Icon | null} />
              
              {isSimulating && (
                <>
                    <MarkerF position={PASSENGER_PICKUP} label="P" />
                    {simulationStep === 'enroute_to_destination' && <MarkerF position={TRIP_DESTINATION} label="D" />}
                </>
              )}
              {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
            </Map>
        </div>
        <div className="md:col-span-1 flex flex-col gap-6 overflow-y-auto">
            
            {isSimulating && renderCurrentActionCard()}
            
            <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Status Online</CardTitle>
                    <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isOnline ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                    <Switch checked={isOnline} onCheckedChange={(checked) => dispatch({ type: 'TOGGLE_ONLINE', payload: checked })} />
                    </div>
                </div>
                <CardDescription>
                    {isOnline ? 'Você está visível e pronto para receber pedidos.' : 'Você não está recebendo solicitações de corrida.'}
                </CardDescription>
                </CardHeader>
                 {isOnline && (
                <>
                    <Separator />
                    <CardContent className="pt-6 space-y-6">
                    <div>
                        <Label className="font-semibold">Tipos de Serviço Ativos:</Label>
                        <div className="space-y-3 mt-3">
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="passengers" 
                                checked={services.passengers} 
                                onCheckedChange={(checked) => handleServiceChange('passengers')} 
                            />
                            <Label htmlFor="passengers" className="flex items-center gap-2 text-sm font-normal">
                            <Car className="h-4 w-4" /> Passageiros (Táxi)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="deliveries" 
                                checked={services.deliveries} 
                                onCheckedChange={(checked) => handleServiceChange('deliveries')} 
                            />
                            <Label htmlFor="deliveries" className="flex items-center gap-2 text-sm font-normal">
                            <Package className="h-4 w-4" /> Entregas Pequenas
                            </Label>
                        </div>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <Label className="font-semibold">Fila de Operação:</Label>
                        <RadioGroup value={queueMode} onValueChange={setQueueMode} className="mt-3 space-y-2">
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="global" id="globalQueue" />
                            <Label htmlFor="globalQueue" className="font-normal">Fila Global</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="stand" id="standQueue" />
                            <Label htmlFor="standQueue" className="font-normal">Fila de Ponto de Táxi</Label>
                        </div>
                         <div className="flex items-center space-x-3">
                            <RadioGroupItem value="both" id="bothQueues" />
                            <Label htmlFor="bothQueues" className="font-normal">Ambos</Label>
                        </div>
                        </RadioGroup>
                        {queueMode === 'stand' && (
                        <div className="mt-4 pl-8">
                            <Label htmlFor="taxiStand" className="text-xs text-muted-foreground">Escolha o Ponto de Táxi</Label>
                            <Select defaultValue="aeroporto-chegadas">
                            <SelectTrigger id="taxiStand">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aeroporto-chegadas">Aeroporto - Chegadas</SelectItem>
                                <SelectItem value="estacao-oriente">Estação do Oriente</SelectItem>
                                <SelectItem value="praca-comercio">Praça do Comércio</SelectItem>
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
                  <CardTitle>Posição na Fila</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-around text-center">
                  <div>
                    <p className="text-3xl font-bold">5</p>
                    <p className="text-xs text-muted-foreground">Sua Posição</p>
                  </div>
                   <Separator orientation="vertical" className="h-12" />
                  <div>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Total na Fila</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/50">
                <CardHeader>
                    <CardTitle>Simulação de Viagem</CardTitle>
                </CardHeader>
                 <CardContent className="flex items-center justify-between">
                     <Label htmlFor="simulation-switch">Ativar Simulação</Label>
                    <Switch id="simulation-switch" checked={isSimulating} onCheckedChange={() => dispatch({ type: 'TOGGLE_SIMULATION' })} />
                 </CardContent>
            </Card>
            
        </div>
    </div>
  );
}
