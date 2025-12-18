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
  if (!signature) {
    console.error('No signature provided');
    return false;
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
    
    const providedSignature = signature.toLowerCase();
    const isValid = expectedHex === providedSignature;
    
    if (!isValid) {
      console.error('Signature mismatch');
      console.error('Expected:', expectedHex);
      console.error('Provided:', providedSignature);
    }
    
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET')!;

    if (!webhookSecret) {
      console.error('FEDAPAY_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.text();
    const signature = req.headers.get('x-fedapay-signature');
    
    console.log('Received webhook, verifying signature...');
    
    const isValid = await verifyFedaPaySignature(body, signature, webhookSecret);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Signature verified successfully');
    
    const webhookData = JSON.parse(body);
    const transaction = webhookData.entity || webhookData;
    const transactionId = transaction.id;
    const status = transaction.status;
    const requestId = transaction.custom_metadata?.request_id;
    const requestType = transaction.custom_metadata?.request_type || 'company';

    console.log(`Transaction ${transactionId} status: ${status}`);

    if (!requestId) {
      console.error('No request_id in webhook data');
      return new Response(
        JSON.stringify({ error: 'Missing request_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let newStatus = 'pending';
    if (status === 'approved' || status === 'transferred') {
      newStatus = 'payment_confirmed';
    } else if (status === 'declined' || status === 'canceled') {
      newStatus = 'payment_failed';
    }

    const tableName = requestType === 'service' ? 'service_requests' : 'company_requests';

    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        status: newStatus,
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
      throw updateError;
    }

    console.log(`Request ${requestId} updated to status: ${newStatus}`);

    if (newStatus === 'payment_confirmed') {
      const { data: request } = await supabase
        .from(tableName)
        .select('email, contact_name, tracking_number')
        .eq('id', requestId)
        .single();

      if (request) {
        console.log(`Sending payment confirmation email to: ${request.email}`);
        
        try {
          await supabase.functions.invoke('send-payment-notification', {
            body: {
              to: request.email,
              subject: 'Confirmation de paiement - LegalForm',
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>✅ Paiement Confirmé !</h1>
                    </div>
                    <div class="content">
                      <p>Bonjour <strong>${request.contact_name}</strong>,</p>
                      <p>Nous avons bien reçu votre paiement et sommes ravis de vous accompagner dans votre projet.</p>
                      <p><strong>📋 Numéro de suivi :</strong> <code style="background: #e0e0e0; padding: 5px 10px; border-radius: 3px;">${request.tracking_number || requestId}</code></p>
                      <p>Notre équipe va maintenant traiter votre dossier dans les plus brefs délais. Vous recevrez une notification à chaque étape importante.</p>
                      <p>Vous pouvez suivre l'avancement de votre dossier à tout moment sur notre plateforme.</p>
                      <div class="footer">
                        <p>Cordialement,<br><strong>L'équipe LegalForm</strong></p>
                        <p>📧 contact@legalform.ci | 📱 +225 XX XX XX XX XX</p>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
              `
            }
          });
          console.log('Payment confirmation email sent successfully');
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in payment-webhook function:', error);
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
