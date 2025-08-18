'use client';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebarNav } from './sidebar-nav';
import { DashboardHeader } from './dashboard-header';

export type UserRole = 'passenger' | 'driver' | 'fleet-manager';

export function DashboardLayout({ children, role }: { children: React.ReactNode, role: UserRole }) {
  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <DashboardSidebarNav role={role} />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
