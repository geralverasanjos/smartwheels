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
    // Se o estado do utilizador ainda está a carregar (undefined), não fazemos nada.
    if (user === undefined) {
      return;
    }

    // Se o utilizador não está autenticado (null), redireciona para o login.
    if (user === null) {
      router.push('/auth');
    } else if (user.role && user.role !== 'driver') {
      // Se o utilizador está autenticado mas não é um motorista, redireciona.
      // Poderíamos redirecionar para uma página de "não autorizado" ou para o painel correto.
      router.push('/auth');
    }
  }, [user, router]);

  // Renderiza o conteúdo apenas se o utilizador for um motorista ou se o estado ainda estiver a carregar.
  // Isto evita um piscar de ecrã do conteúdo antes do redirecionamento.
  if (user === undefined || (user && user.role === 'driver')) {
    return <DashboardLayout role="driver">{children}</DashboardLayout>;
  }

  // Se o utilizador não for um motorista, podemos renderizar um loader ou null enquanto redireciona.
  return null;
}
