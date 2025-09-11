'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError, UserCredential } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { doc, setDoc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/app-context';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import type { TranslationKeys } from '@/lib/i18n';


interface AuthDialogProps {
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void;
  role: string;
  onSuccess: (user: UserProfile) => void;
  isPage?: boolean;
}

// Helper to check if an error is an AuthError
function isAuthError(error: unknown): error is AuthError {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export default function AuthDialog({ isOpen, setIsOpen, role, onSuccess, isPage = false }: AuthDialogProps) {
  const { t, setUser } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signinEmail, setSigninEmail] = useState('');
  const [signupRole, setSignupRole] = useState<'passenger' | 'driver' | 'fleet-manager'>(role as 'passenger' | 'driver' | 'fleet-manager' || 'passenger');
  const [signinPassword, setSigninPassword] = useState(''); 
  const [signupName, setSignupName] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const auth = getAuth();

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupPasswordError('');
    setAuthError(''); 
    if (signupPassword !== signupConfirmPassword) {
      setSignupPasswordError('Passwords do not match.');
      return;
    }
    try { 
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;
      
      const profileData: UserProfile = {
        id: user.uid,
        email: signupEmail,
        name: signupName || 'New User',
        role: signupRole,
        status: 'active',
        balance: 0,
      };
      
      setUser(profileData);
      
      const collectionName = `${signupRole}s`;
      const userDocRef = doc(db, collectionName, user.uid);
      
      await setDoc(userDocRef, profileData, { merge: true });
      
      if (onSuccess) {
          onSuccess(profileData);
      }
      setIsOpen(false);
    } catch (error: unknown) {
      console.error("Signup error:", error);
      if (isAuthError(error)) {
        if (error.code === 'auth/email-already-in-use') {
            setAuthError(t('auth_error_email_in_use'));
        } else if (error.code === 'auth/weak-password') {
            setAuthError(t('auth_error_weak_password'));
        } else {
            setAuthError(t('auth_error_generic'));
        }
      } else {
         setAuthError(t('auth_error_generic'));
      }
    }
  };

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
        const userCredential = await signInWithEmailAndPassword(auth, signinEmail, signinPassword);

        if (onSuccess) {
            onSuccess({ id: userCredential.user.uid, role: 'passenger', name: '', email: '' }); 
        }

        setIsOpen(false);
    } catch (error: unknown) {
      console.error("Signin error:", error);
      if (isAuthError(error)) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            setAuthError(t('auth_error_invalid_credentials'));
        } else if (error.code === 'auth/too-many-requests') {
            setAuthError(t('auth_error_too_many_requests'));
        } else {
            setAuthError(t('auth_error_generic'));
        }
      } else {
         setAuthError(t('auth_error_generic'));
      }
    }
  };

  const formContent = (
      <Tabs defaultValue="signin" className="w-full" onValueChange={(value) => setIsLogin(value === 'signin')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">{t('auth_dialog_tab_signin')}</TabsTrigger>
          <TabsTrigger value="signup">{t('auth_dialog_tab_signup')}</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <form id="signin-form" onSubmit={handleSigninSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="signin-email" className="text-right">
                  {t('email_label')}
                </Label>
                <Input id="signin-email" type="email" className="col-span-3" value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="signin-password" className="text-right">
                  {t('password_label')}
                </Label>
                <Input id="signin-password" type="password" className="col-span-3" value={signinPassword} onChange={(e) => setSigninPassword(e.target.value)} required />
              </div>
            </div>
            {authError && isLogin && <p className="col-span-4 text-center text-sm text-destructive">{authError}</p>}
             <DialogFooter>
               <Button type="submit" className="w-full" form="signin-form">{t('login_button')}</Button>
            </DialogFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form id="signup-form" onSubmit={handleSignupSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="signup-name" className="text-right">{t('name_label')}</Label> 
                <Input id="signup-name" type="text" className="col-span-3" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="signup-email" className="text-right">{t('email_label')}</Label>
                <Input id="signup-email" type="email" className="col-span-3" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required /> 
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="signup-password" className="text-right">{t('password_label')}</Label>
                <Input id="signup-password" type="password" className="col-span-3" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
              </div> 
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="signup-confirm-password" className="text-right">{t('confirm_password_label')}</Label>
                <Input id="signup-confirm-password" type="password" className="col-span-3" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
              </div>
              {signupPasswordError && <p className="col-span-4 text-center text-sm text-destructive">{signupPasswordError}</p>}
              <div className="grid grid-cols-4 items-center gap-4 pt-2">
                 <Label className="text-right">{t('role_label')}</Label>
                 <RadioGroup defaultValue={role} value={signupRole} className="col-span-3 flex gap-4" onValueChange={(value: 'passenger' | 'driver' | 'fleet-manager') => setSignupRole(value)}>
                  <div className="flex items-center space-x-2">
                     <RadioGroupItem value="passenger" id="role-passenger" />
                    <Label htmlFor="role-passenger">{t('role_passenger')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="driver" id="role-driver" />
                    <Label htmlFor="role-driver">{t('role_driver')}</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fleet-manager" id="role-fleet-manager" />
                    <Label htmlFor="role-fleet-manager">{t('role_fleet-manager')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            {authError && !isLogin && <p className="col-span-4 text-center text-sm text-destructive">{authError}</p>}
             <DialogFooter>
               <Button type="submit" className="w-full" form="signup-form">{t('signup_button')}</Button>
            </DialogFooter>
          </form>
        </TabsContent>
      </Tabs>
  );

  if (isPage) {
    return formContent;
  }

  const formattedRole = t(`role_${role.toLowerCase()}` as TranslationKeys);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-primary text-2xl">
            {t('auth_dialog_title', { role: formattedRole })}
          </DialogTitle>
          <DialogDescription>
            {t('auth_dialog_description', { role: formattedRole })}
          </DialogDescription>
        </DialogHeader> 
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

    