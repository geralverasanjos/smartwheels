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
    // user is undefined while loading. Don't do anything yet.
    if (user === undefined) {
      return;
    }

    // user is null (not logged in) or not a driver. Redirect to the driver login page.
    if (user === null || user.role !== 'driver') {
      router.push('/auth?role=driver');
    }
  }, [user, router]);

  // While user state is loading, show a spinner.
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  // Once loading is complete and we've confirmed the user is a driver, render the layout.
  if (user && user.role === 'driver') {
    return <DashboardLayout role="driver">{children}</DashboardLayout>;
  }

  // If the user is not a driver or is null, this will be the state before the redirect kicks in.
  // Returning a loader prevents rendering anything until the redirect happens.
  return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
}
