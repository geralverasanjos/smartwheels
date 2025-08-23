'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import type { UserProfile } from '@/types';
import { Loader2, FileCheck, ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { saveUserProfile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import FileUploadCard from '@/components/shared/file-upload-card';

export default function DriverProfilePage() {
    const { t, user, setUser } = useAppContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user !== undefined) {
            setLoading(false);
        }
    }, [user]);

    const handleSaveProfile = async (data: Partial<UserProfile>) => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const updatedProfile: UserProfile = {
                ...user,
                ...data,
            };
            await saveUserProfile(updatedProfile);
            setUser(updatedProfile);
            toast({
                title: t('toast_profile_updated_title'),
                description: t('toast_profile_updated_desc'),
            });
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast({
                title: t('error_title'),
                description: t('error_saving_profile'),
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDocumentUpload = async (docType: 'identityDocumentUrl' | 'driverLicenseUrl', file: File) => {
        if (!user) return;
        // The upload logic is inside FileUploadCard, here we just need to update the user profile
        // This is a mock function for now, as the real URL update will happen via the component itself
        // and onSave in the main ProfileForm.
        console.log(`Uploading ${file.name} for ${docType}`);
        toast({
            title: "Ficheiro Carregado",
            description: "O seu documento foi carregado. Clique em 'Salvar Alterações' no formulário principal para guardar a referência.",
        })
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
    }
    
    if (!user) {
        return <div>{t('error_loading_profile')}</div>
    }

    return (
        <div className="space-y-8">
            <ProfileForm 
                userData={user}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                titleKey="driver_profile_title"
                descriptionKey="driver_profile_desc"
            />
            <Card>
                <CardHeader>
                    <CardTitle>{t('vehicle_docs_title')}</CardTitle>
                    <CardDescription>{t('driver_docs_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                     <FileUploadCard
                        title={t('identity_document_title')}
                        description={t('identity_document_desc')}
                        icon={FileCheck}
                        fileUrl={user.identityDocumentUrl}
                        userId={user.id}
                        docType="identityDocumentUrl"
                        onSave={handleSaveProfile}
                    />
                    <FileUploadCard
                        title={t('driver_license_title')}
                        description={t('driver_license_desc')}
                        icon={ShieldCheck}
                        fileUrl={user.driverLicenseUrl}
                        userId={user.id}
                        docType="driverLicenseUrl"
                        onSave={handleSaveProfile}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
