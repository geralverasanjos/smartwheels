
'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, User, Car, Users, Edit, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function FleetProfilePage() {
    const { t } = useAppContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                <h1 className="font-headline title-glow">{t('profile_page_fleet_title')}</h1>
                <p>{t('profile_page_fleet_subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Profile Summary Card */}
                <div className="lg:col-span-1 space-y-8">
                   <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                                <AvatarImage src="https://placehold.co/100x100.png" alt={t('company_logo_alt')} data-ai-hint="company logo" />
                                <AvatarFallback><Building className="h-10 w-10" /></AvatarFallback>
                            </Avatar>
                            <CardTitle>Frota Rápida Lda.</CardTitle>
                            <CardDescription>{t('btn_fleet_manager_title')}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">{t('profile_member_since')} Dez 2023</p>
                        </CardContent>
                        <CardFooter className="justify-center">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Edit className="mr-2 h-4 w-4" />
                                        {t('btn_edit_profile')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('edit_company_profile_dialog_title')}</DialogTitle>
                                        <DialogDescription>{t('edit_company_profile_dialog_desc')}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">{t('company_name_label')}</Label>
                                            <Input id="companyName" defaultValue="Frota Rápida Lda." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyEmail">{t('company_email_label')}</Label>
                                            <Input id="companyEmail" type="email" defaultValue="contato@frotarapida.com" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="companyPhone">{t('company_phone_label')}</Label>
                                            <Input id="companyPhone" type="tel" defaultValue="+351 210 987 654" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyTaxId">{t('company_tax_id_label')}</Label>
                                            <Input id="companyTaxId" defaultValue="500.123.456" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="companyAddress">{t('company_address_label')}</Label>
                                            <Input id="companyAddress" defaultValue="Rua das Empresas, 123, Lisboa" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('company_logo_label')}</Label>
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src="https://placehold.co/100x100.png" alt={t('company_logo_alt')} data-ai-hint="company logo" />
                                                    <AvatarFallback><Building /></AvatarFallback>
                                                </Avatar>
                                                <Button variant="outline" asChild>
                                                    <label htmlFor="logo-upload" className="cursor-pointer">
                                                        <UploadCloud className="mr-2 h-4 w-4" />
                                                        {t('btn_change_logo')}
                                                        <input id="logo-upload" type="file" className="hidden" />
                                                    </label>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="outline">{t('btn_cancel')}</Button></DialogClose>
                                        <DialogClose asChild><Button>{t('btn_save_changes')}</Button></DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2 space-y-8">
                     <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader>
                            <CardTitle>{t('company_info_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>{t('company_name_label')}:</strong><p className="text-muted-foreground">Frota Rápida Lda.</p></div>
                                <div><strong>{t('company_tax_id_label')}:</strong><p className="text-muted-foreground">500.123.456</p></div>
                                <div><strong>{t('company_email_label')}:</strong><p className="text-muted-foreground">contato@frotarapida.com</p></div>
                                <div><strong>{t('company_phone_label')}:</strong><p className="text-muted-foreground">+351 210 987 654</p></div>
                                <div className="md:col-span-2"><strong>{t('company_address_label')}:</strong><p className="text-muted-foreground">Rua das Empresas, 123, Lisboa</p></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('fleet_summary_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>{t('total_vehicles_label')}:</strong><p className="text-muted-foreground">150</p></div>
                                <div><strong>{t('total_drivers_label')}:</strong><p className="text-muted-foreground">135</p></div>
                             </div>
                        </CardContent>
                         <CardFooter className="gap-4">
                            <Button asChild variant="outline">
                                <Link href="/fleet-manager/vehicles">
                                    <Car className="mr-2 h-4 w-4" />
                                    {t('btn_manage_vehicles')}
                                </Link>
                            </Button>
                             <Button asChild variant="outline">
                                <Link href="/fleet-manager/drivers">
                                    <Users className="mr-2 h-4 w-4" />
                                    {t('btn_view_drivers')}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
