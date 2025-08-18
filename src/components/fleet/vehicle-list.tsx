'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Dot } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VehicleListProps {
  vehicles: any[];
  onVehicleClick: (vehicle: any) => void;
  onAddClick: () => void;
}

const statusConfig: Record<string, { labelKey: any; colorClass: string }> = {
    disponivel: { labelKey: 'vehicle_status_available', colorClass: 'text-green-500' },
    em_viagem: { labelKey: 'vehicle_status_in_trip', colorClass: 'text-blue-500' },
    em_manutencao: { labelKey: 'vehicle_status_maintenance', colorClass: 'text-yellow-500' },
    inativo: { labelKey: 'vehicle_status_inactive', colorClass: 'text-red-500' },
};

export default function VehicleList({ vehicles, onVehicleClick, onAddClick }: VehicleListProps) {
    const { t } = useAppContext();

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('vehicle_list_title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-0">
        <div className="p-6 pt-0">
             <Button onClick={onAddClick} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('btn_add_vehicle')}
            </Button>
        </div>
        <ScrollArea className="flex-grow">
            <div className="space-y-2 p-6 pt-0">
            {vehicles.map((vehicle) => {
                const status = statusConfig[vehicle.vehicleStatus.state] || { labelKey: 'unknown_status', colorClass: 'text-gray-500'};
                return (
                    <div
                    key={vehicle.id}
                    onClick={() => onVehicleClick(vehicle)}
                    className="p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    >
                    <p className="font-semibold">{vehicle.name}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.vehicleDetails.model}</p>
                    <div className="flex items-center text-sm">
                        <Dot className={`mr-1 h-6 w-6 ${status.colorClass}`} />
                        <span>{t(status.labelKey)}</span>
                    </div>
                    </div>
                )
            })}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
