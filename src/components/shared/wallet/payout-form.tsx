'use client';
import { useAppContext } from '@/contexts/app-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PayoutMethod } from '@/types';
import { Button } from '@/components/ui/button';

// Zod schema for validation
const formSchema = z.object({
  type: z.enum(['card', 'bank', 'paypal', 'pix', 'mbway']),
  details: z.object({
    cardholderName: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
    bankName: z.string().optional(),
    accountHolder: z.string().optional(),
    iban: z.string().optional(),
    email: z.string().optional(),
    keyType: z.string().optional(),
    key: z.string().optional(),
    phone: z.string().optional(),
  }),
});


export function AddEditPaymentMethodForm({ onSubmit, editingMethod, onClose }: { onSubmit: (values: Partial<PayoutMethod>) => void; editingMethod: Partial<PayoutMethod> | null, onClose: () => void; }) {
    const { t } = useAppContext();
    const { control, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: editingMethod?.type || 'card',
            details: {
                cardholderName: editingMethod?.details?.cardholderName || '',
                cardNumber: editingMethod?.details?.cardNumber || '',
                cardExpiry: editingMethod?.details?.cardExpiry || '',
                cardCvv: editingMethod?.details?.cardCvv || '',
                bankName: editingMethod?.details?.bankName || '',
                accountHolder: editingMethod?.details?.accountHolder || '',
                iban: editingMethod?.details?.iban || '',
                email: editingMethod?.details?.email || '',
                keyType: editingMethod?.details?.keyType || '',
                key: editingMethod?.details?.key || '',
                phone: editingMethod?.details?.phone || '',
            }
        }
    });

    const methodType = watch('type');

    const onFormSubmit = (data: z.infer<typeof formSchema>) => {
        onSubmit({
            type: data.type,
            details: data.details,
            isDefault: false
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
            <DialogHeader>
                <DialogTitle>{editingMethod ? t('payment_method_edit_title') : t('payout_method_add_title')}</DialogTitle>
                <DialogDescription>{t('payment_method_add_desc')}</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="method-type">{t('payment_method_type_label')}</Label>
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="method-type">
                                    <SelectValue placeholder={t('payment_method_select_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="card">{t('payment_method_type_credit_card')}</SelectItem>
                                    <SelectItem value="bank">{t('payment_method_bank_account')}</SelectItem>
                                    <SelectItem value="paypal">{t('payment_method_paypal')}</SelectItem>
                                    <SelectItem value="pix">{t('payment_method_pix')}</SelectItem>
                                    <SelectItem value="mbway">{t('payment_method_mbway')}</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                
                {methodType === 'card' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="card-name">{t('payment_method_card_name')}</Label>
                             <Controller name="details.cardholderName" control={control} render={({ field }) => <Input id="card-name" {...field} placeholder="Nome no Cartão" required />} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-number">{t('payment_method_card_number')}</Label>
                             <Controller name="details.cardNumber" control={control} render={({ field }) => <Input id="card-number" {...field} placeholder="**** **** **** 1234" required />} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="card-expiry">{t('payment_method_card_expiry')}</Label>
                                <Controller name="details.cardExpiry" control={control} render={({ field }) => <Input id="card-expiry" {...field} placeholder="MM/AA" required />} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="card-cvv">CVV</Label>
                                <Controller name="details.cardCvv" control={control} render={({ field }) => <Input id="card-cvv" {...field} placeholder="123" required />} />
                            </div>
                        </div>
                    </>
                )}
                {methodType === 'bank' && (
                     <>
                        <div className="space-y-2">
                            <Label htmlFor="bank-name">{t('bank_name_label')}</Label>
                             <Controller name="details.bankName" control={control} render={({ field }) => <Input id="bank-name" {...field} placeholder="Nome do Banco" required />} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-holder">{t('account_holder_label')}</Label>
                            <Controller name="details.accountHolder" control={control} render={({ field }) => <Input id="account-holder" {...field} placeholder="Nome do Titular" required />} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iban">{t('iban_label')}</Label>
                            <Controller name="details.iban" control={control} render={({ field }) => <Input id="iban" {...field} placeholder="PT50..." required />} />
                        </div>
                    </>
                )}

                {methodType === 'paypal' && (
                     <div className="space-y-2">
                        <Label htmlFor="paypal-email">{t('email_label')}</Label>
                        <Controller name="details.email" control={control} render={({ field }) => <Input id="paypal-email" type="email" {...field} placeholder="seu.email@example.com" required />} />
                    </div>
                )}
                
                {methodType === 'pix' && (
                    <>
                         <div className="space-y-2">
                            <Label htmlFor="pix-key-type">{t('payment_method_pix_key_type')}</Label>
                             <Controller
                                name="details.keyType"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value || 'email'}>
                                        <SelectTrigger id="pix-key-type">
                                            <SelectValue placeholder={t('payment_method_pix_key_type_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="email">{t('email_label')}</SelectItem>
                                            <SelectItem value="phone">{t('payment_method_pix_phone')}</SelectItem>
                                            <SelectItem value="cpf">{t('payment_method_pix_cpf')}</SelectItem>
                                            <SelectItem value="random">{t('payment_method_pix_random')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                             />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="pix-key">{t('payment_method_pix_key')}</Label>
                            <Controller name="details.key" control={control} render={({ field }) => <Input id="pix-key" {...field} placeholder={t('payment_method_pix_key')} required />} />
                        </div>
                    </>
                )}

                 {methodType === 'mbway' && (
                     <div className="space-y-2">
                        <Label htmlFor="mbway-phone">{t('payment_method_pix_phone')}</Label>
                        <Controller name="details.phone" control={control} render={({ field }) => <Input id="mbway-phone" type="tel" {...field} placeholder="+351..." required />} />
                    </div>
                 )}
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost" onClick={onClose}>{t('btn_cancel')}</Button>
                </DialogClose>
                <Button type="submit">{editingMethod ? t('btn_save') : t('btn_add_payout_method')}</Button>
            </DialogFooter>
        </form>
    )
}
