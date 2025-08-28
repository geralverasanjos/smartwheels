'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Dot } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { VehicleWithLocation } from '@/types';
import type { TranslationKeys } from '@/lib/i18n';

interface VehicleListProps {
  vehicles: VehicleWithLocation[];
  onVehicleClick: (vehicle: VehicleWithLocation) => void;
  onAddClick: () => void;
}

const statusConfig: Record<string, { labelKey: TranslationKeys; colorClass: string }> = {
    online: { labelKey: 'status_online', colorClass: 'text-green-500' },
    in_trip: { labelKey: 'status_in_trip', colorClass: 'text-blue-500' },
    offline: { labelKey: 'status_offline', colorClass: 'text-red-500' },
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
                {t('btn_add_driver')}
            </Button>
        </div>
        <ScrollArea className="flex-grow">
            <div className="space-y-2 p-6 pt-0">
            {vehicles.map((vehicle) => {
                const status = statusConfig[vehicle.status || 'offline'] || { labelKey: 'status_offline', colorClass: 'text-gray-500'};
                return (
                    <div
                    key={vehicle.id}
                    onClick={() => onVehicleClick(vehicle)}
                    className="p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    >
                    <p className="font-semibold">{vehicle.name}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.activeVehicleId || "N/A"}</p>
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
