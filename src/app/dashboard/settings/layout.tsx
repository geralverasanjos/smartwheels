'use client';
import type { ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { DashboardLayout, type UserRole } from '@/components/dashboard/dashboard-layout';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  
  const getRoleFromPath = (): UserRole => {
    const from = searchParams.get('from');
    if (from?.includes('/driver')) return 'driver';
    if (from?.includes('/fleet-manager')) return 'fleet-manager';
    return 'passenger';
  }

  const role = getRoleFromPath();

  return (
      <DashboardLayout role={role}>{children}</DashboardLayout>
  );
}
