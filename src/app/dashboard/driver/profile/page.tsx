
'use client';
import { useAppContext } from '@/contexts/app-context';
import ProfileForm from '@/components/shared/ProfileForm';
import { useToast } from '@/hooks/use-toast';
import { saveUserProfile } from '@/services/profileService';
import type { UserProfile } from '@/types';
import FileUploadCard from '@/components/shared/file-upload-card';
import { FileText } from 'lucide-react';
import { useState } from 'react';

export default function DriverProfilePage() {
    const { t, user, setUser } = useAppContext();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const updatedProfile = { ...user, ...data };
            await saveUserProfile(updatedProfile);
            setUser(updatedProfile);
            toast({
                title: t('toast_profile_updated_title'),
                description: t('toast_profile_updated_desc'),
            });
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast({ title: t('error_title'), description: "Failed to save profile.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSaveDocumentUrl = async (docType: keyof UserProfile, url: string) => {
        if (!user) return;
        try {
            const updatedProfile = { ...user, [docType]: url };
             await saveUserProfile({ id: user.id, role: user.role, [docType]: url });
            setUser(updatedProfile);
        } catch (error) {
            console.error(`Failed to save document ${docType}:`, error);
            toast({ title: t('error_title'), description: `Failed to save document.`, variant: 'destructive' });
        }
    };

    if (!user) {
        return <div>Loading...</div>; // Or a proper skeleton loader
    }

    return (
        <div className="flex flex-col gap-8">
            <ProfileForm
                userData={user}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                titleKey="profile_page_driver_title"
                descriptionKey="profile_page_driver_subtitle"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FileUploadCard
                    title={t('profile_license_cnh')}
                    description={t('profile_documents_status_desc')}
                    icon={FileText}
                    fileUrl={user.driverLicenseUrl}
                    userId={user.id}
                    docType="driverLicenseUrl"
                    onUpload={handleSaveDocumentUrl}
                />
                <FileUploadCard
                    title={t('doc_crlv')}
                    description={t('profile_documents_status_desc')}
                    icon={FileText}
                    fileUrl={user.vehicleDocumentUrl}
                    userId={user.id}
                    docType="vehicleDocumentUrl"
                    onUpload={handleSaveDocumentUrl}
                />
            </div>
        </div>
    );
}
