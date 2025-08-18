'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSelector } from '../landing/language-selector';
import Link from 'next/link';
import { useAppContext } from '@/contexts/app-context';
import { usePathname } from 'next/navigation';

export function DashboardHeader() {
    const { t } = useAppContext();
    const pathname = usePathname();

    const getProfileLink = () => {
        if (pathname.includes('/dashboard/passenger')) return '/dashboard/passenger/profile';
        if (pathname.includes('/dashboard/driver')) return '/dashboard/driver/profile';
        if (pathname.includes('/dashboard/fleet-manager')) return '/dashboard/fleet-manager/profile';
        return '#';
    }

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1" />
            <LanguageSelector />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                         <Avatar>
                            <AvatarImage src="https://placehold.co/40x40/FFFFFF/000000?text=U" alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('my_account')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><Link href={getProfileLink()}>{t('menu_profile')}</Link></DropdownMenuItem>
                    <DropdownMenuItem><Link href="/dashboard/settings">{t('menu_settings')}</Link></DropdownMenuItem>
                    <DropdownMenuItem><Link href="/dashboard/support">{t('menu_support')}</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><Link href="/">{t('logout')}</Link></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
