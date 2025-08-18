'use client';
import type { ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { DashboardLayout, type UserRole } from '@/components/dashboard/dashboard-layout';

export default function SupportLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const getRoleFromPath = (): UserRole => {
    // This is a simple way to determine role. 
    // It assumes a previous page context, which might not be robust.
    // A better approach would be to have the role in the user's session.
    const from = searchParams.get('from');
    if (from?.includes('/driver')) return 'driver';
    if (from?.includes('/fleet-manager')) return 'fleet-manager';
    // Default to passenger if no specific role is detected
    return 'passenger';
  }

  const role = getRoleFromPath();

  return (
      <DashboardLayout role={role}>{children}</DashboardLayout>
  );
}
