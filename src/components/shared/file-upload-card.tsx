
'use client';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/app-context';
import { uploadProfilePhoto } from '@/services/profileService';
import type { UserProfile } from '@/types';
import Link from 'next/link';

interface FileUploadCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    fileUrl?: string | null;
    userId: string;
    docType: keyof UserProfile;
    onSave: (data: Partial<UserProfile>) => Promise<void>;
}

export default function FileUploadCard({ title, description, icon: Icon, fileUrl, userId, docType, onSave }: FileUploadCardProps) {
    const { t } = useAppContext();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [localFileUrl, setLocalFileUrl] = useState(fileUrl);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userId) return;

        setIsUploading(true);
        try {
            const storagePath = `documents/${userId}/${docType}/${file.name}`;
            const downloadURL = await uploadProfilePhoto(file, storagePath);
            
            const profileUpdate: Partial<UserProfile> = { [docType]: downloadURL };

            await onSave(profileUpdate);
            setLocalFileUrl(downloadURL); // Update local state to reflect change immediately

            toast({
                title: t('toast_doc_uploaded_title'),
                description: t('toast_doc_uploaded_desc'),
            });
        } catch (error) {
            console.error(`Failed to upload ${docType}:`, error);
            toast({
                title: t('error_title'),
                description: t('error_uploading_doc'),
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const status = localFileUrl ? 'approved' : 'pending';
    const statusText = status === 'approved' ? t('status_approved') : t('status_pending');
    const StatusIcon = status === 'approved' ? CheckCircle : AlertCircle;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                        <StatusIcon className={status === 'approved' ? 'text-green-500' : 'text-yellow-500'} />
                        <span className="text-sm font-medium">{statusText}</span>
                    </div>
                    {localFileUrl && (
                        <Button variant="link" size="sm" asChild>
                            <Link href={localFileUrl} target="_blank" rel="noopener noreferrer" className='flex items-center gap-1'>
                                <Eye className="h-4 w-4" />
                                {t('btn_view_document')}
                            </Link>
                        </Button>
                    )}
                </div>
                
                <label htmlFor={docType as string} className="w-full cursor-pointer">
                     <Button asChild className="w-full" variant="outline" disabled={isUploading}>
                        <span>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            {t(localFileUrl ? 'btn_upload_new_doc' : 'btn_upload_document')}
                        </span>
                    </Button>
                    <input id={docType as string} type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isUploading} />
                </label>
            </CardContent>
        </Card>
    );
}

