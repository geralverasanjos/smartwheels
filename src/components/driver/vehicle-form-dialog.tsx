'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useAppContext } from "@/contexts/app-context";
import type { Vehicle } from "@/app/dashboard/driver/vehicles/page";

interface VehicleFormDialogProps {
  children: React.ReactNode;
  vehicle?: Vehicle | null;
  onSave: (data: any) => void;
}

export default function VehicleFormDialog({ children, vehicle, onSave }: VehicleFormDialogProps) {
    const { t } = useAppContext();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: vehicle || {}
    });

    const onSubmit = (data: any) => {
        onSave(data);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{vehicle ? t('btn_edit_vehicle') : t('btn_add_vehicle')}</DialogTitle>
                        <DialogDescription>
                            {t('vehicle_form_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="make" className="text-right">{t('vehicle_brand_label')}</Label>
                            <Input id="make" {...register("make", { required: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="model" className="text-right">{t('vehicle_model_label')}</Label>
                            <Input id="model" {...register("model", { required: true })} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="year" className="text-right">{t('vehicle_year_label')}</Label>
                            <Input id="year" {...register("year", { required: true })} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="color" className="text-right">{t('vehicle_color_label')}</Label>
                            <Input id="color" {...register("color", { required: true })} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="plate" className="text-right">{t('license_plate_label')}</Label>
                            <Input id="plate" {...register("plate", { required: true })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit">{t('save_button')}</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}