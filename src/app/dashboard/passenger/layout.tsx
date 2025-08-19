'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAppContext } from '@/contexts/app-context';
import { Loader2 } from 'lucide-react';

export default function PassengerPanelLayout({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // user is undefined while loading.
    if (user === undefined) {
      return; 
    }

    // user is null (not logged in) or not a passenger, redirect to the correct login page.
    if (user === null || user.role !== 'passenger') {
      router.push('/auth?role=passenger');
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

  // Once loading is complete and we've confirmed the user is a passenger, render the layout.
  if (user && user.role === 'passenger') {
    return <DashboardLayout role="passenger">{children}</DashboardLayout>;
  }
  
  // If the user is not a passenger, this will be the state before the redirect kicks in.
  // Returning a loader prevents rendering anything until the redirect happens.
  return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
}
