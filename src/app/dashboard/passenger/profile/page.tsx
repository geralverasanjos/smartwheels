'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import { getPassengerProfile } from '@/services/profileService';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';

export default function PassengerProfilePage() {
    const { t } = useAppContext();
    const [userData, setUserData] = useState<UserProfile | null>(null);

    useEffect(() => {
        getPassengerProfile().then(setUserData);
    }, []);

    if (!userData) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
    }

    return (
        <ProfileForm 
            userData={userData}
            titleKey="passenger_profile_title"
            descriptionKey="passenger_profile_desc"
        />
    );
}
