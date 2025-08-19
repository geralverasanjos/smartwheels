'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAppContext } from '@/contexts/app-context';
import { Loader2 } from 'lucide-react';

export default function FleetManagerPanelLayout({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // user is undefined while loading.
    if (user === undefined) {
      return;
    }

    // user is null (not logged in) or not a fleet manager. Redirect to the fleet manager login page.
    if (user === null || user.role !== 'fleet-manager') {
      router.push('/auth?role=fleet-manager'); 
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

  // Once loading is complete and we've confirmed the user is a fleet manager, render the layout.
  if (user && user.role === 'fleet-manager') {
    return <DashboardLayout role="fleet-manager">{children}</DashboardLayout>;
  }

  // Before redirect, render a loader.
  return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
}
