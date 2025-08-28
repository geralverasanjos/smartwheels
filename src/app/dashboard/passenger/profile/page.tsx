'use client';
import { useAppContext } from '@/contexts/app-context';
import ProfileForm from '@/components/shared/ProfileForm';
import { useToast } from '@/hooks/use-toast';
import { saveUserProfile } from '@/services/profileService';
import type { UserProfile } from '@/types';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FileUploadCard from '@/components/shared/file-upload-card';
import { FileText } from 'lucide-react';

export default function PassengerProfilePage() {
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
                titleKey="passenger_profile_title"
                descriptionKey="passenger_profile_desc"
            />

            <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                <CardHeader>
                    <CardTitle>{t('profile_license_docs_title')}</CardTitle>
                    <CardDescription>{t('profile_id_docs_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FileUploadCard
                        title={t('profile_doc_type_identity')}
                        description={t('profile_id_docs_desc')}
                        icon={FileText}
                        fileUrl={user.identityDocumentUrl}
                        userId={user.id}
                        docType="identityDocumentUrl"
                        onUpload={handleSaveDocumentUrl}
                    />
                </CardContent>
            </Card>

        </div>
    );
}
