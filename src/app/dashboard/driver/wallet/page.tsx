'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Landmark, ArrowUpRight, ArrowDownLeft, PlusCircle, ArrowDown, ArrowUp, Send, QrCode, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Separator } from '@/components/ui/separator';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/lib/currency';
import { getTransactionsByUserId } from '@/services/paymentService';
import type { Transaction } from '@/types';

export default function DriverWalletPage() {
    const { t, user } = useAppContext();
    const { formatCurrency } = useCurrency();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user === undefined) {
            setLoading(true);
            return;
        }
        if (user === null) {
            setLoading(false);
            return;
        }
        getTransactionsByUserId(user.id)
            .then(data => {
                setTransactions(data);
            })
            .catch(error => {
                console.error("Failed to fetch transactions:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user]);

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'top-up':
            case 'transfer-in':
            case 'trip': // Earnings for driver
                return <ArrowUpRight className="h-5 w-5 text-green-500" />;
            case 'transfer-out':
            case 'withdraw':
            case 'fee':
                return <ArrowDownLeft className="h-5 w-5 text-destructive" />;
            default:
                return null;
        }
    };
     const getTransactionAmountClass = (type: string) => {
        switch (type) {
            case 'top-up':
            case 'transfer-in':
            case 'trip':
                return 'text-green-500';
            case 'transfer-out':
            case 'withdraw':
            case 'fee':
                return 'text-destructive';
            default:
                return '';
        }
    };


    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                <h1 className="font-headline title-glow">{t('wallet_page_title')}</h1>
                <p>{t('wallet_page_subtitle_generic')}</p>
            </div>

            <Card className="text-center">
                <CardHeader>
                    <p className="text-sm text-muted-foreground">{t('wallet_current_balance')}</p>
                     <CardTitle className="text-5xl font-bold">
                        {user === undefined ? <Loader2 className="h-10 w-10 animate-spin mx-auto" /> : formatCurrency(user?.balance || 0)}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-2">
                    <Button asChild><Link href="/dashboard/driver/wallet/add-funds"><PlusCircle /> {t('btn_add_funds')}</Link></Button>
                    <Button asChild variant="outline"><Link href="/dashboard/driver/wallet/withdraw"><ArrowDown /> {t('btn_withdraw')}</Link></Button>
                    <Button asChild variant="outline"><Link href="/dashboard/driver/wallet/transfer"><Send /> {t('btn_transfer')}</Link></Button>
                    <Button asChild variant="outline"><Link href="/dashboard/driver/wallet/receive"><QrCode /> {t('btn_receive')}</Link></Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('wallet_transaction_history')}</CardTitle>
                    <CardDescription>{t('wallet_transaction_history_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.length > 0 ? transactions.map((transaction, index) => (
                                <React.Fragment key={transaction.id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-muted">
                                                {getTransactionIcon(transaction.type)}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{transaction.description}</p>
                                                <p className="text-sm text-muted-foreground">{new Date(transaction.timestamp.seconds * 1000).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className={`font-bold text-lg ${getTransactionAmountClass(transaction.type)}`}>
                                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                        </p>
                                    </div>
                                    {index < transactions.length - 1 && <Separator />}
                                </React.Fragment>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-8">{t('wallet_no_transactions')}</p>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">{t('view_all_transactions')}</Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>{t('wallet_about_title')}</CardTitle>
                </CardHeader>
                 <CardContent>
                    <p className="text-sm text-muted-foreground">{t('wallet_about_description')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
