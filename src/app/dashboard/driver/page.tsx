
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
import { HeatmapLayer } from '@react-google-maps/api';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
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
    setStatusMessage(isOnline ? t('driver_status_message_online') : t('driver_status_message_offline'));
  }, [isOnline, t]);
  
  const handleServiceChange = (service: keyof typeof services, checked: boolean) => {
    setServices(prev => ({ ...prev, [service]: checked }));
  };

  const VehicleMarker = ({ isSelf = false }: { isSelf?: boolean }) => {
    const color = isSelf ? 'hsl(var(--primary))' : 'hsl(var(--secondary-foreground))';
    const scale = isSelf ? 1.2 : 1.0;
    return (
        <div style={{ transform: `scale(${scale})` }}>
            <Car style={{ color: color, filter: `drop-shadow(0 0 3px ${isSelf ? 'hsl(var(--primary))' : 'black'})` }} />
        </div>
    );
  };


  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
        <div className="md:col-span-2 rounded-lg bg-muted flex items-center justify-center min-h-[400px] md:min-h-0">
            <Map>
              {isLoaded && isOnline && heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
              {isLoaded && isOnline && nearbyDriversData.map((driver, index) => (
                <AdvancedMarker key={`driver-${index}`} position={driver}>
                    <VehicleMarker />
                </AdvancedMarker>
              ))}

              {isLoaded && <AdvancedMarker position={vehiclePosition}>
                    <VehicleMarker isSelf={true} />
                </AdvancedMarker>
              }
              
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
                  <CardTitle>{t('driver_queue_position_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {queuePosition.position > 0 ? (
                    <p className="text-2xl font-bold">{queuePosition.position} / {queuePosition.total}</p>
                  ) : (
                    <p className="text-muted-foreground">{t('driver_not_in_queue')}</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{t('driver_online_status_title')}</CardTitle>
                    <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isOnline ? 'text-primary' : 'text-muted-foreground'}`}>
                        {t(isOnline ? 'status_online' : 'status_offline')}
                    </span>
                    <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                    </div>
                </div>
                <CardDescription>
                    {t(isOnline ? 'driver_online_status_desc_online' : 'driver_online_status_desc_offline')}
                </CardDescription>
                </CardHeader>
                 {isOnline && (
                <>
                    <Separator />
                    <CardContent className="pt-6 space-y-6">
                    <div>
                        <Label className="font-semibold">{t('driver_active_services_title')}</Label>
                        <div className="space-y-3 mt-3">
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="passengers" 
                                checked={services.passengers} 
                                onCheckedChange={(checked) => handleServiceChange('passengers', !!checked)}
                            />
                            <Label htmlFor="passengers" className="flex items-center gap-2 text-sm font-normal">
                            <Car className="h-4 w-4" /> {t('driver_service_passengers')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="deliveries" 
                                checked={services.deliveries} 
                                onCheckedChange={(checked) => handleServiceChange('deliveries', !!checked)} 
                            />
                            <Label htmlFor="deliveries" className="flex items-center gap-2 text-sm font-normal">
                            <Package className="h-4 w-4" /> {t('driver_service_deliveries')}
                            </Label>
                        </div>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <Label className="font-semibold">{t('driver_queue_operation_title')}</Label>
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
                        {(queueMode === 'stand' || queueMode === 'both') && (
                        <div className="mt-4 pl-8">
                            <Label htmlFor="taxiStand" className="text-xs text-muted-foreground">{t('driver_select_stand_label')}</Label>
                            <Select>
                            <SelectTrigger id="taxiStand">
                                <SelectValue placeholder={t('driver_select_stand_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {taxiStands.map(stand => (
                                    <SelectItem key={stand.id} value={stand.id}>{stand.name}</SelectItem>
                                ))}
                                {taxiStands.length === 0 && <SelectItem value="none" disabled>{t('driver_no_stands_available')}</SelectItem>}
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
