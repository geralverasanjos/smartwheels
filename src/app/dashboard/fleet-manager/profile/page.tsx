'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import { getFleetManagerProfile } from '@/services/profileService';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';

export default function FleetManagerProfilePage() {
    const { t, user } = useAppContext();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
        
        // We can use the user object from context directly
        setUserData(user);
        setLoading(false);
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
    }
    
    if (!userData) {
        // Handle case where profile couldn't be loaded after trying
        return <div>{t('error_loading_profile')}</div>
    }

    return (
        <ProfileForm 
            userData={userData}
            titleKey="fleet_profile_title"
            descriptionKey="fleet_profile_desc"
        />
    );
}
