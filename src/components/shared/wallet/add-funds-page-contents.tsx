'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Banknote, Landmark } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/components/dashboard/dashboard-layout';
import { useCurrency } from '@/lib/currency';

const quickAmounts = [10, 20, 50, 100];

export default function AddFundsPageContents({ role }: { role: UserRole }) {
    const { t } = useAppContext();
    const { formatCurrency } = useCurrency();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('card');

    const handleAddFunds = () => {
        // Lógica de adicionar fundos
        console.log(`Adding ${amount} via ${selectedMethod}`);
        router.back();
    };
    
    const getBackLink = () => {
        return `/dashboard/${role}/wallet`;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" asChild>
                        <Link href={getBackLink()}><ArrowLeft /></Link>
                    </Button>
                    <div>
                        <h1 className="font-headline title-glow">{t('add_funds_title')}</h1>
                        <p>{t('add_funds_subtitle')}</p>
                    </div>
                </div>
            </div>
            
            <Card className="max-w-2xl mx-auto w-full">
                <CardHeader>
                    <CardTitle>{t('add_funds_amount_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {quickAmounts.map(val => (
                            <Button key={val} variant="outline" onClick={() => setAmount(val.toString())}>{formatCurrency(val)}</Button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">{t('add_funds_amount_label')}</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={t('add_funds_amount_placeholder')}
                        />
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle>{t('payment_method_label')}</CardTitle>
                </CardHeader>
                 <CardContent>
                    <ToggleGroup 
                        type="single" 
                        value={selectedMethod} 
                        onValueChange={(value) => { if(value) setSelectedMethod(value) }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                        <ToggleGroupItem value="card" aria-label={t('payment_method_credit_card')} className={cn("h-auto flex-col p-4 gap-2", selectedMethod === 'card' && 'border-primary ring-2 ring-primary')}>
                            <CreditCard className="h-8 w-8" />
                            <span>{t('payment_method_credit_card')}</span>
                        </ToggleGroupItem>
                         <ToggleGroupItem value="paypal" aria-label={t('payment_method_paypal')} className={cn("h-auto flex-col p-4 gap-2", selectedMethod === 'paypal' && 'border-primary ring-2 ring-primary')}>
                            <Banknote className="h-8 w-8" />
                            <span>{t('payment_method_paypal')}</span>
                        </ToggleGroupItem>
                         <ToggleGroupItem value="bank" aria-label={t('payment_method_bank_transfer')} className={cn("h-auto flex-col p-4 gap-2", selectedMethod === 'bank' && 'border-primary ring-2 ring-primary')}>
                            <Landmark className="h-8 w-8" />
                            <span>{t('payment_method_bank_transfer')}</span>
                        </ToggleGroupItem>
                    </ToggleGroup>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAddFunds} className="w-full" size="lg" disabled={!amount || parseFloat(amount) <= 0}>{t('btn_add_funds')}</Button>
                </CardFooter>
            </Card>
        </div>
    );
}