'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAppContext } from '@/contexts/app-context';

export default function DriverPanelLayout({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if user is not authenticated
    // We check for `user === undefined` initially because the context might not be loaded yet.
    // Once the context is loaded, `user` will be either a user object or `null`.
    if (user === undefined) {
 // If user is authenticated but not a driver, redirect to unauthorized or their dashboard
    } else if (user.role && user.role !== 'driver') {
      router.push('/auth'); // Redirect to your login page
    }
  }, [user, router]);

  return (
    // Only render the layout if the user is authenticated and is a driver
    // or if the user state is still loading (undefined)
    <>
      {(user === undefined || (user && user.role === 'driver')) && children}
      <DashboardLayout role="driver">{children}</DashboardLayout>
    </>
  ); // Removed extra closing parenthesis
}
