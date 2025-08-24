'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/shared/ProfileForm';
import type { UserProfile } from '@/types';
import { Loader2, FileCheck, ShieldCheck, Building } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { saveUserProfile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import FileUploadCard from '@/components/shared/file-upload-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

// Extend UserProfile for fleet manager specific fields
interface FleetManagerProfile extends UserProfile {
    companyName?: string;
    companyNif?: string;
    commercialLicenseUrl?: string;
    operatorLicenseUrl?: string;
}

const CompanyInfoForm = ({ user, onSave, isSaving }: { user: FleetManagerProfile, onSave: (data: Partial<FleetManagerProfile>) => void, isSaving: boolean }) => {
    const { t } = useAppContext();
    const { register, handleSubmit, formState: { isDirty } } = useForm({
        defaultValues: {
            companyName: user.companyName,
            companyNif: user.companyNif
        }
    });
    
    return (
        <form onSubmit={handleSubmit(onSave)}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('fleet_company_info_title')}</CardTitle>
                    <CardDescription>{t('fleet_company_info_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">{t('fleet_company_name_label')}</Label>
                        <Input id="companyName" {...register("companyName")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyNif">{t('fleet_company_nif_label')}</Label>
                        <Input id="companyNif" {...register("companyNif")} />
                    </div>
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={!isDirty || isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('save_changes_button')}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}


export default function FleetManagerProfilePage() {
    const { t, user, setUser } = useAppContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user !== undefined) {
            setLoading(false);
        }
    }, [user]);

    const handleSaveProfile = async (data: Partial<FleetManagerProfile>) => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const updatedProfile = { ...user, ...data };
            await saveUserProfile(updatedProfile);
            setUser(updatedProfile as UserProfile);
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
        // This case should ideally be handled by the layout, but as a fallback:
        return <div>{t('error_loading_profile')}</div>
    }

    return (
        <div className="space-y-8">
            <ProfileForm 
                userData={user}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                titleKey="fleet_manager_profile_title"
                descriptionKey="fleet_manager_profile_desc"
            />

            <CompanyInfoForm 
                user={user as FleetManagerProfile}
                onSave={handleSaveProfile}
                isSaving={isSaving}
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('fleet_company_docs_title')}</CardTitle>
                    <CardDescription>{t('fleet_company_docs_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <FileUploadCard
                        title={t('fleet_commercial_license_title')}
                        description={t('fleet_commercial_license_desc')}
                        icon={Building}
                        fileUrl={(user as FleetManagerProfile).commercialLicenseUrl}
                        userId={user.id}
                        docType="commercialLicenseUrl"
                        onSave={handleSaveProfile}
                    />
                    <FileUploadCard
                        title={t('fleet_operator_license_title')}
                        description={t('fleet_operator_license_desc')}
                        icon={ShieldCheck}
                        fileUrl={(user as FleetManagerProfile).operatorLicenseUrl}
                        userId={user.id}
                        docType="operatorLicenseUrl"
                        onSave={handleSaveProfile}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
