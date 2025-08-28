
'use server';

// In a real application, you would install the PayPal SDK. For this prototype, we'll use fetch.
// This file is now updated to handle recurring subscriptions.

interface PayPalError extends Error {
    statusCode?: number;
    details?: unknown;
}

interface PayPalTokenResponse {
    access_token: string;
}

interface PayPalProduct {
    id: string;
    // Add other product fields if needed
}

interface PayPalPlan {
    id: string;
    // Add other plan fields if needed
}

interface PayPalSubscription {
    links: { href: string; rel: string; method: string }[];
    // Add other subscription fields if needed
}

type PayPalClient = {
    execute: (request: { method: string, path: string, body?: object, headers?: object }) => Promise<unknown>;
}

/**
 * Sets up the PayPal environment.
 * @returns A mock PayPal client object.
 */
function getPayPalClient(): PayPalClient {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox'; // Default to sandbox

  if (!clientId || !clientSecret) {
    console.error('PayPal client ID or secret is not configured in .env.local');
    throw new Error('PayPal credentials are not set.');
  }

  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  const getAccessToken = async (): Promise<string> => {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await response.json() as PayPalTokenResponse;
    return data.access_token;
  };

  return {
    execute: async (request: { method: string, path: string, body?: object, headers?: object }) => {
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

        // For POST requests that expect no content, a 204 is a success.
        if (response.status === 204) {
            return null;
        }

        const jsonResponse = await response.json();

        if (!response.ok) {
            console.error('PayPal API Error:', JSON.stringify(jsonResponse, null, 2));
            const error: PayPalError = new Error(`PayPal API request failed: ${jsonResponse.message || response.statusText}`);
            error.statusCode = response.status;
            error.details = jsonResponse.details;
            throw error;
        }
        
        return jsonResponse;
    }
  };
}

/**
 * Creates a Product and a Plan on PayPal if they don't already exist.
 * This is the template for the recurring subscription.
 * @param paypalClient The PayPal client.
 * @returns The ID of the billing plan.
 */
async function getOrCreateBillingPlan(paypalClient: PayPalClient): Promise<string> {
    const productId = `SMARTWHEELS-PRODUCT-${process.env.NODE_ENV}`;
    const planId = `SMARTWHEELS-PLAN-${process.env.NODE_ENV}`;
    let finalProductId = '';

    // 1. Get or Create Product
    try {
        console.log(`Checking for PayPal Product: ${productId}`);
        const product = await paypalClient.execute({
            method: 'GET',
            path: `/v1/catalogs/products/${productId}`
        }) as PayPalProduct;
        finalProductId = product.id;
        console.log('Found existing PayPal product.');
    } catch (error: unknown) {
        const paypalError = error as PayPalError;
        if (paypalError && paypalError.statusCode === 404) {
            console.log('PayPal product not found, creating new one.');
            try {
                const newProduct = await paypalClient.execute({
                    method: 'POST',
                    path: '/v1/catalogs/products',
                    body: {
                        id: productId,
                        name: 'SmartWheels Vehicle Subscription',
                        description: 'Monthly access fee for using the SmartWheels platform.',
                        type: 'SERVICE',
                        category: 'SOFTWARE',
                        image_url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
                        home_url: process.env.NEXT_PUBLIC_BASE_URL,
                    },
                }) as PayPalProduct;
                finalProductId = newProduct.id;
                console.log('New PayPal product created.');
            } catch (createError) {
                console.error("Failed to create PayPal product:", createError);
                throw new Error("Could not create a PayPal product.");
            }
        } else {
            console.error("Error fetching PayPal product:", error);
            throw new Error("Could not fetch PayPal product.");
        }
    }

    // 2. Get or Create Plan
    try {
        console.log(`Checking for PayPal Plan: ${planId}`);
        const plan = await paypalClient.execute({
             method: 'GET',
             path: `/v1/billing/plans/${planId}`
        }) as PayPalPlan;
        console.log('Found existing PayPal plan.');
        return plan.id;
    } catch (error: unknown) {
        const paypalError = error as PayPalError;
        if (paypalError && paypalError.statusCode === 404) {
             console.log('PayPal plan not found, creating new one.');
             try {
                const newPlan = await paypalClient.execute({
                    method: 'POST',
                    path: '/v1/billing/plans',
                    body: {
                        id: planId,
                        product_id: finalProductId,
                        name: 'Standard Monthly Vehicle Fee',
                        description: '3 EUR per month subscription for vehicle access.',
                        status: 'ACTIVE',
                        billing_cycles: [{
                            frequency: {
                                interval_unit: 'MONTH',
                                interval_count: 1,
                            },
                            tenure_type: 'REGULAR',
                            sequence: 1,
                            total_cycles: 0, // Infinite
                            pricing_scheme: {
                                fixed_price: {
                                    value: '3.00',
                                    currency_code: 'EUR',
                                },
                            },
                        }],
                        payment_preferences: {
                            auto_bill_outstanding: true,
                            setup_fee_failure_action: 'CONTINUE',
                            payment_failure_threshold: 3,
                        },
                    },
                }) as PayPalPlan;
                console.log('New PayPal plan created.');
                return newPlan.id;
             } catch (createError) {
                console.error("Failed to create PayPal plan:", createError);
                throw new Error("Could not create a PayPal plan.");
             }
        } else {
             console.error("Error fetching PayPal plan:", error);
             throw new Error("Could not fetch PayPal plan.");
        }
    }
}


/**
 * Creates a PayPal subscription for the vehicle registration fee.
 * @param vehicleId The unique ID of the vehicle being registered.
 * @returns The PayPal subscription object, including the approval link.
 */
export async function handleVehicleFee(vehicleId: string): Promise<{ approvalUrl: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined in your environment variables.");
    }

    const paypalClient = getPayPalClient();
    const planId = await getOrCreateBillingPlan(paypalClient);

    const request = {
        method: 'POST',
        path: '/v1/billing/subscriptions',
        body: {
            plan_id: planId,
            custom_id: vehicleId,
            application_context: {
                brand_name: 'SmartWheels',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'SUBSCRIBE_NOW',
                return_url: `${baseUrl}/payment/success?vehicleId=${vehicleId}`,
                cancel_url: `${baseUrl}/payment/cancel?vehicleId=${vehicleId}`,
            }
        },
    };

    try {
        const subscription = await paypalClient.execute(request) as PayPalSubscription;
        const approvalLink = subscription.links.find((link) => link.rel === 'approve');
        
        if (approvalLink) {
            return { approvalUrl: approvalLink.href };
        } else {
            console.error("PayPal Subscription response:", subscription);
            throw new Error('No approval URL found in PayPal subscription response.');
        }
    } catch (error) {
        console.error('Failed to create PayPal subscription for vehicle fee:', error);
        throw error;
    }
}

    