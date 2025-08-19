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

    // user is null, meaning not logged in.
    if (user === null) {
      router.push('/auth?role=passenger');
    } else if (user.role !== 'passenger') {
      // user is logged in, but not a passenger.
      router.push('/auth');
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
  
  // Before redirect, render nothing.
  return null;
}
