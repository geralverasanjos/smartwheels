'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import { getFleetManagerProfile } from '@/services/profileService';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';

export default function FleetManagerProfilePage() {
    const { t } = useAppContext();
    const [userData, setUserData] = useState<UserProfile | null>(null);

    useEffect(() => {
        getFleetManagerProfile().then(setUserData);
    }, []);

    if (!userData) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>;
    }

    return (
        <ProfileForm 
            userData={userData}
            titleKey="fleet_profile_title"
            descriptionKey="fleet_profile_desc"
        />
    );
}
