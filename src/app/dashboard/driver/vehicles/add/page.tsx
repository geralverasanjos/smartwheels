'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Wallet, Landmark, HandCoins, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/contexts/app-context';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleVehicleFee } from '@/lib/payments';

const FileUploadField = ({ label, id, onFileChange }: { label: string, id: string, onFileChange: (fileName: string) => void }) => {
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
            <Input id={id} type="file" className="hidden" onChange={handleFileChange} />
        </div>
    );
};

// --- Sub-componente para o Passo 1: Detalhes do Veículo ---
const Step1_VehicleDetails = ({ onNext }: { onNext: () => void }) => {
    const { t } = useAppContext();
    const [files, setFiles] = useState({ carPhoto: '', docPhoto: '', permitPhoto: '' });

    const handleFileChange = (id: string, fileName: string) => {
        setFiles(prev => ({ ...prev, [id]: fileName }));
    };
    
    return (
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
                <div className="space-y-2"><Label>{t('vehicle_brand_label')}</Label><Input placeholder={t('brand_placeholder')} /></div>
                <div className="space-y-2"><Label>{t('vehicle_model_label')}</Label><Input placeholder={t('model_placeholder')} /></div>
                <div className="space-y-2"><Label>{t('vehicle_year_label')}</Label><Input type="number" placeholder={t('year_placeholder')} /></div>
                <div className="space-y-2"><Label>{t('vehicle_color_label')}</Label><Input placeholder={t('color_placeholder')} /></div>
                <div className="space-y-2"><Label>{t('license_plate_label')}</Label><Input placeholder={t('license_plate_placeholder')} /></div>
                <div className="md:col-span-2 space-y-4">
                    <FileUploadField id="carPhoto" label={t('vehicle_photo_label')} onFileChange={(fileName) => handleFileChange('carPhoto', fileName)} />
                    <FileUploadField id="docPhoto" label={t('vehicle_doc_photo_label')} onFileChange={(fileName) => handleFileChange('docPhoto', fileName)} />
                    <FileUploadField id="permitPhoto" label={t('permit_photo_label')} onFileChange={(fileName) => handleFileChange('permitPhoto', fileName)} />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onNext} className="w-full">{t('btn_next_step')}</Button>
            </CardFooter>
        </div>
    );
};

// --- Sub-componente para o Passo 2: Métodos de Recebimento ---
const Step2_ReceivingMethods = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
    const { t } = useAppContext();
    return (
        <div className="space-y-4 animate-in fade-in-0">
            <CardHeader>
                <CardTitle>{t('step2_title')}</CardTitle>
                <CardDescription>{t('step2_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3"><HandCoins className="h-5 w-5 text-green-500" /><Label>{t('method_cash')}</Label></div>
                    <Switch defaultChecked />
                </div>
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3"><Wallet className="h-5 w-5 text-blue-600" /><Label>{t('payment_method_paypal')}</Label></div>
                    <Switch />
                </div>
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3"><Landmark className="h-5 w-5 text-gray-500" /><Label>{t('payment_method_bank_account')}</Label></div>
                    <Switch />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={onBack}>{t('btn_previous')}</Button>
                <Button onClick={onNext}>{t('btn_next_step')}</Button>
            </CardFooter>
        </div>
    );
};

// --- Sub-componente para o Passo 3: Subscrição ---
const Step3_Subscription = ({ onBack }: { onBack: () => void }) => {
    const { t } = useAppContext();
    const router = useRouter();
    const [termsAccepted, setTermsAccepted] = useState(false);
    
    const handleSubmitAndPay = async () => {
        // Lógica de guardar os dados antes de redirecionar
        console.log("Saving all data before payment redirect...");
        try {
            const { approvalUrl } = await handleVehicleFee();
            if (approvalUrl) {
                router.push(approvalUrl);
            }
        } catch (error) {
            console.error("Payment initiation failed", error);
            // Show a toast or error message to the user
        }
    }

    return (
         <div className="space-y-4 animate-in fade-in-0">
            <CardHeader className="text-center">
                <CardTitle>{t('step3_title')}</CardTitle>
                <CardDescription>{t('step3_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('subscribe_monthly_fee')}</p>
                    <p className="text-4xl font-bold">€3,00</p>
                </div>
                 <div className="flex items-center space-x-2 mt-6 justify-center">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                    <Label htmlFor="terms" className="text-xs">{t('terms_acceptance_part1')} <Link href="/terms" className="underline text-primary">{t('terms_acceptance_link')}</Link>.</Label>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={onBack}>{t('btn_previous')}</Button>
                 <Button onClick={handleSubmitAndPay} disabled={!termsAccepted}>
                    {t('btn_save_and_proceed_payment')}
                 </Button>
            </CardFooter>
        </div>
    );
};


// --- O Componente Principal da Página ---
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
                {step === 2 && <Step2_ReceivingMethods onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                {step === 3 && <Step3_Subscription onBack={() => setStep(2)} />}
            </Card>
        </div>
    );
}
