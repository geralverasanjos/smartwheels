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
    if (user === undefined) return;

    if (user === null) {
      router.push('/auth?role=passenger');
    } else if (user.role && user.role !== 'passenger') {
      router.push('/auth');
    }
  }, [user, router]);

  if (user === undefined || (user && user.role === 'passenger')) {
    return <DashboardLayout role="passenger">{children}</DashboardLayout>;
  }

  return null;
}
