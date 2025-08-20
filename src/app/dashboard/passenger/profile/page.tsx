'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import { getPassengerProfile } from '@/services/profileService';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';

export default function PassengerProfilePage() {
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

        // We already have the user profile from the context,
        // but if we needed to fetch more detailed data, we could do it here.
        setUserData(user);
        setLoading(false);
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
    }
    
    if (!userData) {
        // This case would be hit if the user is not logged in or profile failed to load.
        return <div>{t('error_loading_profile')}</div>
    }

    return (
        <ProfileForm 
            userData={userData}
            titleKey="passenger_profile_title"
            descriptionKey="passenger_profile_desc"
        />
    );
}
