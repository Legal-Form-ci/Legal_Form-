import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  description: string;
  requestId: string;
  requestType?: 'company' | 'service';
  customerEmail: string;
  customerName: string;
  customerPhone: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== CREATE-PAYMENT FUNCTION STARTED ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const fedapaySecretKey = Deno.env.get('FEDAPAY_SECRET_KEY');

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasFedapayKey: !!fedapaySecretKey
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - Supabase' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!fedapaySecretKey) {
      console.error('Missing FEDAPAY_SECRET_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - FedaPay key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    let body: PaymentRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { 
      amount, 
      description, 
      requestId, 
      requestType = 'company', 
      customerEmail, 
      customerName, 
      customerPhone 
    } = body;

    console.log('Payment request:', { amount, description, requestId, requestType, customerEmail, customerName });

    // Validate required fields
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Request ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ error: 'Customer email and name are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify the user owns the request
    const tableName = requestType === 'service' ? 'service_requests' : 'company_requests';
    const { data: request, error: requestError } = await supabase
      .from(tableName)
      .select('user_id, tracking_number, company_name')
      .eq('id', requestId)
      .maybeSingle();

    if (requestError) {
      console.error('Database error:', requestError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!request) {
      console.error('Request not found:', requestId);
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (request.user_id !== user.id) {
      console.error('User does not own request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - You can only create payments for your own requests' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    console.log('Creating FedaPay transaction...');

    // Prepare customer data - handle phone number
    const cleanPhone = customerPhone ? customerPhone.replace(/[^0-9]/g, '') : '';
    
    // Determine FedaPay API base URL (sandbox or production)
    const fedapayBaseUrl = fedapaySecretKey.startsWith('sk_live') 
      ? 'https://api.fedapay.com' 
      : 'https://sandbox-api.fedapay.com';

    console.log('Using FedaPay URL:', fedapayBaseUrl);
    console.log('API key prefix:', fedapaySecretKey.substring(0, 10));

    // Get the app URL for redirects
    const appUrl = Deno.env.get('APP_URL') || 'https://wpczgwxsriezaubncuom.lovableproject.com';

    // Create FedaPay transaction with proper structure
    const transactionPayload = {
      description: description || `Paiement Legal Form - ${request.tracking_number || requestId}`,
      amount: Math.round(amount),
      currency: {
        iso: 'XOF'
      },
      callback_url: `${supabaseUrl}/functions/v1/payment-webhook`,
      customer: {
        firstname: customerName.split(' ')[0] || customerName,
        lastname: customerName.split(' ').slice(1).join(' ') || customerName,
        email: customerEmail,
        phone_number: cleanPhone ? {
          number: cleanPhone,
          country: 'CI'
        } : undefined
      },
      metadata: {
        request_id: requestId,
        request_type: requestType,
        tracking_number: request.tracking_number || '',
        user_id: user.id
      }
    };

    console.log('FedaPay payload:', JSON.stringify(transactionPayload, null, 2));

    const fedapayResponse = await fetch(`${fedapayBaseUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapaySecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionPayload)
    });

    const fedapayResponseText = await fedapayResponse.text();
    console.log('FedaPay response status:', fedapayResponse.status);
    console.log('FedaPay response:', fedapayResponseText);

    if (!fedapayResponse.ok) {
      console.error('FedaPay API error:', fedapayResponseText);
      return new Response(
        JSON.stringify({ 
          error: 'Payment service error', 
          details: fedapayResponseText 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    let transaction;
    try {
      transaction = JSON.parse(fedapayResponseText);
    } catch (parseError) {
      console.error('Failed to parse FedaPay response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid response from payment service' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    // FedaPay response structure: { v1: { id, reference, ... } }
    const transactionData = transaction.v1 || transaction;
    const transactionId = transactionData.id;

    if (!transactionId) {
      console.error('No transaction ID in response:', transaction);
      return new Response(
        JSON.stringify({ error: 'Invalid transaction response - no ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    console.log('FedaPay transaction created:', transactionId);

    // Generate payment token to get payment URL
    const tokenResponse = await fetch(`${fedapayBaseUrl}/v1/transactions/${transactionId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapaySecretKey}`,
        'Content-Type': 'application/json',
      }
    });

    const tokenResponseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response:', tokenResponseText);

    if (!tokenResponse.ok) {
      console.error('FedaPay token error:', tokenResponseText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate payment link', 
          details: tokenResponseText 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid token response from payment service' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    const tokenInfo = tokenData.v1 || tokenData;
    const paymentUrl = tokenInfo.url;

    if (!paymentUrl) {
      console.error('No payment URL in token response:', tokenData);
      return new Response(
        JSON.stringify({ error: 'No payment URL received' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    console.log('Payment URL generated:', paymentUrl);

    // Create payment record in database
    const { error: paymentInsertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        request_id: requestId,
        request_type: requestType,
        amount: Math.round(amount),
        currency: 'XOF',
        status: 'pending',
        transaction_id: String(transactionId),
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: cleanPhone,
        tracking_number: request.tracking_number,
        metadata: {
          fedapay_reference: transactionData.reference,
          description: description
        }
      });

    if (paymentInsertError) {
      console.error('Error inserting payment record:', paymentInsertError);
      // Don't fail the request, payment was created in FedaPay
    }

    // Update request with payment info
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        payment_status: 'pending',
        payment_id: String(transactionId),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
      // Don't fail the request, payment was created
    }

    // Log the payment event
    await supabase
      .from('payment_logs')
      .insert({
        payment_id: null, // We don't have the payment UUID yet
        event_type: 'payment_initiated',
        event_data: {
          transaction_id: transactionId,
          request_id: requestId,
          amount: amount,
          payment_url: paymentUrl
        }
      });

    console.log('=== CREATE-PAYMENT FUNCTION SUCCESS ===');

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl,
        transactionId: String(transactionId)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('=== CREATE-PAYMENT FUNCTION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        message: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
