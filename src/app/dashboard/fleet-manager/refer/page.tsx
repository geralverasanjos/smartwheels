'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Copy, Share2, UserPlus, Wallet, QrCode } from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const referralData = {
  referralCode: 'FLEET-MANAGER-789',
  friendsInvited: 2,
  totalEarnings: 200.00,
};
const referralLink = `https://smartwheels.com/join?ref=${referralData.referralCode}`;
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`;

export default function ReferralPage() {
    const { t } = useAppContext();
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        toast({
            title: t('toast_copied_title'),
            description: t('toast_code_copied_desc'),
        });
    };

    const handleShare = async () => {
        const shareData = {
            title: t('referral_share_subject'),
            text: t('referral_share_text_fleet', { code: referralData.referralCode }),
            url: referralLink,
        };
        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                handleCopy();
            }
        } catch(error) {
            console.error('Share failed:', error);
            handleCopy();
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                <h1 className="font-headline title-glow">{t('refer_page_title_fleet')}</h1>
                <p>{t('refer_page_subtitle_fleet')}</p>
            </div>

            <Card className="text-center">
                <CardHeader>
                    <Gift className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-2xl mt-2">{t('refer_card_title_fleet')}</CardTitle>
                    <CardDescription>{t('refer_card_desc_fleet', { friend_bonus: '€100', your_bonus: '€100' })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{t('refer_your_link_label')}</p>
                    <div className="flex w-full max-w-sm mx-auto items-center space-x-2">
                        <Input type="text" value={referralLink} readOnly className="text-center font-mono" />
                        <Button type="button" size="icon" onClick={handleCopy} title={t('btn_copy_code')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex justify-center gap-2">
                        <Button onClick={handleShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            {t('btn_share_link')}
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <QrCode className="mr-2 h-4 w-4" />
                                    QR Code
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[250px]">
                                <DialogHeader>
                                    <DialogTitle>{t('refer_share_qr_title')}</DialogTitle>
                                    <DialogDescription className="sr-only">
                                        {t('refer_share_qr_desc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="p-4 flex flex-col items-center text-center">
                                    <Image src={qrCodeUrl} alt={t('refer_share_qr_alt')} width={200} height={200} />
                                    <p className="text-xs text-muted-foreground mt-2">{t('refer_share_qr_desc')}</p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <StatCard icon={UserPlus} title={referralData.friendsInvited.toString()} subtitle={t('refer_invited_fleets')} description={t('refer_invited_fleets_desc')} />
                 <StatCard icon={Wallet} title={`€${referralData.totalEarnings.toFixed(2)}`} subtitle={t('refer_total_earnings')} description={t('refer_total_earnings_desc')} />
            </div>
        </div>
    );
}
