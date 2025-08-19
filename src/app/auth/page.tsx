'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthDialog from '@/components/auth/auth-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import type { UserProfile } from '@/types';

export default function AuthPage() {
    const { t } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const initialRole = searchParams.get('role') || 'passenger';
    const [role, setRole] = useState(initialRole);

    const handleSuccess = (loggedInUser: UserProfile) => {
        console.log("handleSuccess called with user:", loggedInUser);
        console.log(loggedInUser);
        // Use the role from the successfully logged-in user profile for redirection
        const targetRole = loggedInUser.role || 'passenger';
        console.log("Redirecting to dashboard for role:", targetRole);
        router.push(`/dashboard/${targetRole}`);
    };
 console.log("AuthPage rendering...");
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                 <CardHeader className="text-center">
                    <CardTitle className="font-headline text-primary text-2xl">{t('auth_dialog_title_login')}</CardTitle>
                    <CardDescription>{t('auth_dialog_desc_login')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuthDialog
                        isOpen={true} // This prop is managed by the page state now
                        setIsOpen={() => router.push('/')} // Go to home if dialog is closed
                        role={role}
                        onSuccess={handleSuccess}
                        isPage={true} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
