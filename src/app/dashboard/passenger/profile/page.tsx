
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="docType">{t('profile_doc_type')}</Label>
                            <Select>
                                <SelectTrigger id="docType">
                                    <SelectValue placeholder={t('profile_doc_type_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="identity_card">{t('profile_doc_type_identity')}</SelectItem>
                                    <SelectItem value="citizen_card">{t('profile_doc_type_citizen_card')}</SelectItem>
                                    <SelectItem value="passport">{t('profile_doc_type_passport')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="docNumber">{t('profile_doc_number')}</Label>
                            <Input id="docNumber" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button>{t('profile_manage_docs_button')}</Button>
                </CardFooter>
            </Card>

        </div>
    );
}
