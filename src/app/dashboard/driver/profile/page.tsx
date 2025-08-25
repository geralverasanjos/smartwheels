
'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import type { UserProfile } from '@/types';
import { Loader2, FileCheck, ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { saveUserProfile, uploadProfilePhoto } from '@/services/profileService';
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
            // Merge the form data with the existing user data to ensure nothing is lost.
            const updatedProfileData = { ...user, ...data };
            await saveUserProfile(updatedProfileData);
            // Update the user in the global context to reflect changes immediately.
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
    
    // This function is passed to the FileUploadCard component.
    // It handles the file upload and then saves the returned URL to the user's profile.
    const handleSaveDocumentUrl = async (docType: keyof UserProfile, url: string) => {
        if (!user?.id) return;
        
        // Create an updated profile object with the new document URL.
        const updatedProfile = {
            ...user,
            [docType]: url,
        };

        // Save the updated profile to Firestore.
        await saveUserProfile(updatedProfile);
        // Update the user in the global context.
        setUser(updatedProfile); 
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
    }
    
    if (!user) {
        // This case should ideally be handled by the layout which redirects unauthenticated users.
        return <div>{t('error_loading_profile')}</div>
    }

    return (
        <div className="space-y-8">
            {/* The main profile form for personal data */}
            <ProfileForm 
                userData={user}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                titleKey="driver_profile_title"
                descriptionKey="driver_profile_desc"
            />
            {/* A separate card for document uploads */}
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
                        title={t('driver_license_title')}
                        description={t('driver_license_desc')}
                        icon={ShieldCheck}
                        fileUrl={user.driverLicenseUrl}
                        userId={user.id}
                        docType="driverLicenseUrl"
                        onSave={handleSaveDocumentUrl}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
