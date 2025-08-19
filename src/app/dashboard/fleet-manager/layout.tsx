'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAppContext } from '@/contexts/app-context';

export default function FleetManagerPanelLayout({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth'); // Redirect to your login page
    } else if (user.role && user.role !== 'passenger') {
      router.push('/auth'); // Redirect to your login page or unauthorized page
    }
  }, [user, router]);
  return <DashboardLayout role="passenger">{children}</DashboardLayout>;
}
