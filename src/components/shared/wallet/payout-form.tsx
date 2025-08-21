'use client';
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/contexts/app-context";
import { useState } from "react";

export const AddEditPaymentMethodForm = ({ onSubmit, editingMethod, onClose }: { onSubmit: (values: any) => void; editingMethod: any | null, onClose: () => void; }) => {
    const { t } = useAppContext();
    const [methodType, setMethodType] = useState(editingMethod?.typeKey?.split('_').pop() || 'bank');
    
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
                <DialogTitle>{editingMethod ? t('payout_method_edit_title') : t('payout_method_add_title')}</DialogTitle>
                <DialogDescription>{t('payout_method_add_desc')}</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="method-type">{t('payment_method_type_label')}</Label>
                    <Select value={methodType} onValueChange={setMethodType}>
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
                        <Input id="paypal-email" name="email" type="email" defaultValue={editingMethod?.email} placeholder="seu.email@example.com" required/>
                    </div>
                 )}

                {methodType === 'bank' && (
                     <>
                        <div className="space-y-2">
                            <Label htmlFor="bank-name">{t('bank_name_label')}</Label>
                            <Input id="bank-name" name="bank_name" defaultValue={editingMethod?.bank_name} placeholder="Nome do Banco" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-holder">{t('account_holder_label')}</Label>
                            <Input id="account-holder" name="account_holder" defaultValue={editingMethod?.account_holder} placeholder="Nome do Titular" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iban">{t('iban_label')}</Label>
                            <Input id="iban" name="iban" defaultValue={editingMethod?.iban} placeholder="PT50..." required/>
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
