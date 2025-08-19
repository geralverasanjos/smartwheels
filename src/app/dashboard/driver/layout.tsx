'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAppContext } from '@/contexts/app-context';
import { Loader2 } from 'lucide-react';

export default function DriverPanelLayout({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    if (user === null) {
      router.push('/auth?role=driver');
    } else if (user.role !== 'driver') {
      router.push('/auth');
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (user && user.role === 'driver') {
    return <DashboardLayout role="driver">{children}</DashboardLayout>;
  }

  return null;
}
