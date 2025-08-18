'use client';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function FleetManagerPanelLayout({ children }: { children: ReactNode }) {
  return (
      <DashboardLayout role="fleet-manager">{children}</DashboardLayout>
  );
}
