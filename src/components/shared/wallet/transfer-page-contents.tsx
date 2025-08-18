
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRole } from '@/components/dashboard/dashboard-layout';

const recentContacts = [
    { name: 'Carlos Silva', username: '@carlos.s', avatar: 'https://placehold.co/40x40.png?text=CS' },
    { name: 'Mariana Costa', username: '@mari.costa', avatar: 'https://placehold.co/40x40.png?text=MC' },
]

export default function TransferPageContents({ role }: { role: UserRole }) {
    const { t } = useAppContext();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [note, setNote] = useState('');

    const handleTransfer = () => {
        // Lógica de Transferencia
        console.log(`Transferring ${amount} to ${recipient} with note: ${note}`);
        router.back();
    };

    const getBackLink = () => `/dashboard/${role}/wallet`;

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                 <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" asChild>
                        <Link href={getBackLink()}><ArrowLeft /></Link>
                    </Button>
                    <div>
                        <h1 className="font-headline title-glow">{t('transfer_funds_title')}</h1>
                        <p>{t('transfer_funds_subtitle')}</p>
                    </div>
                </div>
            </div>
            
            <Card className="max-w-2xl mx-auto w-full">
                <CardHeader>
                    <CardTitle>{t('transfer_details_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="recipient">{t('recipient_label')}</Label>
                        <Input 
                            id="recipient" 
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder={t('recipient_placeholder')}
                        />
                         <div className="flex gap-2 pt-2">
                            {recentContacts.map(contact => (
                                <Button key={contact.username} variant="outline" size="sm" className="h-auto" onClick={() => setRecipient(contact.username)}>
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={contact.avatar} data-ai-hint="person face" />
                                        <AvatarFallback>{contact.name.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    {contact.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="amount">{t('amount_label')}</Label>
                        <Input 
                            id="amount" 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="note">{t('note_label')}</Label>
                        <Input 
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t('note_placeholder')}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleTransfer} className="w-full" size="lg" disabled={!amount || !recipient}>
                        <Send className="mr-2 h-4 w-4" />
                        {t('btn_send_transfer')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
