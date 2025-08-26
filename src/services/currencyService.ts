// src/services/currencyService.ts
import type { ExchangeRateResponse } from '@/types'; 

// Updated API endpoint
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/';

/**
 * @description Busca a taxa de câmbio de uma moeda base para outra.
 * @param from - A moeda base (ex: 'EUR').
 * @param to - A moeda de destino (ex: 'BRL').
 * @returns A taxa de câmbio como um número.
 */
export async function getExchangeRate(from: string, to: string): Promise<number | null> {
  if (from === to) return 1;
  try {
    const response = await fetch(`${API_BASE_URL}${from}`);

    if (!response.ok) {
      console.error(`Erro ao buscar taxa de câmbio: ${response.status}`);
      return null;
    }

    const data: ExchangeRateResponse = await response.json();
    const rate = data.rates[to];

    if (typeof rate !== 'number') {
      console.error(`Taxa de câmbio inválida para ${to}.`);
      return null;
    }

    return rate;
  } catch (error) {
    console.error('Falha na requisição da API de câmbio:', error);
    return null;
  }
}
