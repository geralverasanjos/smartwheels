
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
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// --- Componente ProfileForm Isolado ---
const StandaloneProfileForm = ({
  userData,
  onUpdateField,
  onSave,
  isSaving,
}: {
  userData: Partial<UserProfile>;
  onUpdateField: (field: keyof UserProfile, value: any) => void;
  onSave: () => void;
  isSaving: boolean;
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      onUpdateField('avatarUrl', localUrl);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Motorista (Ambiente de Teste)</CardTitle>
        <CardDescription>Edite os seus dados. Esta página é um rascunho.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userData.avatarUrl} alt={userData.name} />
            <AvatarFallback>{userData.name?.substring(0, 2).toUpperCase() || 'P2'}</AvatarFallback>
          </Avatar>
          <Button asChild variant="outline">
            <Label htmlFor="photo-upload">
              <Upload className="mr-2 h-4 w-4" /> Alterar Foto
            </Label>
          </Button>
          <Input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={userData.name || ''} onChange={(e) => onUpdateField('name', e.target.value)} placeholder="Insira o seu nome" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={userData.email || ''} onChange={(e) => onUpdateField('email', e.target.value)} placeholder="seu.email@exemplo.com" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar (Consola)
        </Button>
      </CardFooter>
    </Card>
  );
};

// --- Componente FileUploadCard Isolado ---
const StandaloneFileUploadCard = ({
  title,
  description,
  icon: Icon,
  docType,
  fileName,
  onFileSelect,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  docType: string;
  fileName?: string;
  onFileSelect: (file: File, docType: string) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await onFileSelect(file, docType);
    setIsUploading(false);
  };

  return (
    <Card>
      <CardHeader>
        <Icon className="h-8 w-8 text-muted-foreground" />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full">
        <div>
          <Input id={docType} type="file" onChange={handleFileChange} disabled={isUploading} className="mb-2" />
           {isUploading && <p className="text-sm text-blue-500 mt-2 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A carregar...</p>}
        </div>
        {fileName && !isUploading && <p className="text-sm text-green-500 mt-2">Ficheiro selecionado: {fileName}</p>}
      </CardContent>
    </Card>
  );
};

// --- Página `profile2` ---
export default function DriverProfilePage2() {
  const { toast } = useToast();

  // Estado local para gerir os dados do formulário de forma isolada
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    avatarUrl: 'https://placehold.co/96x96.png?text=P2',
    identityDocumentUrl: '',
    driverLicenseUrl: '',
    vehicleDocumentUrl: '',
  });

  const [documentFiles, setDocumentFiles] = useState<Record<string, string>>({});

  const updateProfileField = (field: keyof UserProfile, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    console.log("DADOS GUARDADOS (SIMULADO):", {
      profile: profileData,
      files: documentFiles
    });
    toast({ title: "Perfil Guardado (Simulação)", description: "Os dados do perfil e nomes de ficheiros foram enviados para a consola." });
  };

  const handleFileSelect = async (file: File, docType: string) => {
    // Simula o upload e atualiza o estado local
    const mockUrl = `https://mock-storage.com/docs/${file.name}`;
    updateProfileField(docType as keyof UserProfile, mockUrl);
    setDocumentFiles(prev => ({...prev, [docType]: file.name}));
    toast({ title: "Ficheiro Selecionado", description: `${file.name} foi carregado (simulação).` });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Página de Perfil 2 (Ambiente de Teste)</h1>
      <p className="text-muted-foreground">Esta página é um ambiente de teste isolado e não carrega dados de utilizador. As alterações são geridas localmente.</p>

      <StandaloneProfileForm
        userData={profileData}
        onUpdateField={updateProfileField}
        onSave={handleSaveProfile}
        isSaving={false}
      />

      <Card>
        <CardHeader>
          <CardTitle>Documentos (Ambiente de Teste)</CardTitle>
          <CardDescription>Faça o upload de novos documentos aqui.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StandaloneFileUploadCard
            title="Documento de Identidade"
            description="Carregue o seu BI ou Passaporte."
            icon={FileCheck}
            onFileSelect={handleFileSelect}
            docType="identityDocumentUrl"
            fileName={documentFiles.identityDocumentUrl}
          />
          <StandaloneFileUploadCard
            title="Carta de Condução"
            description="Carregue a sua carta de condução."
            icon={ShieldCheck}
            onFileSelect={handleFileSelect}
            docType="driverLicenseUrl"
            fileName={documentFiles.driverLicenseUrl}
          />
          <StandaloneFileUploadCard
            title="Documento do Veículo"
            description="Carregue o registo de propriedade."
            icon={Car}
            onFileSelect={handleFileSelect}
            docType="vehicleDocumentUrl"
            fileName={documentFiles.vehicleDocumentUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}
