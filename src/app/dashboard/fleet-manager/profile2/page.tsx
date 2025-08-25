
'use client';
import { useState } from 'react';
import type { UserProfile } from '@/types';
import { Loader2, FileCheck, ShieldCheck, Car, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LucideIcon } from 'lucide-react';

// --- Componente ProfileForm Isolado ---
const StandaloneProfileForm = ({ userData, onSave, isSaving }: {
    userData: Partial<UserProfile>;
    onSave: (data: Partial<UserProfile>) => void;
    isSaving: boolean;
}) => {
    const [name, setName] = useState(userData.name || '');
    const [email, setEmail] = useState(userData.email || '');
    const [companyName, setCompanyName] = useState(userData.companyName || '');
    const [companyNif, setCompanyNif] = useState(userData.companyNif || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, companyName, companyNif });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Perfil da Frota (Versão de Teste)</CardTitle>
                    <CardDescription>Edite os dados da sua frota. Esta página é um rascunho.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                            <AvatarFallback>{userData.name?.substring(0, 2).toUpperCase() || 'FM'}</AvatarFallback>
                        </Avatar>
                        <Button type="button" variant="outline"><Upload className="mr-2 h-4 w-4" /> Alterar Foto</Button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Responsável</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Insira o seu nome" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email de Contacto</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Nome da Empresa</Label>
                            <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nome da sua empresa" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="companyNif">NIF da Empresa</Label>
                            <Input id="companyNif" value={companyNif} onChange={(e) => setCompanyNif(e.target.value)} placeholder="NIF da empresa" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar (Teste)
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};


// --- Componente FileUploadCard Isolado ---
const StandaloneFileUploadCard = ({ title, description, icon: Icon, onUpload, docType }: {
    title: string;
    description: string;
    icon: LucideIcon;
    onUpload: (file: File, docType: string) => void;
    docType: string;
}) => {
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsUploading(true);
        console.log(`Simulando upload para ${docType}: ${file.name}`);
        
        await onUpload(file, docType);

        setIsUploading(false);
        console.log(`Upload simulado de ${docType} concluído.`);
    };

    return (
        <Card>
            <CardHeader>
                <Icon className="h-8 w-8 text-muted-foreground" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Input id={docType} type="file" onChange={handleFileChange} disabled={isUploading} />
                {isUploading && <p className="text-sm text-blue-500 mt-2 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A carregar...</p>}
                {fileName && !isUploading && <p className="text-sm text-green-500 mt-2">Ficheiro selecionado: {fileName}</p>}
            </CardContent>
        </Card>
    );
}

// --- Página `profile2` ---
export default function FleetManagerProfilePage2() {
    const { toast } = useToast();

    // Dados completamente estáticos, sem ligação ao context.
    const mockUser: Partial<UserProfile> = {
        name: '',
        email: '',
        avatarUrl: 'https://placehold.co/96x96.png?text=FM',
        companyName: '',
        companyNif: ''
    };

    const handleSaveProfile = (data: Partial<UserProfile>) => {
        console.log("DADOS DO FORMULÁRIO (PROFILE2 - FROTA):", data);
        toast({ title: "Perfil Guardado (Simulação)", description: "Os dados da frota foram enviados para a consola." });
    };

    const handleUploadDocument = async (file: File, docType: string) => {
        console.log(`FICHEIRO RECEBIDO (PROFILE2 - FROTA) - Tipo: ${docType}, Nome: ${file.name}`);
         toast({ title: "Upload Recebido (Simulação)", description: `${file.name} foi recebido para processamento.` });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Página de Perfil 2 (Ambiente de Teste - Frota)</h1>
            <p className="text-muted-foreground">Esta página é um ambiente de teste isolado e não carrega dados de utilizador automaticamente.</p>
            
            <StandaloneProfileForm
                userData={mockUser}
                onSave={handleSaveProfile}
                isSaving={false}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Documentos da Frota (Ambiente de Teste)</CardTitle>
                    <CardDescription>Faça o upload de novos documentos aqui.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <StandaloneFileUploadCard
                        title="Documento de Identidade do Responsável"
                        description="Carregue o BI ou Passaporte do responsável."
                        icon={FileCheck}
                        onUpload={handleUploadDocument}
                        docType="identityDocumentUrl"
                    />
                    <StandaloneFileUploadCard
                        title="Alvará da Empresa"
                        description="Carregue o alvará comercial da empresa."
                        icon={ShieldCheck}
                        onUpload={handleUploadDocument}
                        docType="commercialLicenseUrl"
                    />
                     <StandaloneFileUploadCard
                        title="Licença de Operador"
                        description="Carregue a licença de operador de transportes."
                        icon={Car}
                        onUpload={handleUploadDocument}
                        docType="operatorLicenseUrl"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
