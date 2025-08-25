'use client';
import { useState } from 'react';
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

const Step1_VehicleDetails = ({ onNext }: { onNext: () => void }) => {
    const { t } = useAppContext();
    const [files, setFiles] = useState({ carPhoto: '', docPhoto: '', permitPhoto: '' });

    const handleFileChange = (id: string, fileName: string) => {
        setFiles(prev => ({ ...prev, [id]: fileName }));
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    }
    
    return (
        <form onSubmit={handleFormSubmit}>
            <div className="space-y-4 animate-in fade-in-0">
                <CardHeader>
                    <CardTitle>{t('step1_title_car')}</CardTitle>
                    <CardDescription>{t('step1_desc_car')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>{t('vehicle_type_label')}</Label>
                        <Select name="vehicleType" required>
                            <SelectTrigger><SelectValue placeholder={t('select_placeholder')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="padrão">{t('category_standard_name')}</SelectItem>
                                <SelectItem value="executivo">{t('category_executive_name')}</SelectItem>
                                <SelectItem value="xl">{t('category_family_name')}</SelectItem>
                                <SelectItem value="eco">{t('category_eco_name')}</SelectItem>
                                <SelectItem value="acessível">{t('vehicle_type_accessible')}</SelectItem>
                                <SelectItem value="moto_economica">{t('mototaxi_service_economic_title')}</SelectItem>
                                <SelectItem value="moto_rapida">{t('mototaxi_service_fast_title')}</SelectItem>
                                <SelectItem value="moto_bau">{t('mototaxi_service_box_title')}</SelectItem>
                                <SelectItem value="tuk_tuk">{t('mototaxi_service_tuktuk_title')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>{t('vehicle_brand_label')}</Label><Input placeholder={t('brand_placeholder')} required /></div>
                    <div className="space-y-2"><Label>{t('vehicle_model_label')}</Label><Input placeholder={t('model_placeholder')} required /></div>
                    <div className="space-y-2"><Label>{t('vehicle_year_label')}</Label><Input type="number" placeholder={t('year_placeholder')} required /></div>
                    <div className="space-y-2"><Label>{t('vehicle_color_label')}</Label><Input placeholder={t('color_placeholder')} required /></div>
                    <div className="space-y-2"><Label>{t('license_plate_label')}</Label><Input placeholder={t('license_plate_placeholder')} required /></div>
                    <div className="md:col-span-2 space-y-4">
                        <FileUploadField id="carPhoto" label={t('vehicle_photo_label')} onFileChange={(fileName) => handleFileChange('carPhoto', fileName)} required />
                        <FileUploadField id="docPhoto" label={t('vehicle_doc_photo_label')} onFileChange={(fileName) => handleFileChange('docPhoto', fileName)} required />
                        <FileUploadField id="permitPhoto" label={t('permit_photo_label')} onFileChange={(fileName) => handleFileChange('permitPhoto', fileName)} required />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">{t('btn_next_step')}</Button>
                </CardFooter>
            </div>
        </form>
    );
};

const Step2_Subscription = ({ onBack }: { onBack: () => void }) => {
    const { t } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleSubmitAndPay = async () => {
        setIsProcessing(true);
        console.log("Saving vehicle data with 'pending_payment' status...");
        // TODO: Save vehicle data to Firestore with status 'pending_payment' and get the new vehicle ID.
        const newVehicleId = `vehicle_${Date.now()}`; // Mock ID

        console.log("Initiating payment for new vehicle ID:", newVehicleId);
        try {
            const { approvalUrl } = await handleVehicleFee(newVehicleId);
            if (approvalUrl) {
                // Redirect to PayPal for payment
                window.location.href = approvalUrl;
            } else {
                 console.error("No approval URL returned from PayPal.");
                 setIsProcessing(false);
            }
        } catch (error) {
            console.error("Payment initiation failed:", error);
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
                {step === 1 && <Step1_VehicleDetails onNext={() => setStep(2)} />}
                {step === 2 && <Step2_Subscription onBack={() => setStep(1)} />}
            </Card>
        </div>
    );
}
