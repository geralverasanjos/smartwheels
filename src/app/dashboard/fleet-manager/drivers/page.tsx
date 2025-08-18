'use client';

import React, { useState } from 'react';
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
import { MoreHorizontal, UserPlus, Car, Star } from 'lucide-react';
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


// Mock data for drivers
const initialDrivers = [
  {
    id: 'd001',
    name: 'Carlos Silva',
    avatarUrl: 'https://placehold.co/40x40/32CD32/FFFFFF?text=CS',
    vehicle: 'Renault Zoe (AB-12-CD)',
    status: 'online',
    rating: 4.9,
    email: 'carlos.silva@example.com'
  },
  {
    id: 'd002',
    name: 'Mariana Costa',
    avatarUrl: 'https://placehold.co/40x40/32CD32/FFFFFF?text=MC',
    vehicle: 'Nissan Leaf (EF-34-GH)',
    status: 'in_trip',
    rating: 4.7,
    email: 'mariana.costa@example.com'
  },
  {
    id: 'd003',
    name: 'Pedro Marques',
    avatarUrl: 'https://placehold.co/40x40/32CD32/FFFFFF?text=PM',
    vehicle: 'Tesla Model 3 (IJ-56-KL)',
    status: 'offline',
    rating: 4.8,
    email: 'pedro.marques@example.com'
  },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'online': return 'default';
        case 'in_trip': return 'destructive';
        default: return 'secondary';
    }
}

export default function FleetDriversPage() {
    const { t } = useAppContext();
    const { toast } = useToast();
    const [drivers, setDrivers] = useState(initialDrivers);
    const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<typeof initialDrivers[0] | null>(null);

    const handleAddOrEditDriver = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Lógica para salvar os dados (simulada)
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
    const openEditDialog = (driver: typeof initialDrivers[0]) => {
        setEditingDriver(driver);
        setIsAddDriverDialogOpen(true);
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
                            {drivers.map((driver) => (
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
                                            <span>{driver.vehicle}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(driver.status)}>{t(`status_${driver.status}` as TranslationKeys)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span>{driver.rating.toFixed(1)}</span>
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
                            ))}
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
                                <Input id="vehicle" defaultValue={editingDriver?.vehicle} placeholder={t('driver_placeholder_vehicle')} />
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
