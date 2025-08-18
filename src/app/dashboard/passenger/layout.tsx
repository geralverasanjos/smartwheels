'use client';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function PassengerPanelLayout({ children }: { children: ReactNode }) {
  return (
      <DashboardLayout role="passenger">{children}</DashboardLayout>
  );
}
