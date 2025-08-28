
'use client';
import {
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    LayoutGrid,
    Car,
    Truck,
    History,
    Wallet,
    CreditCard,
    MessageSquare,
    Bell,
    User,
    Award,
    Settings,
    LifeBuoy,
    LogOut,
    Users,
    AreaChart,
    Tv,
    FileText,
    MapPin,
} from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { UserRole } from './dashboard-layout';
import { useSidebar } from '@/components/ui/sidebar';
import { TranslationKeys } from '@/lib/i18n';


const passengerNav = [
    { href: "/dashboard/passenger", icon: LayoutGrid, labelKey: "passenger_panel_welcome_title" },
    { href: "/dashboard/passenger/transport", icon: Car, labelKey: "menu_transport" },
    { href: "/dashboard/passenger/mototaxi", icon: Car, labelKey: "menu_mototaxi" },
    { href: "/dashboard/passenger/delivery", icon: Truck, labelKey: "menu_delivery" },
    { href: "/dashboard/passenger/history", icon: History, labelKey: "menu_history" },
    { href: "/dashboard/passenger/wallet", icon: Wallet, labelKey: "menu_wallet" },
    { href: "/dashboard/passenger/payments", icon: CreditCard, labelKey: "menu_payments" },
    { href: "/dashboard/passenger/chat", icon: MessageSquare, labelKey: "menu_chat" },
    { href: "/dashboard/passenger/notifications", icon: Bell, labelKey: "menu_notifications" },
    { href: "/dashboard/passenger/profile", icon: User, labelKey: "menu_profile" },
    { href: "/dashboard/passenger/refer", icon: Award, labelKey: "menu_refer" },
];

const driverNav = [
    { href: "/dashboard/driver", icon: LayoutGrid, labelKey: "role_driver" },
    { href: "/dashboard/driver/earnings", icon: AreaChart, labelKey: "menu_earnings" },
    { href: "/dashboard/driver/billing", icon: CreditCard, labelKey: "menu_billing" },
    { href: "/dashboard/driver/reports", icon: FileText, labelKey: "menu_reports" },
    { href: "/dashboard/driver/history", icon: History, labelKey: "menu_history" },
    { href: "/dashboard/driver/wallet", icon: Wallet, labelKey: "menu_wallet" },
    { href: "/dashboard/driver/vehicles", icon: Car, labelKey: "menu_vehicles" },
    { href: "/dashboard/driver/stands", icon: MapPin, labelKey: "menu_stands" },
    { href: "/dashboard/driver/promotions", icon: Award, labelKey: "menu_promotions" },
    { href: "/dashboard/driver/referral", icon: Users, labelKey: "menu_referral" },
    { href: "/dashboard/driver/chat", icon: MessageSquare, labelKey: "menu_chat" },
    { href: "/dashboard/driver/notifications", icon: Bell, labelKey: "menu_notifications" },
    { href: "/dashboard/driver/profile", icon: User, labelKey: "menu_profile" },
];

const fleetManagerNav = [
    { href: "/dashboard/fleet-manager", icon: LayoutGrid, labelKey: "role_fleet-manager" },
    { href: "/dashboard/fleet-manager/monitoring", icon: Tv, labelKey: "menu_monitoring" },
    { href: "/dashboard/fleet-manager/drivers", icon: Users, labelKey: "menu_drivers" },
    { href: "/dashboard/fleet-manager/vehicles", icon: Car, labelKey: "menu_vehicles" },
    { href: "/dashboard/fleet-manager/earnings", icon: AreaChart, labelKey: "menu_earnings" },
    { href: "/dashboard/fleet-manager/reports", icon: FileText, labelKey: "menu_reports" },
    { href: "/dashboard/fleet-manager/billing", icon: CreditCard, labelKey: "menu_billing" },
    { href: "/dashboard/fleet-manager/wallet", icon: Wallet, labelKey: "menu_wallet" },
    { href: "/dashboard/fleet-manager/promotions", icon: Award, labelKey: "menu_promotions" },
    { href: "/dashboard/fleet-manager/refer", icon: Award, labelKey: "menu_refer" },
    { href: "/dashboard/fleet-manager/notifications", icon: Bell, labelKey: "menu_notifications" },
    { href: "/dashboard/fleet-manager/profile", icon: User, labelKey: "menu_profile" },
];


const navConfig = {
    passenger: passengerNav,
    driver: driverNav,
    'fleet-manager': fleetManagerNav,
};


export function DashboardSidebarNav({ role }: { role: UserRole }) {
    const { t } = useAppContext();
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();
    const navItems = navConfig[role];

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <>
            <SidebarHeader className="p-4">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold font-headline"><span className="text-primary">Smart</span>Wheels</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                         <SidebarMenuItem key={item.href} onClick={handleLinkClick}>
                            <Link href={item.href}>
                                <SidebarMenuButton isActive={pathname === item.href} tooltip={t(item.labelKey as TranslationKeys)}>
                                    <item.icon />
                                    <span>{t(item.labelKey as TranslationKeys)}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                     <SidebarMenuItem onClick={handleLinkClick}>
                        <Link href={`/dashboard/settings?from=${pathname}`}>
                            <SidebarMenuButton isActive={pathname === "/dashboard/settings"} tooltip={t('menu_settings')}>
                                <Settings />
                                <span>{t('menu_settings')}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem onClick={handleLinkClick}>
                        <Link href={`/dashboard/support?from=${pathname}`}>
                            <SidebarMenuButton isActive={pathname === "/dashboard/support"} className="support-button-glow" tooltip={t('menu_support')}>
                                <LifeBuoy />
                                <span>{t('menu_support')}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarSeparator />
                     <SidebarMenuItem onClick={handleLinkClick}>
                        <Link href="/">
                            <SidebarMenuButton tooltip="Logout">
                                <LogOut />
                                <span>{t('logout')}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </>
    );
}
