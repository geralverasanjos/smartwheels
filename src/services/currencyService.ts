'use server';

/**
 * @fileoverview Service for handling currency conversions.
 * In a real-world application, this service would fetch real-time exchange rates
 * from a reliable financial API. For this prototype, it will return simulated rates.
 */

// A simple, simulated exchange rate table relative to a base currency (e.g., EUR).
const SIMULATED_RATES: Record<string, number> = {
    'EUR': 1,
    'USD': 1.08,
    'BRL': 5.85,
    'JPY': 169.75,
    'GBP': 0.85,
};

interface ExchangeRateParams {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
}

interface ConversionResult {
    convertedAmount: number;
    rate: number;
}

/**
 * Converts an amount from one currency to another using simulated rates.
 * @param {ExchangeRateParams} params - The currencies and amount to convert.
 * @returns {Promise<ConversionResult>} The converted amount and the rate used.
 */
export const convertCurrency = async ({ fromCurrency, toCurrency, amount }: ExchangeRateParams): Promise<ConversionResult> => {
    const rateFrom = SIMULATED_RATES[fromCurrency.toUpperCase()];
    const rateTo = SIMULATED_RATES[toCurrency.toUpperCase()];

    if (!rateFrom || !rateTo) {
        throw new Error(`Currency not supported. Supported currencies are: ${Object.keys(SIMULATED_RATES).join(', ')}`);
    }

    // Convert 'from' currency to the base currency (EUR), then from base to 'to' currency.
    const amountInBase = amount / rateFrom;
    const convertedAmount = amountInBase * rateTo;
    const effectiveRate = rateTo / rateFrom;

    return {
        convertedAmount: parseFloat(convertedAmount.toFixed(2)),
        rate: parseFloat(effectiveRate.toFixed(4)),
    };
};

/**
 * Gets the exchange rate between two currencies.
 * @param fromCurrency The base currency.
 * @param toCurrency The target currency.
 * @returns The exchange rate.
 */
export const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
    const rateFrom = SIMULATED_RATES[fromCurrency.toUpperCase()];
    const rateTo = SIMULATED_RATES[toCurrency.toUpperCase()];

    if (!rateFrom || !rateTo) {
        throw new Error(`Currency not supported. Supported currencies are: ${Object.keys(SIMULATED_RATES).join(', ')}`);
    }

    const effectiveRate = rateTo / rateFrom;
    return parseFloat(effectiveRate.toFixed(4));
}
