'use client';
import SuperDriverPanel from '@/components/dashboard/driver/super-driver-panel';
import { useAppContext } from '@/contexts/app-context';

export default function DriverDashboard() {
  const { t } = useAppContext();
  return (
    <div className="relative h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)]">
        <SuperDriverPanel t={t} />
    </div>
  );
}
