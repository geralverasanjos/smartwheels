'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import type { UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/app-context";
import type { TranslationKeys } from "@/lib/i18n";

interface ProfileFormProps {
    userData: UserProfile;
    titleKey: TranslationKeys;
    descriptionKey: TranslationKeys;
}

export default function ProfileForm({ userData, titleKey, descriptionKey }: ProfileFormProps) {
    const { t } = useAppContext();
    const { toast } = useToast();
    const { register, handleSubmit, formState: { errors, isDirty } } = useForm<UserProfile>({
        defaultValues: userData,
    });

    const onSubmit = (data: UserProfile) => {
        console.log("Profile updated:", data);
        toast({
            title: t('toast_profile_updated_title'),
            description: t('toast_profile_updated_desc'),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>{t(titleKey)}</CardTitle>
                    <CardDescription>{t(descriptionKey)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={userData.avatarUrl} alt={userData.name} data-ai-hint="person face" />
                            <AvatarFallback>{userData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <Button asChild variant="outline">
                                    <span>
                                        <Upload className="mr-2 h-4 w-4" />
                                        {t('btn_change_photo')}
                                    </span>
                                </Button>
                            </Label>
                            <Input id="avatar-upload" type="file" className="hidden" accept="image/*" />
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
                    <Button type="submit" disabled={!isDirty}>{t('save_changes_button')}</Button>
                </CardFooter>
            </Card>
        </form>
    );
}
