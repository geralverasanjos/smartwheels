'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/app-context';

interface AuthDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  role: string;
  onSuccess: () => void;
}

export default function AuthDialog({ isOpen, setIsOpen, role, onSuccess }: AuthDialogProps) {
  const { t } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);

  const formattedRole = t(`role_${role.toLowerCase()}` as any);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-primary text-2xl">
            {isLogin ? t('auth_dialog_title_login', { role: formattedRole }) : t('auth_dialog_title_register', { role: formattedRole })}
          </DialogTitle>
          <DialogDescription>
            {isLogin ? `Insira suas credenciais para acessar o painel de ${formattedRole}.` : `Crie sua conta para começar como ${formattedRole}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!isLogin && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('name_label')}
                </Label>
                <Input id="name" type="text" className="col-span-3" required />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('email_label')}
              </Label>
              <Input id="email" type="email" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                {t('password_label')}
              </Label>
              <Input id="password" type="password" className="col-span-3" required />
            </div>
             {!isLogin && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirm-password" className="text-right">
                  {t('confirm_password_label')}
                </Label>
                <Input id="confirm-password" type="password" className="col-span-3" required />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
             <Button type="submit" className="w-full">
              {isLogin ? t('login_button') : t('register_button')}
            </Button>
            <Button variant="link" type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? t('auth_dialog_switch_to_register') : t('auth_dialog_switch_to_login')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
