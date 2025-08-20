
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Landmark, ArrowUpRight, ArrowDownLeft, PlusCircle, ArrowDown, ArrowUp, Send, QrCode } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import Link from 'next/link';
import { useCurrency } from '@/lib/currency';

// Dados de exemplo (virão da API)
const walletData = {
    balance: 47.50,
};

const transactionHistory = [
    { id: 1, type: 'top-up', date: 'Hoje, 10:30', description: 'Carregamento de Saldo', amount: 20.00 },
    { id: 2, type: 'trip', date: 'Hoje, 09:15', description: 'Viagem com Carlos S.', amount: -9.50 },
    { id: 3, type: 'transfer-in', date: 'Ontem', description: 'Recebido de @mario.p', amount: 15.00 },
];

export default function PassengerWalletPage() {
    const { t } = useAppContext();
    const { formatCurrency } = useCurrency();

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'top-up':
            case 'transfer-in':
                return <ArrowUpRight className="h-5 w-5 text-green-500" />;
            case 'trip':
            case 'transfer-out':
            case 'withdraw':
                return <ArrowDownLeft className="h-5 w-5 text-destructive" />;
            default:
                return null;
        }
    };
     const getTransactionAmountClass = (type: string) => {
        switch (type) {
            case 'top-up':
            case 'transfer-in':
                return 'text-green-500';
            case 'trip':
            case 'transfer-out':
            case 'withdraw':
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

            {/* Saldo e Ações Principais */}
            <Card className="text-center">
                <CardHeader>
                    <p className="text-sm text-muted-foreground">{t('wallet_current_balance')}</p>
                    <CardTitle className="text-5xl font-bold">{formatCurrency(walletData.balance)}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-2">
                    <Button asChild><Link href="/dashboard/passenger/wallet/add-funds"><PlusCircle /> {t('btn_add_funds')}</Link></Button>
                    <Button asChild variant="outline"><Link href="/dashboard/passenger/wallet/withdraw"><ArrowDown /> {t('btn_withdraw')}</Link></Button>
                    <Button asChild variant="outline"><Link href="/dashboard/passenger/wallet/transfer"><Send /> {t('btn_transfer')}</Link></Button>
                    <Button asChild variant="outline"><Link href="/dashboard/passenger/wallet/receive"><QrCode /> {t('btn_receive')}</Link></Button>
                </CardContent>
            </Card>

            {/* Histórico de Transações */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('wallet_transaction_history')}</CardTitle>
                    <CardDescription>{t('wallet_transaction_history_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactionHistory.length > 0 ? transactionHistory.map((transaction, index) => (
                            <React.Fragment key={transaction.id}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-muted">
                                            {getTransactionIcon(transaction.type)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold text-lg ${getTransactionAmountClass(transaction.type)}`}>
                                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                                {index < transactionHistory.length - 1 && <Separator />}
                            </React.Fragment>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center">{t('wallet_no_transactions')}</p>
                        )}
                    </div>
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
