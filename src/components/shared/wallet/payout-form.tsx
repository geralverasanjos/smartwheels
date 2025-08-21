'use client';
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/contexts/app-context";
import { useState } from "react";
import type { PayoutMethod } from "@/types";

export const AddEditPaymentMethodForm = ({ onSubmit, editingMethod, onClose }: { onSubmit: (values: Partial<PayoutMethod>) => void; editingMethod: Partial<PayoutMethod> | null, onClose: () => void; }) => {
    const { t } = useAppContext();
    const [methodType, setMethodType] = useState(editingMethod?.type || 'bank');
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const type = formData.get('type') as 'bank' | 'paypal';

        const values: Partial<PayoutMethod> = {
            type: type,
            details: {}
        };

        if (type === 'bank') {
            values.details = {
                bankName: formData.get('bank_name') as string,
                accountHolder: formData.get('account_holder') as string,
                iban: formData.get('iban') as string,
            };
        } else if (type === 'paypal') {
            values.details = {
                email: formData.get('email') as string,
            };
        }

        onSubmit(values);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{editingMethod ? t('payout_method_edit_title') : t('payout_method_add_title')}</DialogTitle>
                <DialogDescription>{t('payout_method_add_desc')}</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="method-type">{t('payment_method_type_label')}</Label>
                    <Select name="type" value={methodType} onValueChange={(value) => setMethodType(value as 'bank' | 'paypal')}>
                        <SelectTrigger id="method-type">
                            <SelectValue placeholder={t('payment_method_select_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bank">{t('payment_method_bank_account')}</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {methodType === 'paypal' && (
                     <div className="space-y-2">
                        <Label htmlFor="paypal-email">{t('email_label')}</Label>
                        <Input id="paypal-email" name="email" type="email" defaultValue={editingMethod?.details?.email} placeholder="seu.email@example.com" required/>
                    </div>
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
