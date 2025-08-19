'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Copy, Trash2, Calendar, Tag, Loader2 } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/app-context';
import { getDriverPromotions, savePromotion, deletePromotion } from '@/services/promotionService';
import type { Promotion } from '@/types';

export default function DriverPromotionsPage() {
    const { t } = useAppContext();
    const { toast } = useToast();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Partial<Promotion> | null>(null);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const data = await getDriverPromotions();
            setPromotions(data);
        } catch (error) {
            console.error("Failed to fetch promotions:", error);
            toast({ title: "Erro", description: "Não foi possível carregar as promoções.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleCreate = () => {
        setEditingPromotion({});
        setIsDialogOpen(true);
    };

    const handleEdit = (promo: Promotion) => {
        setEditingPromotion(promo);
        setIsDialogOpen(true);
    };

    const handleDuplicate = (promo: Promotion) => {
        const { id, ...promoCopy } = promo;
        setEditingPromotion({ ...promoCopy, title: `${promo.title} (${t('promo_copy_suffix')})` });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deletePromotion('driver', id);
            toast({
                title: t('promo_delete_success_title'),
                description: t('promo_delete_success_desc'),
            });
            fetchPromotions(); // Refresh list
        } catch (error) {
            console.error("Failed to delete promotion:", error);
            toast({ title: "Erro", description: "Não foi possível apagar a promoção.", variant: "destructive" });
        }
    };

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingPromotion) return;

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const promoData: any = {
            ...editingPromotion,
            title: data.title as string,
            type: data.type as Promotion['type'],
            value: Number(data.value),
            startDate: data.startDate as string,
            endDate: data.endDate as string,
            description: data.description as string,
            status: 'Ativa' // Default status for new/edited promos
        };

        try {
            await savePromotion('driver', promoData);
            toast({
                title: t('promo_save_success_title'),
                description: t('promo_save_success_desc'),
            });
            setIsDialogOpen(false);
            setEditingPromotion(null);
            fetchPromotions(); // Refresh list
        } catch (error) {
            console.error("Failed to save promotion:", error);
            toast({ title: "Erro", description: "Não foi possível guardar a promoção.", variant: "destructive" });
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header flex items-center justify-between">
                <div>
                    <h1 className="font-headline title-glow">{t('promotions_page_title_driver')}</h1>
                    <p>{t('promotions_page_subtitle_driver')}</p>
                </div>
                <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('btn_create_promotion')}
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle>{editingPromotion?.id ? t('promo_form_title_edit') : t('promo_form_title_create')}</DialogTitle>
                            <DialogDescription>{t('promo_form_title_create_desc')}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="promo-title">{t('promo_title_label')}</Label>
                                <Input id="promo-title" name="title" placeholder={t('promo_title_placeholder')} defaultValue={editingPromotion?.title} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="promo-type">{t('promo_type_label')}</Label>
                                <Select name="type" defaultValue={editingPromotion?.type}>
                                    <SelectTrigger><SelectValue placeholder={t('promo_type_placeholder')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">{t('promo_type_percentage')}</SelectItem>
                                        <SelectItem value="fixed_discount">{t('promo_type_fixed')}</SelectItem>
                                        <SelectItem value="fixed_price">{t('promo_type_fixed_price')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="promo-value">{t('promo_value_label')}</Label>
                                <Input id="promo-value" name="value" type="number" placeholder={t('promo_value_placeholder')} defaultValue={editingPromotion?.value} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="promo-start">{t('promo_start_date_label')}</Label>
                                    <Input id="promo-start" name="startDate" type="date" defaultValue={editingPromotion?.startDate} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="promo-end">{t('promo_end_date_label')}</Label>
                                    <Input id="promo-end" name="endDate" type="date" defaultValue={editingPromotion?.endDate} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="promo-desc">{t('promo_conditions_label')}</Label>
                                <Textarea id="promo-desc" name="description" placeholder={t('promo_conditions_placeholder')} defaultValue={editingPromotion?.description} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">{t('btn_cancel')}</Button></DialogClose>
                            <Button type="submit">{t('btn_save_promotion')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


            <Card>
                <CardHeader>
                    <CardTitle>{t('promotions_my_promos')}</CardTitle>
                    <CardDescription>{t('promotions_my_promos_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        promotions.map((promo) => (
                            <Card key={promo.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <Tag className="h-8 w-8 text-primary flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                           <p className="font-semibold">{promo.title}</p>
                                           <Badge variant={promo.status === 'Ativa' ? 'default' : 'secondary'}>{t(`promo_status_${promo.status.toLowerCase()}` as any)}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" /> {t('promo_validity_text', { startDate: promo.startDate, endDate: promo.endDate })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                    <Button variant="outline" size="icon" title={t('action_edit')} onClick={() => handleEdit(promo)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon" title={t('action_duplicate')} onClick={() => handleDuplicate(promo)}><Copy className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" title={t('action_delete')}><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>{t('promo_delete_confirm_title')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('promo_delete_confirm_desc')}
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>{t('btn_cancel')}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(promo.id)}>{t('btn_delete')}</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </Card>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
