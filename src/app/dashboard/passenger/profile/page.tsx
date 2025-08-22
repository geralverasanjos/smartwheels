'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { saveUserProfile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

export default function PassengerProfilePage() {
    const { t, user, setUser } = useAppContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user !== undefined) {
            setLoading(false);
        }
    }, [user]);

    const handleSaveProfile = async (data: UserProfile) => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const updatedProfile = { ...user, ...data, id: user.id, role: 'passenger' };
            await saveUserProfile(updatedProfile);
            setUser(updatedProfile); // Update context state immediately
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

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
    }
    
    if (!user) {
        // This case would be hit if the user is not logged in or profile failed to load.
        return <div>{t('error_loading_profile')}</div>
    }

    return (
        <ProfileForm 
            userData={user}
            onSave={handleSaveProfile}
            isSaving={isSaving}
            titleKey="passenger_profile_title"
            descriptionKey="passenger_profile_desc"
        />
    );
}