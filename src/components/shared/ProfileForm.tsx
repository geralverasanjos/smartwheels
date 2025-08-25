'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import type { UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/app-context";
import type { TranslationKeys } from "@/lib/i18n";
import { uploadProfilePhoto } from "@/services/profileService";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface ProfileFormProps {
    userData: UserProfile;
    onSave: (data: Partial<UserProfile>) => Promise<void>;
    isSaving?: boolean;
    titleKey: TranslationKeys;
    descriptionKey: TranslationKeys;
}

export default function ProfileForm({ userData, onSave, isSaving, titleKey, descriptionKey }: ProfileFormProps) {
    const { t, setUser } = useAppContext();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    
    const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<UserProfile>({
        defaultValues: userData,
    });

    useEffect(() => {
        setValue('name', userData.name);
        setValue('email', userData.email);
        setValue('phone', userData.phone);
        setValue('nif', userData.nif);
        setValue('address', userData.address);
        setValue('avatarUrl', userData.avatarUrl);
    }, [userData, setValue]);
    
    const avatarUrl = watch('avatarUrl');

    const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userData.id) return;

        setIsUploading(true);
        try {
            const storagePath = `profilePhotos/${userData.id}/${file.name}`;
            const downloadURL = await uploadProfilePhoto(file, storagePath);
            setValue('avatarUrl', downloadURL, { shouldDirty: true });
             toast({
                title: t('photo_upload_success_title'),
                description: t('photo_upload_success_desc'),
            });
        } catch (error) {
            console.error("Failed to upload photo:", error);
            toast({
                title: t('error_title'),
                description: "Falha ao carregar a foto.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const getStatusVariant = (status?: string): 'default' | 'destructive' | 'secondary' => {
        switch (status) {
            case 'active':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'inactive':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const handleFormSubmit = (data: UserProfile) => {
        onSave(data);
    };


    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <CardTitle>{t(titleKey)}</CardTitle>
                        {userData.status && (
                             <Badge variant={getStatusVariant(userData.status)}>
                                {t(`status_${userData.status}` as TranslationKeys) || userData.status}
                            </Badge>
                        )}
                    </div>
                    <CardDescription>{t(descriptionKey)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={avatarUrl} alt={userData.name} data-ai-hint="person face" />
                            <AvatarFallback>{userData.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="avatar-upload" className={cn("cursor-pointer", isUploading && "cursor-not-allowed opacity-50")}>
                                <Button asChild variant="outline">
                                    <span>
                                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        {t('btn_change_photo')}
                                    </span>
                                </Button>
                            </Label>
                            <Input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={isUploading} />
                            <p className="text-xs text-muted-foreground mt-2">{t('photo_upload_recommended')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('name_label')}</Label>
                            <Input id="name" {...register("name", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email_label')}</Label>
                            <Input id="email" type="email" {...register("email", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phone_label')}</Label>
                            <Input id="phone" type="tel" {...register("phone")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nif">{t('nif_label')}</Label>
                            <Input id="nif" {...register("nif")} />
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">{t('address_label')}</Label>
                            <Input id="address" {...register("address")} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={!isDirty || isSaving || isUploading}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('save_changes_button')}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}