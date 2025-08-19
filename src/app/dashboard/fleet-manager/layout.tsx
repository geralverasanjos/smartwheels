'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAppContext } from '@/contexts/app-context';

export default function FleetManagerPanelLayout({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;

    if (user === null) {
      router.push('/auth?role=fleet-manager'); 
    } else if (user.role && user.role !== 'fleet-manager') {
      router.push('/auth'); 
    }
  }, [user, router]);

  if (user === undefined || (user && user.role === 'fleet-manager')) {
    return <DashboardLayout role="fleet-manager">{children}</DashboardLayout>;
  }

  return null;
}
