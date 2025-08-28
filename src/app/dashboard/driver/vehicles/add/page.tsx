'use client';
import { useState } from 'react';
import { useForm, FormProvider, Controller, useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, UploadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/contexts/app-context';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleVehicleFee } from '@/lib/payments';
import { serviceCategories } from '@/data/categories';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveVehicle } from '@/services/vehicleService';
import type { Vehicle } from '@/types';


const FileUploadField = ({ label, id, onFileChange, required = false }: { label: string, id: string, onFileChange: (fileName: string) => void, required?: boolean }) => {
    const { t } = useAppContext();
    const [fileName, setFileName] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            setFileName(file.name);
            onFileChange(file.name);
        } else {
            setFileName('');
            onFileChange('');
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <label htmlFor={id} className="flex items-center gap-4 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                <UploadCloud className="h-8 w-8 text-muted-foreground"/>
                <div>
                    <span className="font-semibold text-primary">{t('btn_choose_files')}</span>
                    <p className="text-xs text-muted-foreground">{fileName || t('no_file_chosen_label')}</p>
                </div>
            </label>
            <Input id={id} type="file" className="hidden" onChange={handleFileChange} required={required} />
        </div>
    );
};

const Step1_VehicleDetails = ({ onNext, setFormData }: { onNext: () => void, setFormData: (data: any) => void }) => {
    const { t } = useAppContext();
    const methods = useForm({
        mode: 'onChange' 
    });
    const { register, handleSubmit, control, formState: { errors, isValid } } = methods;

    const handleFormSubmit = (data: any) => {
        setFormData(data);
        onNext();
    }
    
    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="space-y-4 animate-in fade-in-0">
                    <CardHeader>
                        <CardTitle>{t('step1_title_car')}</CardTitle>
                        <CardDescription>{t('step1_desc_car')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label>{t('vehicle_type_label')}</Label>
                             <Controller
                                name="type"
                                control={control}
                                rules={{ required: t('field_required') as string }}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger id="vehicleType">
                                            <SelectValue placeholder={t('select_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceCategories.map((service) => (
                                                <SelectItem key={service.id} value={service.id}>
                                                    <div className="flex items-start gap-3 py-2">
                                                        <service.icon className="h-5 w-5 mt-1 text-muted-foreground"/>
                                                        <div>
                                                            <p className="font-semibold">{t(service.titleKey)}</p>
                                                            <p className="text-xs text-muted-foreground">{t(service.descriptionKey)}</p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.type && <p className="text-sm text-destructive">{errors.type.message as string}</p>}
                        </div>
                        <div className="space-y-2"><Label>{t('vehicle_brand_label')}</Label><Input placeholder={t('brand_placeholder')} {...register("make", { required: t('field_required') as string })} />{errors.make && <p className="text-sm text-destructive">{errors.make.message as string}</p>}</div>
                        <div className="space-y-2"><Label>{t('vehicle_model_label')}</Label><Input placeholder={t('model_placeholder')} {...register("model", { required: t('field_required') as string })} />{errors.model && <p className="text-sm text-destructive">{errors.model.message as string}</p>}</div>
                        <div className="space-y-2"><Label>{t('vehicle_year_label')}</Label><Input type="number" placeholder={t('year_placeholder')} {...register("year", { required: t('field_required') as string })} />{errors.year && <p className="text-sm text-destructive">{errors.year.message as string}</p>}</div>
                        <div className="space-y-2"><Label>{t('vehicle_color_label')}</Label><Input placeholder={t('color_placeholder')} {...register("color", { required: t('field_required') as string })} />{errors.color && <p className="text-sm text-destructive">{errors.color.message as string}</p>}</div>
                        <div className="space-y-2"><Label>{t('license_plate_label')}</Label><Input placeholder={t('license_plate_placeholder')} {...register("plate", { required: t('field_required') as string })} />{errors.plate && <p className="text-sm text-destructive">{errors.plate.message as string}</p>}</div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={!isValid}>{t('btn_next_step')}</Button>
                    </CardFooter>
                </div>
            </form>
        </FormProvider>
    );
};

const Step2_Subscription = ({ onBack, formData }: { onBack: () => void, formData: any }) => {
    const { t, user } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleSubmitAndPay = async () => {
        if (!user?.id) {
             toast({ title: t('error_title'), description: t('auth_error_generic'), variant: 'destructive'});
             return;
        }
        setIsProcessing(true);
        
        const newVehicleData: Omit<Vehicle, 'id'> = {
            ...formData,
            driverId: user.id,
            status: 'pending_payment',
            allowedServices: ['passengers', 'deliveries'] // Default services
        };

        try {
            const vehicleRef = await saveVehicle(newVehicleData);
            const newVehicleId = vehicleRef.id;

            console.log("Initiating payment for new vehicle ID:", newVehicleId);
            const { approvalUrl } = await handleVehicleFee(newVehicleId);
            if (approvalUrl) {
                window.location.href = approvalUrl;
            } else {
                 toast({ title: t('error_title'), description: 'Failed to get payment approval URL.', variant: 'destructive' });
                 setIsProcessing(false);
            }
        } catch (error) {
            console.error("Payment initiation failed:", error);
            toast({ title: t('error_title'), description: 'Failed to save vehicle or initiate payment.', variant: 'destructive' });
            setIsProcessing(false);
        }
    }

    return (
         <div className="space-y-4 animate-in fade-in-0">
            <CardHeader className="text-center">
                <CardTitle>{t('step2_title')}</CardTitle>
                <CardDescription>{t('step2_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('subscribe_monthly_fee')}</p>
                    <p className="text-4xl font-bold">€3,00</p>
                </div>
                 <div className="flex items-center space-x-2 mt-6 justify-center">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                    <Label htmlFor="terms" className="text-xs">{t('terms_acceptance_part1')} <Link href={`/terms?from=${pathname}`} className="underline text-primary">{t('terms_acceptance_link')}</Link>.</Label>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={onBack} disabled={isProcessing}>{t('btn_previous')}</Button>
                 <Button onClick={handleSubmitAndPay} disabled={!termsAccepted || isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('btn_save_and_proceed_payment')}
                 </Button>
            </CardFooter>
        </div>
    );
};


export default function AddVehiclePage() {
    const { t } = useAppContext();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/driver/vehicles"><ArrowLeft /></Link>
                    </Button>
                    <div>
                        <h1 className="font-headline title-glow">{t('add_vehicle_page_title')}</h1>
                        <p>{t('add_vehicle_page_subtitle')}</p>
                    </div>
                </div>
            </div>
            
            <Card className="max-w-2xl mx-auto w-full">
                {step === 1 && <Step1_VehicleDetails onNext={() => setStep(2)} setFormData={setFormData} />}
                {step === 2 && <Step2_Subscription onBack={() => setStep(1)} formData={formData} />}
            </Card>
        </div>
    );
}
