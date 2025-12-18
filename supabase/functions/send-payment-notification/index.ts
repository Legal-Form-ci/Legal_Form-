import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  to: string;
  subject: string;
  html: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { to, subject, html }: NotificationRequest = await req.json();

    console.log(`Sending email notification to: ${to}`);

    // For now, just log the email (later can integrate with Resend or other email service)
    console.log(`Email would be sent:
      To: ${to}
      Subject: ${subject}
      HTML: ${html}
    `);

    // TODO: Integrate with actual email service like Resend
    // For production, you would uncomment and configure:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // const { error } = await resend.emails.send({
    //   from: 'LegalForm <notifications@legalform.ci>',
    //   to: [to],
    //   subject: subject,
    //   html: html,
    // });

    return new Response(
      JSON.stringify({ success: true, message: 'Notification logged (email integration pending)' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in send-payment-notification function:', error);
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
