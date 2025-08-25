
'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import type { UserProfile } from '@/types';
import { Loader2, FileCheck, ShieldCheck, Car } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { saveUserProfile, uploadProfilePhoto } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import FileUploadCard from '@/components/shared/file-upload-card';

export default function FleetManagerProfilePage() {
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
            const updatedProfileData = { ...user, ...data };
            await saveUserProfile(updatedProfileData);
            setUser(updatedProfileData);
            toast({
                title: t('toast_profile_updated_title'),
                description: t('toast_profile_updated_desc'),
            });
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast({
                title: t('error_title'),
                description: "Failed to save profile.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    // Handles the upload and then saves the URL to the user's profile
    const handleSaveDocumentUrl = async (docType: keyof UserProfile, url: string) => {
        if (!user?.id) return;
        
        const updatedProfile = {
            ...user,
            [docType]: url,
        };

        await saveUserProfile(updatedProfile);
        setUser(updatedProfile); // Update context
    };

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
                titleKey="fleet_profile_title"
                descriptionKey="fleet_profile_desc"
            />
            <Card>
                <CardHeader>
                    <CardTitle>{t('driver_docs_title')}</CardTitle>
                    <CardDescription>{t('driver_docs_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <FileUploadCard
                        title={t('identity_document_title')}
                        description={t('identity_document_desc')}
                        icon={FileCheck}
                        fileUrl={user.identityDocumentUrl}
                        userId={user.id}
                        docType="identityDocumentUrl"
                        onSave={handleSaveDocumentUrl}
                    />
                    <FileUploadCard
                        title={t('commercial_license_title')}
                        description={t('commercial_license_desc')}
                        icon={ShieldCheck}
                        fileUrl={user.commercialLicenseUrl}
                        userId={user.id}
                        docType="commercialLicenseUrl"
                        onSave={handleSaveDocumentUrl}
                    />
                    <FileUploadCard
                        title={t('operator_license_title')}
                        description={t('operator_license_desc')}
                        icon={ShieldCheck}
                        fileUrl={user.operatorLicenseUrl}
                        userId={user.id}
                        docType="operatorLicenseUrl"
                        onSave={handleSaveDocumentUrl}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

