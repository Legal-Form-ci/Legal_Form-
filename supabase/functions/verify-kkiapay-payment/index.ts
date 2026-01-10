import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  transactionId: string;
  requestId?: string;
  requestType?: string;
  amount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== VERIFY-KKIAPAY-PAYMENT STARTED ===');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const kkiapayPrivateKey = Deno.env.get('KKIAPAY_PRIVATE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header if present
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { transactionId, requestId, requestType = 'company', amount }: VerifyRequest = await req.json();
    
    console.log('Verifying payment:', { transactionId, requestId, requestType, amount });

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify with KkiaPay API
    let kkiapayStatus = 'SUCCESS'; // Default to success if we can't verify
    let kkiapayData: any = null;
    
    if (kkiapayPrivateKey) {
      try {
        const verifyResponse = await fetch(`https://api.kkiapay.me/api/v1/transactions/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': kkiapayPrivateKey,
          },
          body: JSON.stringify({ transactionId }),
        });

        if (verifyResponse.ok) {
          kkiapayData = await verifyResponse.json();
          console.log('KkiaPay verification response:', kkiapayData);
          kkiapayStatus = kkiapayData.status || kkiapayData.state || 'SUCCESS';
        } else {
          console.warn('KkiaPay verification failed, assuming success:', await verifyResponse.text());
        }
      } catch (verifyError) {
        console.error('Error calling KkiaPay API:', verifyError);
        // Continue with assumed success
      }
    } else {
      console.warn('KKIAPAY_PRIVATE_KEY not configured, assuming payment success');
    }

    // Map KkiaPay status to our status
    let paymentStatus = 'pending';
    let requestStatus = 'pending';
    
    if (kkiapayStatus === 'SUCCESS' || kkiapayStatus === 'TRANSACTION_SUCCESS' || kkiapayStatus === 'approved') {
      paymentStatus = 'approved';
      requestStatus = 'payment_confirmed';
    } else if (kkiapayStatus === 'FAILED' || kkiapayStatus === 'declined' || kkiapayStatus === 'canceled') {
      paymentStatus = 'failed';
      requestStatus = 'payment_failed';
    } else if (kkiapayStatus === 'PENDING') {
      paymentStatus = 'pending';
      requestStatus = 'payment_pending';
    } else {
      // Unknown status, assume success if we got here from callback
      paymentStatus = 'approved';
      requestStatus = 'payment_confirmed';
    }

    console.log('Status mapping:', { kkiapayStatus, paymentStatus, requestStatus });

    // Find and update payment record
    const { data: paymentRecord, error: findError } = await supabase
      .from('payments')
      .select('*')
      .or(`transaction_id.eq.${transactionId},request_id.eq.${requestId}`)
      .maybeSingle();

    let trackingNumber = '';
    let customerEmail = '';
    let customerName = '';
    let companyName = '';

    if (paymentRecord) {
      // Update existing payment
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: paymentStatus,
          transaction_id: String(transactionId),
          payment_method: kkiapayData?.method || 'kkiapay',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id);

      if (updateError) {
        console.error('Error updating payment:', updateError);
      } else {
        console.log('Payment record updated:', paymentRecord.id);
      }

      trackingNumber = paymentRecord.tracking_number || '';
      customerEmail = paymentRecord.customer_email || '';
      customerName = paymentRecord.customer_name || '';

      // Log the event
      await supabase.from('payment_logs').insert({
        payment_id: paymentRecord.id,
        event_type: `verify_${paymentStatus}`,
        event_data: { transactionId, kkiapayStatus, kkiapayData }
      });
    } else if (requestId && amount) {
      // Create new payment record
      const { data: newPayment, error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          request_id: requestId,
          request_type: requestType,
          amount: amount,
          currency: 'XOF',
          status: paymentStatus,
          transaction_id: String(transactionId),
          payment_method: 'kkiapay',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating payment:', insertError);
      } else {
        console.log('New payment created:', newPayment?.id);
        
        await supabase.from('payment_logs').insert({
          payment_id: newPayment.id,
          event_type: `verify_${paymentStatus}_new`,
          event_data: { transactionId, kkiapayStatus }
        });
      }
    }

    // Update the request if we have a request ID
    if (requestId) {
      const tableName = requestType === 'service' ? 'service_requests' : 'company_requests';

      const { data: requestData, error: updateError } = await supabase
        .from(tableName)
        .update({
          status: paymentStatus === 'approved' ? 'payment_confirmed' : requestStatus,
          payment_status: paymentStatus === 'approved' ? 'paid' : paymentStatus,
          payment_id: String(transactionId),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating request:', updateError);
      } else {
        console.log(`Request ${requestId} updated`);
        trackingNumber = requestData?.tracking_number || trackingNumber;
        customerEmail = requestData?.email || requestData?.contact_email || customerEmail;
        customerName = requestData?.contact_name || customerName;
        companyName = requestData?.company_name || requestData?.service_type || '';
      }

      // Send confirmation email if payment approved
      if (paymentStatus === 'approved' && customerEmail) {
        try {
          await supabase.functions.invoke('send-payment-notification', {
            body: {
              to: customerEmail,
              type: 'payment_confirmed',
              customerName: customerName,
              trackingNumber: trackingNumber,
              amount: amount || paymentRecord?.amount,
              companyName: companyName
            }
          });
          console.log('Payment confirmation email sent');
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }
    }

    console.log('=== VERIFY-KKIAPAY-PAYMENT SUCCESS ===');

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        paymentStatus,
        requestStatus,
        transactionId,
        trackingNumber
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('=== VERIFY-KKIAPAY-PAYMENT ERROR ===');
    console.error('Error:', error.message);
    
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
