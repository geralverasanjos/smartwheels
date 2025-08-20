
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, Share2, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { UserRole } from '@/components/dashboard/dashboard-layout';

export default function ReceivePageContents({ role }: { role: UserRole }) {
    const { t, user } = useAppContext();
    const { toast } = useToast();

    if (!user) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>
    }
    
    // Generate dynamic username and QR code data
    const username = `@${user.name?.split(' ')[0].toLowerCase()}${user.id.substring(0,4)}`;
    const qrCodeData = `smartwheels_user_transfer:${user.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`;
    const shareLink = `https://smartwheels.com/pay/${username}`;

    const getBackLink = () => `/dashboard/${role}/wallet`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        toast({
            title: t('toast_copied_title'),
            description: t('toast_copied_desc'),
        });
    };
    
    const handleShare = async () => {
        const shareData = {
            title: t('receive_share_title'),
            text: t('receive_share_text', { username: username }),
            url: shareLink,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                handleCopy();
            }
        } catch (error) {
            console.error('Share failed:', error);
            handleCopy();
        }
    };


    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                 <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" asChild>
                        <Link href={getBackLink()}><ArrowLeft /></Link>
                    </Button>
                    <div>
                        <h1 className="font-headline title-glow">{t('receive_funds_title')}</h1>
                        <p>{t('receive_funds_subtitle')}</p>
                    </div>
                </div>
            </div>
            
            <Card className="max-w-md mx-auto w-full text-center">
                <CardHeader>
                    <CardTitle>{t('receive_qr_code_title')}</CardTitle>
                    <CardDescription>{t('receive_qr_code_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="p-4 bg-white rounded-lg">
                        <Image src={qrCodeUrl} alt={t('qr_code_alt')} width={200} height={200} />
                    </div>
                    <div className="w-full space-y-2">
                        <Label htmlFor="receive-link">{t('receive_link_label')}</Label>
                        <div className="flex items-center gap-2">
                            <Input id="receive-link" value={shareLink} readOnly className="text-center"/>
                            <Button size="icon" variant="outline" onClick={handleCopy}><Copy className="h-4 w-4"/></Button>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button onClick={handleShare} className="w-full">
                        <Share2 className="mr-2 h-4 w-4" />
                        {t('btn_share_link')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
