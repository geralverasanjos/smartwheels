'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout, type UserRole } from '@/components/dashboard/dashboard-layout';

export default function PaymentsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // A simple way to determine the role based on the URL.
  // This can be replaced with a more robust role management system (e.g., from context or session).
  const getRoleFromPath = (): UserRole => {
    if (pathname.includes('/driver/')) return 'driver';
    if (pathname.includes('/fleet-manager/')) return 'fleet-manager';
    return 'passenger';
  }

  const role = getRoleFromPath();

  return (
      <DashboardLayout role={role}>{children}</DashboardLayout>
  );
}
