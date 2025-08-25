
'use server';

// In a real application, you would install the PayPal SDK. For this prototype, we'll use fetch with mock logic.

/**
 * Sets up the PayPal environment. In a real app, this would use the PayPal SDK.
 * @returns A mock PayPal client object.
 */
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox'; // Default to sandbox

  if (!clientId || !clientSecret) {
    console.error('PayPal client ID or secret is not configured in .env.local');
    throw new Error('PayPal credentials are not set.');
  }

  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  const getAccessToken = async () => {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    return data.access_token;
  };

  return {
    execute: async (request: { method: string, path: string, body?: any, headers?: any }) => {
        const accessToken = await getAccessToken();
        const response = await fetch(`${baseUrl}${request.path}`, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                ...request.headers,
            },
            body: request.body ? JSON.stringify(request.body) : undefined,
        });

        const jsonResponse = await response.json();

        if (!response.ok) {
            console.error('PayPal API Error:', jsonResponse);
            throw new Error(`PayPal API request failed: ${jsonResponse.message || response.statusText}`);
        }
        
        return jsonResponse;
    }
  };
}

/**
 * Creates a PayPal order for the vehicle registration fee.
 * @param vehicleId The unique ID of the vehicle being registered.
 * @returns The PayPal order object, including the approval link.
 */
export async function handleVehicleFee(vehicleId: string) {
    const feeAmount = "3.00";
    const currency = "EUR";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined in your environment variables.");
    }

    const paypalClient = getPayPalClient();
    
    const request = {
        method: 'POST',
        path: '/v2/checkout/orders',
        body: {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: feeAmount
                },
                description: `Taxa de Registo do Veículo #${vehicleId}`,
                custom_id: vehicleId, // Pass the vehicle ID to track the payment
            }],
            application_context: {
                return_url: `${baseUrl}/payment/success?vehicleId=${vehicleId}`,
                cancel_url: `${baseUrl}/payment/cancel?vehicleId=${vehicleId}`,
                brand_name: 'SmartWheels',
                user_action: 'PAY_NOW'
            }
        },
    };

    try {
        const order = await paypalClient.execute(request);
        const approvalLink = order.links.find((link: any) => link.rel === 'approve');
        
        if (approvalLink) {
            return { approvalUrl: approvalLink.href };
        } else {
            console.error("PayPal Order response:", order);
            throw new Error('No approval URL found in PayPal response.');
        }
    } catch (error) {
        console.error('Failed to create PayPal order for vehicle fee:', error);
        throw error;
    }
}
