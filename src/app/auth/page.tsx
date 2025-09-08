'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthDialog from '@/components/auth/auth-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import type { UserProfile } from '@/types';

// This line tells Next.js not to pre-render this page during the build.
export const dynamic = 'force-dynamic';

export default function AuthPage() {
    const { t, user } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const initialRole = searchParams.get('role') || 'passenger';
    const [role] = useState(initialRole);
    
    // This effect handles the redirect ONLY when the user object is fully loaded in the context.
    useEffect(() => {
        // user is undefined: Still loading.
        // user is not null: Login was successful and profile is fetched.
        if (user) { 
            const targetRole = user.role || 'passenger';
            router.push(`/dashboard/${targetRole}`);
        }
    }, [user, router]);


    const handleSuccess = (loggedInUser: UserProfile) => {
        // This function is now just a confirmation.
        // The useEffect above, which listens to the global user state, handles the redirect.
        console.log(`Login successful for user ID: ${loggedInUser.id}. Waiting for context to update and redirect.`);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                 <CardHeader className="text-center">
                     <CardTitle className="font-headline text-primary text-2xl">{t('auth_dialog_title_login')}</CardTitle>
                     <CardDescription>{t('auth_dialog_desc_login')}</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <AuthDialog
                         isOpen={true} 
                         setIsOpen={() => router.push('/')} // Go back to home if dialog is closed
                         role={role}
                         onSuccess={handleSuccess}
                         isPage={true} 
                     />
                 </CardContent>
            </Card>
        </div>
    );
}
