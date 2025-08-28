'use client';
import * as React from 'react';
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
import type { UserProfile, VehicleWithLocation } from '@/types';

interface VehicleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleWithLocation | null;
  onSave: (data: Partial<UserProfile>) => void;
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
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<UserProfile>({
    defaultValues: vehicle || { name: '', email: '', activeVehicleId: '', status: 'offline' }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(vehicle || { name: '', email: '', activeVehicleId: '', status: 'offline' });
    }
  }, [isOpen, vehicle, reset]);

  const onSubmit = (data: Partial<UserProfile>) => {
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
            <Label htmlFor="vehicle-status">{t('vehicle_status_label')}</Label>
            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="vehicle-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="online">{t('status_online')}</SelectItem>
                            <SelectItem value="in_trip">{t('status_in_trip')}</SelectItem>
                            <SelectItem value="offline">{t('status_offline')}</SelectItem>
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
