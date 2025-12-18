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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fedapaySecretKey = Deno.env.get('FEDAPAY_SECRET_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { amount, description, requestId, requestType = 'company', customerEmail, customerName, customerPhone }: PaymentRequest = await req.json();

    // Verify the user owns the request
    const tableName = requestType === 'service' ? 'service_requests' : 'company_requests';
    const { data: request, error: requestError } = await supabase
      .from(tableName)
      .select('user_id')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (request.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - You can only create payments for your own requests' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log('Creating FedaPay transaction for request:', requestId);

    // Create FedaPay transaction
    const fedapayResponse = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapaySecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        amount: amount,
        currency: {
          iso: 'XOF' // Franc CFA
        },
        callback_url: `${supabaseUrl}/functions/v1/payment-webhook`,
        customer: {
          firstname: customerName.split(' ')[0] || customerName,
          lastname: customerName.split(' ').slice(1).join(' ') || customerName,
          email: customerEmail,
          phone_number: {
            number: customerPhone,
            country: 'CI' // Côte d'Ivoire
          }
        },
        custom_metadata: {
          request_id: requestId,
          request_type: requestType
        }
      })
    });

    if (!fedapayResponse.ok) {
      const errorData = await fedapayResponse.text();
      console.error('FedaPay API error:', errorData);
      throw new Error(`FedaPay API error: ${errorData}`);
    }

    const transaction = await fedapayResponse.json();
    console.log('FedaPay transaction created:', transaction.v1.id);

    // Generate payment token to get payment URL
    const tokenResponse = await fetch(`https://api.fedapay.com/v1/transactions/${transaction.v1.id}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fedapaySecretKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('FedaPay token error:', errorData);
      throw new Error(`FedaPay token error: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const paymentUrl = tokenData.v1.url;

    console.log('Payment URL generated:', paymentUrl);

    // Update request with payment info
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        status: 'payment_pending'
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl,
        transactionId: transaction.v1.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
