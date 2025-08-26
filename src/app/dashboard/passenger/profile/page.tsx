
'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PassengerProfilePage() {
    const { t } = useAppContext();

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header">
                <h1 className="font-headline title-glow">{t('profile_page_passenger_title')}</h1>
                <p>{t('profile_page_passenger_subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Profile Summary Card */}
                <div className="lg:col-span-1 space-y-8">
                   <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                                <AvatarImage src="https://placehold.co/100x100.png" alt={t('user_avatar_alt')} data-ai-hint="passenger portrait" />
                                <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                            </Avatar>
                            <CardTitle>Gildásio Veras</CardTitle>
                            <CardDescription>{t('btn_passenger_title')}</CardDescription>
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
                                            <Label htmlFor="fullName">{t('passenger_profile_full_name_label')}</Label>
                                            <Input id="fullName" defaultValue="Gildásio Veras" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t('passenger_profile_email_label')}</Label>
                                            <Input id="email" type="email" defaultValue="gildasio.veras@example.com" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="phone">{t('passenger_profile_phone_label')}</Label>
                                            <Input id="phone" type="tel" defaultValue="+351 123 456 789" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="address">{t('passenger_profile_address_label')}</Label>
                                            <Input id="address" defaultValue="Avenida da Liberdade, 123, Lisboa" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile_photo_label')}</Label>
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src="https://placehold.co/100x100.png" alt={t('user_avatar_alt')} data-ai-hint="passenger portrait" />
                                                    <AvatarFallback><User /></AvatarFallback>
                                                </Avatar>
                                                <Button variant="outline" asChild>
                                                    <label htmlFor="photo-upload-passenger" className="cursor-pointer">
                                                        <UploadCloud className="mr-2 h-4 w-4" />
                                                        {t('btn_change_photo')}
                                                        <input id="photo-upload-passenger" type="file" className="hidden" />
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
                            <CardTitle>{t('passenger_profile_personal_info_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>{t('passenger_profile_full_name_label')}:</strong><p className="text-muted-foreground">Gildásio Veras</p></div>
                                <div><strong>{t('passenger_profile_email_label')}:</strong><p className="text-muted-foreground">gildasio.veras@example.com</p></div>
                                <div><strong>{t('passenger_profile_phone_label')}:</strong><p className="text-muted-foreground">+351 123 456 789</p></div>
                                <div><strong>{t('passenger_profile_address_label')}:</strong><p className="text-muted-foreground">Avenida da Liberdade, 123, Lisboa</p></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader>
                            <CardTitle>{t('profile_license_docs_title')}</CardTitle>
                            <CardDescription>{t('profile_id_docs_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="docType">{t('profile_doc_type')}</Label>
                                    <Select>
                                        <SelectTrigger id="docType">
                                            <SelectValue placeholder={t('profile_doc_type_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="citizen_card">{t('profile_doc_type_citizen_card')}</SelectItem>
                                            <SelectItem value="passport">{t('profile_doc_type_passport')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="docNumber">{t('profile_doc_number')}</Label>
                                    <Input id="docNumber" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="issueDate">{t('profile_issue_date')}</Label>
                                    <Input id="issueDate" type="date" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="expiryDate">{t('profile_expiry_date')}</Label>
                                    <Input id="expiryDate" type="date" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('profile_license_upload_label')}</Label>
                                 <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-center text-muted-foreground"><span className="font-semibold">{t('profile_upload_placeholder_click')}</span> {t('profile_upload_placeholder_drag')}</p>
                                            <p className="text-xs text-muted-foreground">{t('profile_upload_placeholder_file_types')}</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" />
                                    </label>
                                </div> 
                            </div>

                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button>{t('profile_manage_docs_button')}</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
