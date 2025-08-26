
'use client';
import { useAppContext } from '@/contexts/app-context';
import ProfileForm from '@/components/shared/ProfileForm';
import { useToast } from '@/hooks/use-toast';
import { saveUserProfile } from '@/services/profileService';
import type { UserProfile } from '@/types';
import FileUploadCard from '@/components/shared/file-upload-card';
import { FileText, Building2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Car } from 'lucide-react';


export default function FleetProfilePage() {
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
                titleKey="fleet_profile_title"
                descriptionKey="fleet_profile_desc"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <Card className="lg:col-span-1 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                    <CardHeader>
                        <CardTitle>{t('fleet_summary_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><strong>{t('total_vehicles_label')}:</strong><p className="text-muted-foreground">0</p></div>
                            <div><strong>{t('total_drivers_label')}:</strong><p className="text-muted-foreground">0</p></div>
                         </div>
                    </CardContent>
                     <CardFooter className="gap-4">
                        <Button asChild variant="outline">
                            <Link href="/dashboard/fleet-manager/vehicles">
                                <Car className="mr-2 h-4 w-4" />
                                {t('btn_manage_vehicles')}
                            </Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href="/dashboard/fleet-manager/drivers">
                                <Users className="mr-2 h-4 w-4" />
                                {t('btn_view_drivers')}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FileUploadCard
                        title={t('commercial_license_label')}
                        description={t('commercial_license_desc')}
                        icon={Building2}
                        fileUrl={user.commercialLicenseUrl}
                        userId={user.id}
                        docType="commercialLicenseUrl"
                        onUpload={handleSaveDocumentUrl}
                    />
                     <FileUploadCard
                        title={t('operator_license_label')}
                        description={t('operator_license_desc')}
                        icon={FileText}
                        fileUrl={user.operatorLicenseUrl}
                        userId={user.id}
                        docType="operatorLicenseUrl"
                        onUpload={handleSaveDocumentUrl}
                    />
                </div>
            </div>
        </div>
    );
}

