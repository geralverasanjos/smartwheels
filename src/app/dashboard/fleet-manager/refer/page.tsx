'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function PlaceholderPage() {
    const { t } = useAppContext();
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award /> {t('menu_refer')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-16">
                    <h2 className="text-2xl font-semibold">{t('page_under_construction')}</h2>
                    <p>{t('page_under_construction_desc')}</p>
                </div>
            </CardContent>
        </Card>
    );
}
