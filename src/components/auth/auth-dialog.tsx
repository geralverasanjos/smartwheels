'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/app-context';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { db } from '@/lib/firebase';

interface AuthDialogProps {

  isOpen: boolean; 
  setIsOpen: (open: boolean) => void;
  role: string;
  onSuccess: () => void;
}

export default function AuthDialog({ isOpen, setIsOpen, role, onSuccess }: AuthDialogProps) {
  const { t } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signinEmail, setSigninEmail] = useState('');
  const [signupRole, setSignupRole] = useState<'passenger' | 'driver'>('passenger'); // Default to passenger
  const [signinPassword, setSigninPassword] = useState(''); 
  const [signupName, setSignupName] = useState(''); // State for user's name during signup
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const auth = getAuth();

  const formattedRole = t(`role_${role.toLowerCase()}` as any);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupPasswordError('');
    setAuthError(''); 
    if (signupPassword !== signupConfirmPassword) {
      setSignupPasswordError('Passwords do not match.'); // You can use a translation key here
      return;
    }
    try { 
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;
      
      // Create user profile in Firestore based on selected role
      const profileData = {
        id: user.uid,
        email: signupEmail,
        name: signupName || 'Novo Utilizador', // Use the name from input, or a default
        role: signupRole,
        // Add other initial fields as needed (phone, address, etc.)
      };

      // Determine the collection based on role and save the profile
      const collectionName = `${signupRole}s`; // 'passengers' or 'drivers'
      const userDocRef = doc(db, collectionName, user.uid);
      
      await setDoc(userDocRef, profileData, { merge: true });

      console.log("User signed up and profile created in Firestore:", user.uid, signupRole);
      
      if (onSuccess) {
          onSuccess();
      }
      setIsOpen(false);
    } catch (error: any) {
      console.error("Signup error:", error);
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Email already in use. Please try signing in.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password is too weak. Please choose a stronger password.');
      } else {
        setAuthError('An error occurred during signup. Please try again.');
      }
    }
  };

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try { 
      await signInWithEmailAndPassword(auth, signinEmail, signinPassword);
      if (onSuccess) {
          onSuccess();
      }
      setIsOpen(false);
    } catch (error: any) {
      setAuthError('Invalid email or password. Please try again.'); // Generic error for security
    }
  };
  
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
        <Tabs defaultValue="signin" className="w-[400px]" onValueChange={(value) => setIsLogin(value === 'signin')}>
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
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form id="signup-form" onSubmit={handleSignupSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="signup-email" className="text-right">
                    {t('email_label')}
                  </Label>
                  <Input id="signup-email" type="email" className="col-span-3" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required /> 
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="signup-name" className="text-right">{t('name_label')}</Label> 
                   <Input id="signup-name" type="text" className="col-span-3" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                 </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="signup-password" className="text-right">
                    {t('password_label')}
                  </Label>
                  <Input id="signup-password" type="password" className="col-span-3" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                </div> 
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="signup-confirm-password" className="text-right">
                    {t('confirm_password_label')} 
                  </Label>
                  <Input id="signup-confirm-password" type="password" className="col-span-3" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label className="text-right">
                    {t('role_label')}
                  </Label>
                   <RadioGroup defaultValue="passenger" className="col-span-3" onValueChange={(value: 'passenger' | 'driver') => setSignupRole(value)}>
                    <div className="flex items-center space-x-2">
                       <RadioGroupItem value="passenger" id="role-passenger" />
                      <Label htmlFor="role-passenger">{t('role_passenger')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="driver" id="role-driver" />
                      <Label htmlFor="role-driver">{t('role_driver')}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              {authError && <p className="col-span-4 text-center text-red-500">{authError}</p>}
            </form>
          </TabsContent>
          <DialogFooter>
             <Button type="submit" className="w-full" form={isLogin ? 'signin-form' : 'signup-form'}>{isLogin ? t('login_button') : t('signup_button')}</Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
