// src/services/promotionService.ts
import type { Promotion } from '@/types';

const mockDriverPromotions: Promotion[] = [
  {
    id: 1,
    title: '20% Off em Corridas Longas',
    description: 'Receba 20% de desconto em todas as corridas acima de 15km.',
    type: 'percentage',
    value: 20,
    startDate: '2024-05-01',
    endDate: '2024-06-30',
    status: 'Ativa',
  },
  {
    id: 2,
    title: '€5 de Desconto no Fim de Semana',
    description: 'Use este código para obter 5€ de desconto em qualquer corrida durante o fim de semana.',
    type: 'fixed_discount',
    value: 5,
    startDate: '2024-05-01',
    endDate: '2024-12-31',
    status: 'Ativa',
  },
  {
    id: 3,
    title: 'Viagem para o Aeroporto por €20',
    description: 'Preço fixo para viagens com origem ou destino no aeroporto.',
    type: 'fixed_price',
    value: 20,
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    status: 'Inativa',
  },
];

const mockFleetPromotions: Promotion[] = [
    {
        id: 1,
        title: 'Bónus de Frota: 10% Extra',
        description: 'Ganhe 10% extra em todas as corridas da sua frota este mês.',
        type: 'percentage',
        value: 10,
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        status: 'Ativa',
    },
    {
        id: 2,
        title: 'Taxa Zero para Novos Motoristas',
        description: 'Novos motoristas na sua frota não pagam taxa de serviço no primeiro mês.',
        type: 'fixed_discount',
        value: 100, // Representing 100% discount
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'Ativa',
    },
];

// Simulates fetching data from an API
export const getDriverPromotions = (): Promise<Promotion[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockDriverPromotions);
    }, 1000); // Simulate network delay
  });
};

export const getFleetPromotions = (): Promise<Promotion[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockFleetPromotions);
      }, 1000); // Simulate network delay
    });
  };
