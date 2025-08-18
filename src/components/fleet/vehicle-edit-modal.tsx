'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext } from '@/contexts/app-context';

interface VehicleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any | null;
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
}

export default function VehicleEditModal({
  isOpen,
  onClose,
  vehicle,
  onSave,
  onDelete,
}: VehicleEditModalProps) {
  const { t } = useAppContext();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: vehicle || { name: '', email: '', vehicleDetails: { model: '' }, vehicleStatus: { state: 'disponivel' } }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(vehicle || { name: '', email: '', vehicleDetails: { model: '' }, vehicleStatus: { state: 'disponivel' } });
    }
  }, [isOpen, vehicle, reset]);

  const onSubmit = (data: any) => {
    onSave({ ...vehicle, ...data });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {vehicle ? t('vehicle_modal_edit_title') : t('vehicle_modal_add_title')}
          </DialogTitle>
          <DialogDescription>
            {t('vehicle_modal_desc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name_label')}</Label>
            <Input id="name" {...register('name', { required: true })} />
            {errors.name && <p className="text-destructive text-xs">{t('field_required')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email_label')}</Label>
            <Input id="email" type="email" {...register('email', { required: true })} />
             {errors.email && <p className="text-destructive text-xs">{t('field_required')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-model">{t('vehicle_model_label')}</Label>
            <Input id="vehicle-model" {...register('vehicleDetails.model', { required: true })} />
             {errors.vehicleDetails?.model && <p className="text-destructive text-xs">{t('field_required')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-status">{t('vehicle_status_label')}</Label>
            <Controller
                name="vehicleStatus.state"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="vehicle-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="disponivel">{t('vehicle_status_available')}</SelectItem>
                            <SelectItem value="em_viagem">{t('vehicle_status_in_trip')}</SelectItem>
                            <SelectItem value="em_manutencao">{t('vehicle_status_maintenance')}</SelectItem>
                            <SelectItem value="inativo">{t('vehicle_status_inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
          </div>
          <DialogFooter>
            {vehicle && (
              <Button type="button" variant="destructive" onClick={() => onDelete(vehicle.id)}>
                {t('delete_button')}
              </Button>
            )}
            <Button type="submit">{t('save_button')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
