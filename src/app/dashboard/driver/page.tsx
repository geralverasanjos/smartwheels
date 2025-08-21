
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Package, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Map } from '@/components/map';
import { MarkerF, HeatmapLayer } from '@react-google-maps/api';
import { useAppContext } from '@/contexts/app-context';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { getStands } from '@/services/standsService';
import type { TaxiStand } from '@/types';

const DRIVER_INITIAL_POSITION = { lat: 38.72, lng: -9.15 };

// Mock data for nearby drivers
const nearbyDriversData = [
  { lat: 38.722, lng: -9.155 },
  { lat: 38.718, lng: -9.145 },
  { lat: 38.725, lng: -9.152 },
];


export default function DriverDashboardPage() {
  const { t } = useAppContext();
  const { isLoaded } = useGoogleMaps();
  
  const [isOnline, setIsOnline] = useState(false);
  const [vehiclePosition, setVehiclePosition] = useState(DRIVER_INITIAL_POSITION);
  const [statusMessage, setStatusMessage] = useState('Você está offline.');
  
  const [services, setServices] = useState({ passengers: true, deliveries: true });
  const [queueMode, setQueueMode] = useState('global');
  const [heatmapData, setHeatmapData] = useState<google.maps.LatLng[]>([]);
  const [queuePosition, setQueuePosition] = useState({ position: 0, total: 0 });
  const [taxiStands, setTaxiStands] = useState<TaxiStand[]>([]);


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
        
        // Fetch taxi stands
        getStands().then(setTaxiStands).catch(console.error);
    }
  }, [isLoaded]);

  useEffect(() => {
    setStatusMessage(isOnline ? 'Aguardando novas solicitações...' : 'Você está offline.');
  }, [isOnline]);
  
  const handleServiceChange = (service: keyof typeof services, checked: boolean) => {
    setServices(prev => ({ ...prev, [service]: checked }));
  };

  const getVehicleIcon = useCallback((isSelf: boolean = false) => {
    if (!isLoaded || typeof window === 'undefined' || !window.google?.maps?.Point) {
        return null;
    }
    return {
        path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
        fillColor: isSelf ? 'hsl(var(--primary))' : 'hsl(var(--secondary-foreground))',
        fillOpacity: isSelf ? 1 : 0.7,
        strokeWeight: 1,
        strokeColor: 'hsl(var(--background))',
        scale: isSelf ? 1.5 : 1.2,
        anchor: new window.google.maps.Point(12, 12)
    };
  }, [isLoaded]);


  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
        <div className="md:col-span-2 rounded-lg bg-muted flex items-center justify-center min-h-[400px] md:min-h-0">
            <Map>
              {isLoaded && isOnline && heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
              {isLoaded && isOnline && nearbyDriversData.map((driver, index) => (
                <MarkerF key={`driver-${index}`} position={driver} icon={getVehicleIcon(false)} />
              ))}

              {isLoaded && <MarkerF position={vehiclePosition} icon={getVehicleIcon(true)} />}
              
            </Map>
        </div>
        <div className="md:col-span-1 flex flex-col gap-6 overflow-y-auto">
            
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-36">
                <p className="font-semibold text-muted-foreground">{statusMessage}</p>
              </CardContent>
            </Card>

            {isOnline && (queueMode === 'stand' || queueMode === 'both') && (
              <Card>
                <CardHeader>
                  <CardTitle>Posição na Fila</CardTitle>
                </CardHeader>
                <CardContent>
                  {queuePosition.position > 0 ? (
                    <p className="text-2xl font-bold">{queuePosition.position} / {queuePosition.total}</p>
                  ) : (
                    <p className="text-muted-foreground">Não está em nenhuma fila de ponto de táxi.</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Status Online</CardTitle>
                    <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isOnline ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                    <Switch checked={isOnline} onCheckedChange={setIsOnline} />
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
                                onCheckedChange={(checked) => handleServiceChange('passengers', !!checked)}
                            />
                            <Label htmlFor="passengers" className="flex items-center gap-2 text-sm font-normal">
                            <Car className="h-4 w-4" /> Passageiros (Táxi)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="deliveries" 
                                checked={services.deliveries} 
                                onCheckedChange={(checked) => handleServiceChange('deliveries', !!checked)} 
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
                        {(queueMode === 'stand' || queueMode === 'both') && (
                        <div className="mt-4 pl-8">
                            <Label htmlFor="taxiStand" className="text-xs text-muted-foreground">Escolha o Ponto de Táxi</Label>
                            <Select>
                            <SelectTrigger id="taxiStand">
                                <SelectValue placeholder="Selecione um ponto..." />
                            </SelectTrigger>
                            <SelectContent>
                                {taxiStands.map(stand => (
                                    <SelectItem key={stand.id} value={stand.id}>{stand.name}</SelectItem>
                                ))}
                                {taxiStands.length === 0 && <SelectItem value="none" disabled>Nenhum ponto disponível</SelectItem>}
                            </SelectContent>
                            </Select>
                        </div>
                        )}
                    </div>
                    </CardContent>
                </>
                )}
            </Card>

        </div>
    </div>
  );
}
