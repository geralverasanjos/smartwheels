'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthDialog from '@/components/auth/auth-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import { User } from 'firebase/auth';

export default function AuthPage() {
    const { t, user } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Determine the initial role from URL or default to 'passenger'
    const initialRole = searchParams.get('role') || 'passenger';
    const [role, setRole] = useState(initialRole);

    const handleSuccess = (loggedInUser: User & { role?: string }) => {
        // Redirect based on the role the user signed up/in with
        const targetRole = loggedInUser.role || 'passenger';
        router.push(`/dashboard/${targetRole}`);
    };
    
    // This allows the component to be used as a page, not just a dialog
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-md">
                 <AuthDialog
                    isOpen={true}
                    setIsOpen={() => router.push('/')} // Go to home if dialog is closed
                    role={role}
                    onSuccess={handleSuccess as any}
                    isPage={true} // New prop to control rendering style
                />
            </div>
        </div>
    );
}
