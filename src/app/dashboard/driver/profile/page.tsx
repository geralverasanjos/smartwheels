'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import { getDriverProfile } from '@/services/profileService';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';

export default function DriverProfilePage() {
    const { t } = useAppContext();
    const [userData, setUserData] = useState<UserProfile | null>(null);

    useEffect(() => {
        getDriverProfile().then(setUserData);
    }, []);

    if (!userData) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
    }

    return (
        <ProfileForm 
            userData={userData}
            titleKey="driver_profile_title"
            descriptionKey="driver_profile_desc"
        />
    );
}
