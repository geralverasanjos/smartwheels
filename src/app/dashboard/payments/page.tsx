'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  CreditCard,
  Landmark,
  Wallet,
  Trash2,
  Edit,
  PlusCircle,
  Banknote,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M7.333 22.455c-1.35 0-2.32-.903-2.614-2.112l-1.38-6.953c-.158-.79.46-1.507 1.264-1.507h3.81c2.443 0 4.127-1.398 4.708-3.955.334-1.484.02-2.775-.85-3.64C11.53.51 10.035 0 8.396 0H2.617C1.782 0 1.07.64 1.002 1.45L0 8.018V8.5h4.43c.69 0 1.253.543 1.31 1.232l.533 6.95c.12 1.57.24 1.83.24 1.83.003.01.004.014.004.014.18 1.34 1.22 2.21 2.41 2.21h.403v.002c1.35 0 2.32-.903 2.613-2.112l1.343-6.742c.158-.79-.46-1.508-1.264-1.508h-3.08c-1.18 0-2.22-.84-2.5-1.98l-.208-1.29c-.11-.67.4-1.24.96-1.24h7.04c1.93 0 3.22.844 3.69 2.94.47 2.1-.24 3.9-1.53 5.08-1.29 1.18-3.13 1.8-5.26 1.8h-.83c-.76 0-1.41.59-1.5 1.35l-1.04 6.13c-.24 1.41-1.29 2.45-2.63 2.45h-.2zm9.352-19.14c-1.35 0-2.32.903-2.614 2.112l-1.38 6.953c-.158.79.46 1.507 1.263 1.507h3.81c2.443 0 4.127-1.398 4.708-3.955.335-1.484.02-2.775-.85-3.64-1.26-1.27-2.755-1.977-4.397-1.977h-.54z"/>
    </svg>
)

const MBWayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#D12027"/>
        <path d="M11.5 14.5h1v-5h-1v5zm3.75-2.25c0 .41-.34.75-.75.75s-.75-.34-.75-.75.34-.75.75-.75.75.34.75.75zm-6-2c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zm1.5 4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75-.75zm3-2.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75.34-.75.75-.75.75.34.75.75z" fill="#D12027"/>
    </svg>
)

const initialPaymentMethods = [
  { id: 'cash', typeKey: 'payment_method_type_cash', details: 'payment_method_cash_desc', icon: Banknote, isDefault: false },
  { id: 'wallet', typeKey: 'payment_method_type_wallet', details: 'passenger.booking.payment_wallet_balance', value: 50.00, icon: Wallet, isDefault: true },
  { id: 'card1', typeKey: 'payment_method_type_credit_card', detailsText: 'Mastercard **** 1234', icon: CreditCard, isDefault: false },
  { id: 'pix1', typeKey: 'payment_method_type_pix', detailsText: 'vinicius@email.com', icon: Send, isDefault: false },
  { id: 'mbway1', typeKey: 'payment_method_type_mbway', detailsText: '+351 912 345 678', icon: MBWayIcon, isDefault: false },
  { id: 'paypal1', typeKey: 'payment_method_type_paypal', detailsText: 'vinicius@paypal.com', icon: PayPalIcon, isDefault: false },
];

export default function PaymentsPage() {
  const { t, language } = useAppContext();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);

  const handleAddNewMethod = (values: any) => {
    // Logic to add a new payment method
    console.log(values);
    toast({ title: t('payment_method_add_success_title'), description: t('payment_method_add_success_desc') });
    setIsDialogOpen(false);
    setEditingMethod(null);
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    toast({ title: t('payment_method_delete_success_title'), description: t('payment_method_delete_success_desc'), variant: 'destructive' });
  };
  
  const handleSetDefault = (id: string) => {
      setPaymentMethods(prev => prev.map(method => ({...method, isDefault: method.id === id})));
  }

  const openAddDialog = () => {
      setEditingMethod(null);
      setIsDialogOpen(true);
  }

  const openEditDialog = (method: any) => {
      setEditingMethod(method);
      setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('payment_methods_title')}</CardTitle>
          <CardDescription>{t('payment_methods_desc_payment')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">{t('payment_methods_saved_title')}</h3>
          {paymentMethods.map(method => (
            <div key={method.id} className="flex items-center gap-4 rounded-lg border p-4">
              <method.icon className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-semibold">{t(method.typeKey as any)}</p>
                <p className="text-sm text-muted-foreground">
                    {method.detailsText ? method.detailsText : (method.id === 'wallet' && method.value ? `${t(method.details as any)}: ${new Intl.NumberFormat(language.value, { style: 'currency', currency: language.currency.code }).format(method.value)}` : t(method.details as any))}
                </p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSetDefault(method.id)}>
                    <RadioGroup value={method.isDefault ? method.id : ''} className="flex items-center">
                        <RadioGroupItem value={method.id} id={method.id}/>
                    </RadioGroup>
                    <Label htmlFor={method.id} className="text-sm text-muted-foreground cursor-pointer">{t('payment_method_default')}</Label>
                 </div>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(method)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteMethod(method.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('btn_add_payment_method')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <AddEditPaymentMethodForm 
                    onSubmit={handleAddNewMethod} 
                    editingMethod={editingMethod}
                    onClose={() => setIsDialogOpen(false)}
                />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

export const AddEditPaymentMethodForm = ({ onSubmit, editingMethod, onClose }: { onSubmit: (values: any) => void; editingMethod: any | null, onClose: () => void; }) => {
    const { t } = useAppContext();
    const [methodType, setMethodType] = useState(editingMethod?.typeKey?.split('_').pop() || 'card');
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const values = Object.fromEntries(formData.entries());
        onSubmit(values);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{editingMethod ? t('payment_method_edit_title') : t('payment_method_add_title')}</DialogTitle>
                <DialogDescription>{t('payment_method_add_desc')}</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="method-type">{t('payment_method_type_label')}</Label>
                    <Select value={methodType} onValueChange={setMethodType}>
                        <SelectTrigger id="method-type">
                            <SelectValue placeholder={t('payment_method_select_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="card">{t('payment_method_credit_card')}</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="mbway">MB WAY</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="bank">{t('payment_method_bank_account')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {methodType === 'pix' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="pix-name">{t('name_label')}</Label>
                            <Input id="pix-name" name="name" defaultValue={editingMethod?.name} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="pix-key-type">{t('payment_method_pix_key_type')}</Label>
                             <Select name="pix_key_type">
                                <SelectTrigger id="pix-key-type">
                                    <SelectValue placeholder={t('payment_method_pix_key_type_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="phone">{t('payment_method_pix_phone')}</SelectItem>
                                    <SelectItem value="email">{t('email_label')}</SelectItem>
                                    <SelectItem value="cpf">{t('payment_method_pix_cpf')}</SelectItem>
                                    <SelectItem value="random">{t('payment_method_pix_random')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pix-key">{t('payment_method_pix_key')}</Label>
                            <Input id="pix-key" name="pix_key" />
                        </div>
                    </>
                )}

                {methodType === 'mbway' && (
                     <>
                        <div className="space-y-2">
                            <Label htmlFor="mbway-name">{t('name_label')}</Label>
                            <Input id="mbway-name" name="name" defaultValue={editingMethod?.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mbway-phone">{t('payment_method_pix_phone')}</Label>
                            <Input id="mbway-phone" name="phone" type="tel" defaultValue={editingMethod?.phone} />
                        </div>
                    </>
                )}
                 {methodType === 'paypal' && (
                     <div className="space-y-2">
                        <Label htmlFor="paypal-email">{t('email_label')}</Label>
                        <Input id="paypal-email" name="email" type="email" defaultValue={editingMethod?.email} />
                    </div>
                 )}

                {(methodType === 'card' || methodType === 'bank') && (
                     <>
                        <div className="space-y-2">
                            <Label htmlFor="card-name">{t('payment_method_card_name')}</Label>
                            <Input id="card-name" name="card_name" defaultValue={editingMethod?.card_name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-number">{t('payment_method_card_number')}</Label>
                            <Input id="card-number" name="card_number" defaultValue={editingMethod?.card_number} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="card-expiry">{t('payment_method_card_expiry')}</Label>
                                <Input id="card-expiry" name="card_expiry" placeholder="MM/AA" defaultValue={editingMethod?.card_expiry} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="card-cvv">CVV</Label>
                                <Input id="card-cvv" name="card_cvv" defaultValue={editingMethod?.card_cvv} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost" onClick={onClose}>{t('cancel_button')}</Button>
                </DialogClose>
                <Button type="submit">{editingMethod ? t('save_button') : t('add_button')}</Button>
            </DialogFooter>
        </form>
    )
}
