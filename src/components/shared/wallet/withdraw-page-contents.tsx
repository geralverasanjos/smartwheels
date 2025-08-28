'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Banknote, Landmark, PlusCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/components/dashboard/dashboard-layout';
import { useCurrency } from '@/lib/currency';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { AddEditPaymentMethodForm } from '@/components/shared/wallet/payout-form';
import { PayoutMethod } from '@/types';

interface SavedAccount {
    id: string;
    type: string;
    name: string;
    details: string;
}

const savedAccounts: SavedAccount[] = [
    { id: 'bank1', type: 'bank', name: 'Conta Principal', details: '**** 1234' },
    { id: 'paypal1', type: 'paypal', name: 'PayPal Pessoal', details: 'eu@email.com' },
];

export default function WithdrawPageContents({ role }: { role: UserRole }) {
    const { t, user } = useAppContext();
    const { formatCurrency } = useCurrency();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('bank1');
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

    const handleWithdraw = () => {
        // Lógica de retirada
        console.log(`Withdrawing ${amount} to account ${selectedAccount}`);
        router.back();
    };
    
    const getBackLink = () => `/dashboard/${role}/wallet`;
    const getIcon = (type: string) => {
        switch(type) {
            case 'bank': return <Landmark className="h-6 w-6" />;
            case 'paypal': return <Banknote className="h-6 w-6" />;
            default: return <CreditCard className="h-6 w-6" />;
        }
    }

    const handleAddAccount = (values: Partial<PayoutMethod>) => {
        // Logic to add the new account
        console.log("New account to add:", values);
        setIsAddAccountOpen(false);
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" asChild>
                        <Link href={getBackLink()}><ArrowLeft /></Link>
                    </Button>
                    <div>
                        <h1 className="font-headline title-glow">{t('withdraw_funds_title')}</h1>
                        <p>{t('withdraw_funds_subtitle')}</p>
                    </div>
                </div>
            </div>
            
            <Card className="max-w-2xl mx-auto w-full">
                <CardHeader>
                    <CardTitle>{t('withdraw_details_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="amount">{t('withdraw_amount_label')}</Label>
                        <Input 
                            id="amount" 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">{t('available_balance')} {formatCurrency(user?.balance || 0)}</p>
                    </div>

                    <div className="space-y-4">
                        <Label>{t('withdraw_to_label')}</Label>
                        <ToggleGroup 
                            type="single" 
                            value={selectedAccount} 
                            onValueChange={(value) => { if(value) setSelectedAccount(value) }}
                            className="flex-col space-y-2"
                        >
                            {savedAccounts.map(acc => (
                                <ToggleGroupItem key={acc.id} value={acc.id} aria-label={acc.name} className={cn("h-auto w-full justify-start p-4 gap-4", selectedAccount === acc.id && 'border-primary ring-2 ring-primary')}>
                                    <div className="p-2 rounded-full bg-muted">{getIcon(acc.type)}</div>
                                    <div className="text-left">
                                        <p className="font-semibold">{acc.name}</p>
                                        <p className="text-sm text-muted-foreground">{acc.details}</p>
                                    </div>
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                         <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                            <DialogTrigger asChild>
                                 <Button variant="outline" className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    {t('btn_add_new_account')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <AddEditPaymentMethodForm 
                                    onSubmit={handleAddAccount} 
                                    editingMethod={null}
                                    onClose={() => setIsAddAccountOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleWithdraw} className="w-full" size="lg" disabled={!amount || parseFloat(amount) <= 0}>{t('btn_confirm_withdraw')}</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
