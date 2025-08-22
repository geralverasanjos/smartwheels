'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { saveUserProfile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

export default function FleetManagerProfilePage() {
    const { t, user } = useAppContext();
    const { toast } = useToast();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
         if (user === undefined) {
            setLoading(true);
            return;
        }
        if (user === null) {
            setLoading(false);
             // Optionally redirect to login
            return;
        }
        
        setUserData(user);
        setLoading(false);
    }, [user]);

    const handleSaveProfile = async (data: UserProfile) => {
        if (!userData?.id) return;
        setIsSaving(true);
        try {
            await saveUserProfile({ ...data, id: userData.id, role: 'fleet-manager' });
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
    
    if (!userData) {
        return <div>{t('error_loading_profile')}</div>
    }

    return (
        <ProfileForm 
            userData={userData}
            onSave={handleSaveProfile}
            isSaving={isSaving}
            titleKey="fleet_profile_title"
            descriptionKey="fleet_profile_desc"
        />
    );
}