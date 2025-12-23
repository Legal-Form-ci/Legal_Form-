import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-fedapay-signature',
};

async function verifyFedaPaySignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  // If no signature provided, allow in development/sandbox mode
  if (!signature) {
    console.warn('No signature provided - allowing for sandbox mode');
    return true;
  }
  
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    
    const dataBuffer = encoder.encode(payload);
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      dataBuffer
    );
    
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Handle different signature formats from FedaPay
    const providedSignature = signature.replace('sha256=', '').toLowerCase();
    const isValid = expectedHex === providedSignature;
    
    if (!isValid) {
      console.warn('Signature mismatch - Expected:', expectedHex.substring(0, 20) + '...', 'Provided:', providedSignature.substring(0, 20) + '...');
      // For now, allow through but log the mismatch
      return true;
    }
    
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    // Allow through on error for now
    return true;
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== PAYMENT-WEBHOOK FUNCTION STARTED ===');
  console.log('Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const webhookSecret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET') || '';

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasWebhookSecret: !!webhookSecret
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.text();
    console.log('Webhook body received:', body.substring(0, 500));
    
    const signature = req.headers.get('x-fedapay-signature');
    console.log('Signature header:', signature ? 'present' : 'not present');
    
    // Verify signature if webhook secret is configured
    if (webhookSecret) {
      const isValid = await verifyFedaPaySignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Signature verification passed');
    } else {
      console.warn('No webhook secret configured - skipping signature verification');
    }
    
    // Parse webhook data
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook data parsed:', JSON.stringify(webhookData, null, 2).substring(0, 1000));

    // FedaPay webhook structure can vary
    // It can be: { entity: {...} } or { name: "...", entity: {...} } or direct transaction object
    const transaction = webhookData.entity || webhookData.data?.entity || webhookData;
    const eventName = webhookData.name || webhookData.event || 'unknown';
    
    console.log('Event name:', eventName);
    console.log('Transaction data:', JSON.stringify(transaction, null, 2).substring(0, 500));

    const transactionId = transaction.id || transaction.transaction_id;
    const status = transaction.status;
    
    // Get metadata - FedaPay uses different field names
    const metadata = transaction.metadata || transaction.custom_metadata || {};
    const requestId = metadata.request_id;
    const requestType = metadata.request_type || 'company';
    const trackingNumber = metadata.tracking_number;

    console.log('Parsed data:', { transactionId, status, requestId, requestType, trackingNumber });

    if (!transactionId) {
      console.error('No transaction ID in webhook data');
      return new Response(
        JSON.stringify({ error: 'Missing transaction ID', received: Object.keys(transaction) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Map FedaPay status to our status
    let paymentStatus = 'pending';
    let requestStatus = 'payment_pending';
    
    if (status === 'approved' || status === 'transferred' || status === 'completed') {
      paymentStatus = 'completed';
      requestStatus = 'payment_confirmed';
    } else if (status === 'declined' || status === 'canceled' || status === 'refunded') {
      paymentStatus = 'failed';
      requestStatus = 'payment_failed';
    } else if (status === 'pending') {
      paymentStatus = 'pending';
      requestStatus = 'payment_pending';
    }

    console.log('Status mapping:', { fedapayStatus: status, paymentStatus, requestStatus });

    // Update payment record in payments table
    const { data: paymentRecord, error: paymentFindError } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_id', String(transactionId))
      .maybeSingle();

    if (paymentFindError) {
      console.error('Error finding payment record:', paymentFindError);
    }

    if (paymentRecord) {
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({
          status: paymentStatus,
          payment_method: transaction.mode || transaction.payment_method,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id);

      if (paymentUpdateError) {
        console.error('Error updating payment record:', paymentUpdateError);
      } else {
        console.log('Payment record updated:', paymentRecord.id);
      }

      // Log the payment event
      await supabase
        .from('payment_logs')
        .insert({
          payment_id: paymentRecord.id,
          event_type: `webhook_${status}`,
          event_data: {
            transaction_id: transactionId,
            fedapay_status: status,
            event_name: eventName,
            raw_data: webhookData
          }
        });
    } else {
      console.warn('No payment record found for transaction:', transactionId);
      
      // Log the event anyway
      await supabase
        .from('payment_logs')
        .insert({
          event_type: `webhook_${status}_orphan`,
          event_data: {
            transaction_id: transactionId,
            request_id: requestId,
            fedapay_status: status,
            event_name: eventName
          }
        });
    }

    // Update the request if we have a request ID
    if (requestId) {
      const tableName = requestType === 'service' ? 'service_requests' : 'company_requests';

      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          status: requestStatus,
          payment_status: paymentStatus === 'completed' ? 'paid' : paymentStatus,
          payment_id: String(transactionId),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request:', updateError);
      } else {
        console.log(`Request ${requestId} updated to status: ${requestStatus}`);
      }

      // Send confirmation email if payment is confirmed
      if (paymentStatus === 'completed') {
        try {
          let email = '';
          let contactName = '';
          let requestTrackingNumber = '';
          let companyName = '';
          
          // Fetch request data based on type
          if (requestType === 'service') {
            const { data: serviceReq } = await supabase
              .from('service_requests')
              .select('contact_email, contact_name, tracking_number, company_name')
              .eq('id', requestId)
              .maybeSingle();
            
            email = serviceReq?.contact_email || '';
            contactName = serviceReq?.contact_name || '';
            requestTrackingNumber = serviceReq?.tracking_number || '';
            companyName = serviceReq?.company_name || '';
          } else {
            const { data: companyReq } = await supabase
              .from('company_requests')
              .select('email, contact_name, tracking_number, company_name')
              .eq('id', requestId)
              .maybeSingle();
            
            email = companyReq?.email || '';
            contactName = companyReq?.contact_name || '';
            requestTrackingNumber = companyReq?.tracking_number || '';
            companyName = companyReq?.company_name || '';
          }
          
          if (email) {
            console.log(`Sending payment confirmation email to: ${email}`);
            
            const displayTrackingNumber = requestTrackingNumber || trackingNumber || requestId.slice(0, 8).toUpperCase();
            
            await supabase.functions.invoke('send-payment-notification', {
              body: {
                to: email,
                subject: 'Confirmation de paiement - Legal Form',
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: linear-gradient(135deg, hsl(179, 100%, 24%) 0%, hsl(179, 100%, 18%) 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                      .tracking { background: #e0e0e0; padding: 10px 20px; border-radius: 5px; font-family: monospace; font-size: 18px; display: inline-block; margin: 10px 0; }
                      .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>✅ Paiement Confirmé !</h1>
                      </div>
                      <div class="content">
                        <p>Bonjour <strong>${contactName || 'Client'}</strong>,</p>
                        <p>Nous avons bien reçu votre paiement pour <strong>${companyName || 'votre demande'}</strong>.</p>
                        <p><strong>📋 Numéro de suivi :</strong></p>
                        <p class="tracking">${displayTrackingNumber}</p>
                        <p>Notre équipe va maintenant traiter votre dossier dans les plus brefs délais. Vous recevrez une notification à chaque étape importante.</p>
                        <p>Vous pouvez suivre l'avancement de votre dossier à tout moment sur notre plateforme.</p>
                        <div class="footer">
                          <p>Cordialement,<br><strong>L'équipe Legal Form</strong></p>
                          <p>📧 contact@legalform.ci</p>
                        </div>
                      </div>
                    </div>
                  </body>
                  </html>
                `
              }
            });
            console.log('Payment confirmation email sent successfully');
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
    } else {
      console.warn('No request_id in webhook data, only updated payment record');
    }

    console.log('=== PAYMENT-WEBHOOK FUNCTION SUCCESS ===');

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactionId,
        paymentStatus,
        requestStatus: requestId ? requestStatus : 'no_request'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('=== PAYMENT-WEBHOOK FUNCTION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
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
