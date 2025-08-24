'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
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

export const AddEditPaymentMethodForm = ({ onSubmit, editingMethod, onClose }: { onSubmit: (values: Partial<PayoutMethod>) => void; editingMethod: Partial<PayoutMethod> | null, onClose: () => void; }) => {
    const { t } = useAppContext();
    const [methodType, setMethodType] = useState(editingMethod?.type || 'card');
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = methodType as PayoutMethod['type'];
        
        const values: Partial<PayoutMethod> = { type, isDefault: false };
        let details: PayoutMethod['details'] = {};
        
        if (type === 'card') {
            details = {
                cardholderName: formData.get('card_name') as string,
                cardNumber: formData.get('card_number') as string,
                cardExpiry: formData.get('card_expiry') as string,
                cardCvv: formData.get('card_cvv') as string,
            };
        } else if (type === 'bank') {
            details = {
                bankName: formData.get('bank_name') as string,
                accountHolder: formData.get('account_holder') as string,
                iban: formData.get('iban') as string,
            };
        } else if (type === 'paypal') {
            details = {
                email: formData.get('email') as string,
            };
        } else if (type === 'pix') {
             details = {
                keyType: formData.get('pix_key_type') as string,
                key: formData.get('pix_key') as string,
            };
        } else if (type === 'mbway') {
            details = {
                phone: formData.get('mbway_phone') as string,
            };
        }
        
        values.details = details;
        onSubmit(values);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{editingMethod ? t('payment_method_edit_title') : t('payout_method_add_title')}</DialogTitle>
                <DialogDescription>{t('payment_method_add_desc')}</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="method-type">{t('payment_method_type_label')}</Label>
                    <Select name="type" value={methodType} onValueChange={(value) => setMethodType(value as PayoutMethod['type'])}>
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
                </div>
                
                {methodType === 'card' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="card-name">{t('payment_method_card_name')}</Label>
                            <Input id="card-name" name="card_name" defaultValue={editingMethod?.details?.cardholderName} placeholder="Nome no Cartão" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-number">{t('payment_method_card_number')}</Label>
                            <Input id="card-number" name="card_number" defaultValue={editingMethod?.details?.cardNumber} placeholder="**** **** **** 1234" required/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="card-expiry">{t('payment_method_card_expiry')}</Label>
                                <Input id="card-expiry" name="card_expiry" defaultValue={editingMethod?.details?.cardExpiry} placeholder="MM/AA" required/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="card-cvv">CVV</Label>
                                <Input id="card-cvv" name="card_cvv" defaultValue={editingMethod?.details?.cardCvv} placeholder="123" required/>
                            </div>
                        </div>
                    </>
                )}
                {methodType === 'bank' && (
                     <>
                        <div className="space-y-2">
                            <Label htmlFor="bank-name">{t('bank_name_label')}</Label>
                            <Input id="bank-name" name="bank_name" defaultValue={editingMethod?.details?.bankName} placeholder="Nome do Banco" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-holder">{t('account_holder_label')}</Label>
                            <Input id="account-holder" name="account_holder" defaultValue={editingMethod?.details?.accountHolder} placeholder="Nome do Titular" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iban">{t('iban_label')}</Label>
                            <Input id="iban" name="iban" defaultValue={editingMethod?.details?.iban} placeholder="PT50..." required/>
                        </div>
                    </>
                )}

                {methodType === 'paypal' && (
                     <div className="space-y-2">
                        <Label htmlFor="paypal-email">{t('email_label')}</Label>
                        <Input id="paypal-email" name="email" type="email" defaultValue={editingMethod?.details?.email} placeholder="seu.email@example.com" required/>
                    </div>
                )}
                
                {methodType === 'pix' && (
                    <>
                         <div className="space-y-2">
                            <Label htmlFor="pix-key-type">{t('payment_method_pix_key_type')}</Label>
                            <Select name="pix_key_type" defaultValue={editingMethod?.details?.keyType || 'email'}>
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
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="pix-key">{t('payment_method_pix_key')}</Label>
                            <Input id="pix-key" name="pix_key" defaultValue={editingMethod?.details?.key} placeholder={t('payment_method_pix_key')} required/>
                        </div>
                    </>
                )}

                 {methodType === 'mbway' && (
                     <div className="space-y-2">
                        <Label htmlFor="mbway-phone">{t('payment_method_pix_phone')}</Label>
                        <Input id="mbway-phone" name="mbway_phone" type="tel" defaultValue={editingMethod?.details?.phone} placeholder="+351..." required/>
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
