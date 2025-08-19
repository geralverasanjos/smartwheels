'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAppContext } from '@/contexts/app-context';

export default function PassengerPanelLayout({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/auth'); // Redirect to your login page
    } else if (user.role && user.role !== 'passenger') {
      router.push('/auth'); // Redirect to an unauthorized page or their correct dashboard
    }
  }, [user, router]);

  return <DashboardLayout role="passenger">{children}</DashboardLayout>;
}
