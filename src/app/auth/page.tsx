'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthDialog from '@/components/auth/auth-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import type { UserProfile } from '@/types';

export default function AuthPage() {
    const { t, user } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const initialRole = searchParams.get('role') || 'passenger';
    const [role, setRole] = useState(initialRole);

    // This effect handles redirection after a successful login
    useEffect(() => {
        if (user) { // user is a UserProfile object, meaning they are logged in
            const targetRole = user.role || 'passenger';
            router.push(`/dashboard/${targetRole}`);
        }
    }, [user, router]);


    const handleSuccess = (loggedInUser: UserProfile) => {
        // The useEffect above will handle the redirection once the user state is updated in the context
        console.log("handleSuccess called for user:", loggedInUser.name, "with role:", loggedInUser.role);
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
