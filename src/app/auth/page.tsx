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
    
    // The setRole was not being used, it was removed to clean up the code.
    const initialRole = searchParams.get('role') || 'passenger';
    const [role] = useState(initialRole);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // This effect handles the redirect after a successful login
    useEffect(() => {
        // When the user object is loaded from the context and is not null, redirect.
        if (isLoggedIn && user) { 
            const targetRole = user.role || 'passenger';
            router.push(`/dashboard/${targetRole}`);
        }
    }, [user, isLoggedIn, router]);


    const handleSuccess = (loggedInUser: UserProfile) => {
        // We just need to know that the login process was successful.
        // The useEffect above will handle the redirect once the user state is updated in the context.
        console.log("handleSuccess called for user:", loggedInUser.id);
        setIsLoggedIn(true);
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
                         setIsOpen={() => router.push('/')}
                         role={role}
                         onSuccess={handleSuccess}
                         isPage={true} 
                     />
                 </CardContent>
            </Card>
        </div>
    );
}
