
'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Car, ShieldCheck, Edit, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function DriverProfilePage() {
    const { t } = useAppContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                <h1 className="font-headline title-glow">{t('profile_page_driver_title')}</h1>
                <p>{t('profile_page_driver_subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Profile Summary Card */}
                <div className="lg:col-span-1 space-y-8">
                   <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                                <AvatarImage src="https://placehold.co/100x100.png" alt={t('user_avatar_alt')} data-ai-hint="driver portrait" />
                                <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                            </Avatar>
                            <CardTitle>Gildásio Veras</CardTitle>
                            <CardDescription>{t('profile_page_driver_title')}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">{t('profile_member_since')} Jan 2024</p>
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
                                        <DialogTitle>{t('edit_profile_dialog_title')}</DialogTitle>
                                        <DialogDescription>{t('edit_profile_dialog_desc')}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">{t('profile_full_name_label')}</Label>
                                            <Input id="fullName" defaultValue="Gildásio Veras" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t('profile_email_label')}</Label>
                                            <Input id="email" type="email" defaultValue="gildasio.veras@example.com" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="phone">{t('profile_phone_label')}</Label>
                                            <Input id="phone" type="tel" defaultValue="+351 123 456 789" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="nif">{t('profile_nif_label')}</Label>
                                            <Input id="nif" defaultValue="123.456.789-00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile_photo_label')}</Label>
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src="https://placehold.co/100x100.png" alt={t('user_avatar_alt')} data-ai-hint="driver portrait" />
                                                    <AvatarFallback><User /></AvatarFallback>
                                                </Avatar>
                                                <Button variant="outline" asChild>
                                                    <label htmlFor="photo-upload" className="cursor-pointer">
                                                        <UploadCloud className="mr-2 h-4 w-4" />
                                                        {t('btn_change_photo')}
                                                        <input id="photo-upload" type="file" className="hidden" />
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
                            <CardTitle>{t('profile_personal_info_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>{t('profile_full_name_label')}:</strong><p className="text-muted-foreground">Gildásio Veras</p></div>
                                <div><strong>{t('profile_email_label')}:</strong><p className="text-muted-foreground">gildasio.veras@example.com</p></div>
                                <div><strong>{t('profile_phone_label')}:</strong><p className="text-muted-foreground">+351 123 456 789</p></div>
                                <div><strong>{t('profile_nif_label')}:</strong><p className="text-muted-foreground">123.456.789-00</p></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('profile_vehicle_info_title')}</CardTitle>
                            <Car className="h-6 w-6 text-primary" />
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>{t('profile_vehicle_make_model_label')}:</strong><p className="text-muted-foreground">Toyota Corolla</p></div>
                                <div><strong>{t('profile_vehicle_plate_label')}:</strong><p className="text-muted-foreground">ABC-1234</p></div>
                                <div><strong>{t('field_year')}:</strong><p className="text-muted-foreground">2023</p></div>
                                <div><strong>{t('field_color')}:</strong><p className="text-muted-foreground">Prata</p></div>
                             </div>
                        </CardContent>
                         <CardFooter>
                            <Button asChild variant="outline">
                                <Link href="/driver/vehicles">{t('profile_manage_vehicles_button')}</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                     <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader>
                            <CardTitle>{t('profile_documents_status_title')}</CardTitle>
                            <CardDescription>{t('profile_documents_status_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                <p>{t('profile_license_cnh')}</p>
                                <div className="flex items-center gap-2 text-green-600">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="font-medium">{t('status_approved')}</span>
                                </div>
                            </div>
                             <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                <p>{t('doc_crlv')}</p>
                                 <div className="flex items-center gap-2 text-green-600">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="font-medium">{t('status_approved')}</span>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">{t('profile_manage_docs_button')}</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('manage_documents_dialog_title')}</DialogTitle>
                                        <DialogDescription>{t('manage_documents_dialog_desc')}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="flex items-center justify-between p-3 rounded-md border">
                                            <div>
                                                <p className="font-medium">{t('profile_license_cnh')}</p>
                                                <div className="flex items-center gap-2 text-sm text-green-600">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    <span>{t('status_approved')}</span>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <label htmlFor="cnh-upload" className="cursor-pointer">
                                                    <UploadCloud className="mr-2 h-4 w-4" />
                                                    {t('label_upload_new_version')}
                                                    <input id="cnh-upload" type="file" className="hidden" />
                                                </label>
                                            </Button>
                                        </div>
                                         <div className="flex items-center justify-between p-3 rounded-md border">
                                            <div>
                                                <p className="font-medium">{t('doc_crlv')}</p>
                                                <div className="flex items-center gap-2 text-sm text-green-600">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    <span>{t('status_approved')}</span>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <label htmlFor="crlv-upload" className="cursor-pointer">
                                                    <UploadCloud className="mr-2 h-4 w-4" />
                                                    {t('label_upload_new_version')}
                                                    <input id="crlv-upload" type="file" className="hidden" />
                                                </label>
                                            </Button>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button>{t('btn_close')}</Button></DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
