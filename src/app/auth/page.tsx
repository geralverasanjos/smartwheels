// FICHEIRO COMPLETO E CORRIGIDO
// src/app/auth/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthDialog from '@/components/auth/auth-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import type { UserProfile } from '@/types';

// Esta linha diz ao Next.js para não pré-renderizar esta página durante o build.
export const dynamic = 'force-dynamic';

export default function AuthPage() {
    const { t, user } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // O setRole não estava a ser usado, foi removido para limpar o código.
    const initialRole = searchParams.get('role') || 'passenger';
    const [role] = useState(initialRole);

    // Este efeito trata do redirecionamento após um login bem-sucedido
    useEffect(() => {
        if (user) { // user é um objeto UserProfile, significa que está logado
            const targetRole = user.role || 'passenger';
            router.push(`/dashboard/${targetRole}`);
        }
    }, [user, router]);


    const handleSuccess = (loggedInUser: UserProfile) => {
        // O useEffect acima irá tratar do redirecionamento assim que o estado do utilizador for atualizado no contexto
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