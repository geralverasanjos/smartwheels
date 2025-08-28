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
import type { Vehicle } from "@/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VehicleFormDialogProps {
  children: React.ReactNode;
  vehicle?: Vehicle | null;
  onSave: (data: Partial<Vehicle>) => Promise<void>;
}

export default function VehicleFormDialog({ children, vehicle, onSave }: VehicleFormDialogProps) {
    const { t } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<Vehicle>({
        defaultValues: vehicle || {}
    });

    const onSubmit = async (data: Vehicle) => {
        setIsSaving(true);
        const dataToSave = { ...vehicle, ...data };
        await onSave(dataToSave);
        setIsSaving(false);
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
                            <Button variant="ghost">{t('btn_cancel')}</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {t('save_button')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
