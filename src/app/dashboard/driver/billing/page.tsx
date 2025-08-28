'use client';
import { AddEditPaymentMethodForm } from '@/components/shared/wallet/payout-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';
import { Banknote, CreditCard, Landmark, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getPayoutMethods, savePayoutMethod, deletePayoutMethod } from '@/services/payoutService';
import type { PayoutMethod } from '@/types';
import { PayPalIcon, MBWayIcon } from '@/components/ui/icons';
import type { TranslationKeys } from '@/lib/i18n';

export default function DriverBillingPage() {
    const { t, user } = useAppContext();
    const { toast } = useToast();
    const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PayoutMethod | null>(null);

    const fetchMethods = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const methods = await getPayoutMethods(userId);
            setPayoutMethods(methods);
        } catch (error) {
            toast({ title: t('error_title'), description: "Failed to load payout methods.", variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [t, toast]);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        fetchMethods(user.id);
    }, [user?.id, fetchMethods]);


    const handleSave = async (values: Partial<PayoutMethod>) => {
        if (!user?.id) return;
        const methodToSave: Omit<PayoutMethod, 'id'> = {
            userId: user.id,
            type: values.type!,
            details: values.details!,
            isDefault: values.isDefault || false,
        };

        try {
            await savePayoutMethod(methodToSave, editingMethod?.id);
            toast({ title: t('payout_method_saved') });
            fetchMethods(user.id); // Refresh list
            setIsDialogOpen(false);
            setEditingMethod(null);
        } catch (error) {
            console.error("Failed to save method:", error);
            toast({ title: t('error_title'), description: 'Failed to save method.', variant: 'destructive' });
        }
    }

    const handleDelete = async (id: string) => {
        if (!user?.id) return;
        try {
            await deletePayoutMethod(id);
            toast({ title: t('payout_method_deleted'), variant: 'destructive' });
            fetchMethods(user.id);
        } catch (error) {
             toast({ title: t('error_title'), description: 'Failed to delete method.', variant: 'destructive' });
        }
    }

    const handleOpenDialog = (method: PayoutMethod | null = null) => {
        setEditingMethod(method);
        setIsDialogOpen(true);
    }
    
    const getIcon = (type: PayoutMethod['type']) => {
        switch(type) {
            case 'bank': return Landmark;
            case 'paypal': return PayPalIcon;
            case 'pix': return Banknote;
            case 'mbway': return MBWayIcon;
            default: return CreditCard;
        }
    }
    
    const getMethodDetails = (method: PayoutMethod) => {
        if (method.type === 'bank') {
            return `${method.details.bankName} - **** ${method.details.iban?.slice(-4)}`;
        }
        if (method.type === 'paypal') {
            return method.details.email;
        }
        if (method.type === 'pix') {
            return `${t(method.details.keyType as TranslationKeys) || ''}: ${method.details.key}`;
        }
        if (method.type === 'mbway') {
            return `+${method.details.phone}`;
        }
        return 'N/A';
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t('billing_page_title')}</h1>
                <p className="text-muted-foreground">{t('billing_page_subtitle')}</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('payout_methods_title_driver')}</CardTitle>
                    <CardDescription>{t('payout_methods_desc_driver')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {loading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : payoutMethods.map(method => {
                        const Icon = getIcon(method.type);
                        return (
                            <div key={method.id} className="flex items-center gap-4 rounded-lg border p-4">
                                <Icon className="h-6 w-6 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="font-semibold">{method.details.accountHolder || method.details.email || method.details.key || method.details.phone}</p>
                                    <p className="text-sm text-muted-foreground">{getMethodDetails(method)}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(method.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )
                    })}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full" onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('btn_add_payout_method')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                             <AddEditPaymentMethodForm 
                                onSubmit={handleSave} 
                                editingMethod={editingMethod}
                                onClose={() => {
                                    setIsDialogOpen(false);
                                    setEditingMethod(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}
