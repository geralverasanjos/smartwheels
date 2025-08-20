'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, UserPlus, Car, Star, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/app-context';
import type { TranslationKeys } from '@/lib/i18n';
import type { UserProfile } from '@/types';
import { getDriversByFleetManager } from '@/services/profileService';

const getStatusVariant = (status?: string) => {
    switch (status) {
        case 'online': return 'default';
        case 'in_trip': return 'destructive';
        default: return 'secondary';
    }
}

export default function FleetDriversPage() {
    const { t, user } = useAppContext();
    const { toast } = useToast();
    const [drivers, setDrivers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchDrivers = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const driversData = await getDriversByFleetManager(user.id);
                setDrivers(driversData);
            } catch (error) {
                console.error("Failed to fetch drivers:", error);
                toast({ title: t('error_title'), description: "Failed to load drivers.", variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchDrivers();
    }, [user, toast, t]);

    const handleAddOrEditDriver = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Implement save/update logic with backend
        toast({
            title: t(editingDriver ? 'edit_driver_title' : 'add_driver_title'),
            description: t('driver_data_saved_success'),
        });
        setIsAddDriverDialogOpen(false);
        setEditingDriver(null);
    };

    const openAddDialog = () => {
        setEditingDriver(null);
        setIsAddDriverDialogOpen(true);
    }
    const openEditDialog = (driver: UserProfile) => {
        setEditingDriver(driver);
        setIsAddDriverDialogOpen(true);
    }

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="panel-header flex items-center justify-between">
                <div>
                    <h1 className="font-headline title-glow">{t('menu_drivers_management')}</h1>
                    <p>{t('fleet_drivers_page_desc')}</p>
                </div>
                <Button onClick={openAddDialog}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('btn_add_driver')}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('drivers_list_title')}</CardTitle>
                    <CardDescription>{t('drivers_list_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table_header_driver')}</TableHead>
                                <TableHead>{t('table_header_vehicle')}</TableHead>
                                <TableHead>{t('table_header_status')}</TableHead>
                                <TableHead className="text-center">{t('table_header_rating')}</TableHead>
                                <TableHead><span className="sr-only">{t('table_header_actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drivers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">{t('no_drivers_found')}</TableCell>
                                </TableRow>
                            ) : (
                                drivers.map((driver) => (
                                    <TableRow key={driver.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={driver.avatarUrl} alt={driver.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{driver.name.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{driver.name}</p>
                                                    <p className="text-xs text-muted-foreground">{driver.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Car className="h-4 w-4 text-muted-foreground" />
                                                <span>{driver.activeVehicleId || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant((driver as any).status)}>{t(`status_${(driver as any).status}` as TranslationKeys) || (driver as any).status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                <span>{(driver.rating || 0).toFixed(1)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('table_header_actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openEditDialog(driver)}>{t('action_edit')}</DropdownMenuItem>
                                                    <DropdownMenuItem>{t('action_suspend')}</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">{t('action_remove')}</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                    <DialogTitle>{editingDriver ? t('edit_driver_title') : t('add_driver_title')}</DialogTitle>
                    <DialogDescription>
                       {editingDriver ? t('edit_driver_desc') : t('add_driver_desc')}
                    </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddOrEditDriver}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('driver_name_label')}</Label>
                                <Input id="name" defaultValue={editingDriver?.name} placeholder={t('driver_placeholder_name')} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('email_label')}</Label>
                                <Input id="email" type="email" defaultValue={editingDriver?.email} placeholder={t('driver_placeholder_email')} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="vehicle">{t('vehicle_label')}</Label>
                                <Input id="vehicle" defaultValue={editingDriver?.activeVehicleId} placeholder={t('driver_placeholder_vehicle')} />
                            </div>
                        </div>
                         <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDriverDialogOpen(false)}>{t('btn_cancel')}</Button>
                            <Button type="submit">{t('btn_save')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
