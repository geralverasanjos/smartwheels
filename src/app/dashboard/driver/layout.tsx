'use client';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function DriverPanelLayout({ children }: { children: ReactNode }) {
  return (
      <DashboardLayout role="driver">{children}</DashboardLayout>
  );
}
