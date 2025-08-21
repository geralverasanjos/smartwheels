'use client';
import { AddEditPaymentMethodForm } from '@/components/shared/wallet/payout-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';
import { Banknote, Landmark, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const initialPayoutMethods = [
  { id: 'bank1', type: 'bank', name: 'Conta Principal da Frota', details: 'Bank of America - **** 5678', icon: Landmark, isDefault: true },
];

export default function FleetManagerBillingPage() {
    const { t } = useAppContext();
    const { toast } = useToast();
    const [payoutMethods, setPayoutMethods] = useState(initialPayoutMethods);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddOrEditMethod = (values: any) => {
        console.log("Saving payout method", values);
        toast({ title: t('payout_method_saved') });
        setIsDialogOpen(false);
    }

    const handleDelete = (id: string) => {
        setPayoutMethods(prev => prev.filter(p => p.id !== id));
        toast({ title: t('payout_method_deleted'), variant: 'destructive' });
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t('billing_page_title')}</h1>
                <p className="text-muted-foreground">{t('billing_page_subtitle')}</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('payout_methods_title')}</CardTitle>
                    <CardDescription>{t('payout_methods_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {payoutMethods.map(method => (
                        <div key={method.id} className="flex items-center gap-4 rounded-lg border p-4">
                            <method.icon className="h-6 w-6 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="font-semibold">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.details}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(method.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {t('btn_add_payout_method')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                             <AddEditPaymentMethodForm 
                                onSubmit={handleAddOrEditMethod} 
                                editingMethod={null}
                                onClose={() => setIsDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}
