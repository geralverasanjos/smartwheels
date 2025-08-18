'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';
import { empatheticSupport } from '@/ai/flows/empathetic-support';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SupportPage() {
    const { t, language } = useAppContext();
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setResponse('');
        try {
            const result = await empatheticSupport({ query, language: language.label });
            setResponse(result.response);
        } catch (err) {
            setError('Failed to get a response from the support bot. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LifeBuoy /> {t('menu_support')}</CardTitle>
                <CardDescription>Converse com nosso assistente de IA para obter ajuda.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        placeholder="Descreva seu problema aqui..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        rows={5}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !query}>
                        {isLoading ? 'Enviando...' : 'Enviar para Suporte'}
                    </Button>
                </form>
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {response && (
                     <Card className="mt-6 bg-secondary">
                        <CardHeader>
                            <CardTitle>Resposta do Suporte</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{response}</p>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}
