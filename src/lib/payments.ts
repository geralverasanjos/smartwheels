
/**
 * @fileOverview Server-side payment processing logic using PayPal as the default.
 * This file contains functions to interact with the PayPal REST API.
 * It uses secret API keys and should never be imported into a client-side component.
 */

'use server';

// In a real application, you would install the PayPal SDK:
// npm install @paypal/checkout-server-sdk
//
// import paypal from '@paypal/checkout-server-sdk';

/**
 * Sets up the PayPal environment.
 * Uses credentials from environment variables.
 * @returns A PayPalHttpClient instance.
 */
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  // This is a conceptual setup. The actual implementation depends on the SDK.
  // For example, with the official SDK:
  // const environment = mode === 'live'
  //   ? new paypal.core.LiveEnvironment(clientId, clientSecret)
  //   : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  // const client = new paypal.core.PayPalHttpClient(environment);
  // return client;

  if (!clientId || !clientSecret) {
    console.error('PayPal client ID or secret is not configured in .env.local');
  }
  
  // Returning a mock client for prototyping purposes
  return {
    execute: async (request: any) => {
        console.log(`Executing PayPal request (mock) in ${mode} mode:`, request);
        if (request.verb === 'POST' && request.path.includes('/v2/checkout/orders')) {
             return {
                statusCode: 201,
                result: {
                    id: `mock_order_${Date.now()}`,
                    status: 'CREATED',
                    links: [
                        { href: `https://www.sandbox.paypal.com/checkoutnow?token=mock_order_${Date.now()}`, rel: 'approve', method: 'GET' }
                    ]
                }
            };
        }
         return {
            statusCode: 200,
            result: {
                status: 'COMPLETED'
            }
        }
    }
  };
}

/**
 * Creates a PayPal order to charge a one-time fee (e.g., platform service fee).
 * @param amount The amount to charge, as a string (e.g., "10.00").
 * @param currency The currency code (e.g., "EUR", "BRL", "USD").
 * @returns The PayPal order object, including the approval link.
 */
export async function createPayPalOrder(amount: string, currency: string) {
  const paypalClient = getPayPalClient();
  
  const request = {
      verb: 'POST',
      path: '/v2/checkout/orders',
      body: {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: currency,
                value: amount
            }
        }],
        application_context: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/driver/wallet?paypal_success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/driver/wallet?paypal_cancel=true`,
            brand_name: 'SmartWheels',
            user_action: 'PAY_NOW'
        }
    },
    headers: {
        'Content-Type': 'application/json'
    }
  };

  try {
    const response = await paypalClient.execute(request);
    return response.result;
  } catch (error) {
    console.error('PayPal Error:', error);
    throw new Error('Could not create PayPal order.');
  }
}

/**
 * Captures the payment for a previously created PayPal order.
 * This function is called after the user approves the payment on the PayPal site.
 * @param orderId The ID of the PayPal order.
 * @returns The result of the capture operation.
 */
export async function capturePayPalOrder(orderId: string) {
    const paypalClient = getPayPalClient();
    
    const request = {
        verb: 'POST',
        path: `/v2/checkout/orders/${orderId}/capture`,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await paypalClient.execute(request);
        return response.result;
    } catch (error) {
        console.error('PayPal Capture Error:', error);
        throw new Error('Could not capture PayPal payment.');
    }
}


export async function handleVehicleFee() {
    const feeAmount = "3.00";
    const currency = "EUR";

    const paypalClient = getPayPalClient();
    const request = {
        verb: 'POST',
        path: '/v2/checkout/orders',
        body: {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: feeAmount
                },
                description: 'Taxa de Listagem de Veículo'
            }],
            application_context: {
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/driver/veiculos?payment=success`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/driver/veiculos?payment=cancelled`,
                brand_name: 'SmartWheels',
                user_action: 'PAY_NOW'
            }
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await paypalClient.execute(request);
        const approvalLink = response.result.links.find((link: any) => link.rel === 'approve');
        if (approvalLink) {
            return { approvalUrl: approvalLink.href };
        } else {
            throw new Error('No approval URL found');
        }
    } catch (error) {
        console.error('Failed to create PayPal order for vehicle fee:', error);
        throw error;
    }
}
