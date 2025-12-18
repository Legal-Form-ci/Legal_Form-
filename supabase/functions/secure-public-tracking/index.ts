import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_WINDOW_MINUTES = 60;
const MAX_ATTEMPTS_PER_WINDOW = 10;
const BLOCK_DURATION_MINUTES = 30;

async function checkRateLimit(supabase: any, ipAddress: string, phone: string): Promise<{ allowed: boolean; blockedUntil?: Date }> {
  const now = new Date();
  
  // Get or create rate limit record
  const { data: rateLimit, error } = await supabase
    .from('public_tracking_rate_limit')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error;
  }

  // If blocked, check if block has expired
  if (rateLimit?.blocked_until) {
    const blockedUntil = new Date(rateLimit.blocked_until);
    if (now < blockedUntil) {
      return { allowed: false, blockedUntil };
    }
  }

  // If no record or window expired, create/reset
  if (!rateLimit || (now.getTime() - new Date(rateLimit.first_attempt_at).getTime()) > RATE_LIMIT_WINDOW_MINUTES * 60 * 1000) {
    await supabase
      .from('public_tracking_rate_limit')
      .upsert({
        ip_address: ipAddress,
        phone: phone,
        attempt_count: 1,
        first_attempt_at: now.toISOString(),
        last_attempt_at: now.toISOString(),
        blocked_until: null
      }, { onConflict: 'ip_address,phone' });
    
    return { allowed: true };
  }

  // Increment attempt count
  const newAttemptCount = rateLimit.attempt_count + 1;
  
  if (newAttemptCount > MAX_ATTEMPTS_PER_WINDOW) {
    // Block the IP for this phone number
    const blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000);
    
    await supabase
      .from('public_tracking_rate_limit')
      .update({
        attempt_count: newAttemptCount,
        last_attempt_at: now.toISOString(),
        blocked_until: blockedUntil.toISOString()
      })
      .eq('ip_address', ipAddress)
      .eq('phone', phone);
    
    return { allowed: false, blockedUntil };
  }

  // Update attempt count
  await supabase
    .from('public_tracking_rate_limit')
    .update({
      attempt_count: newAttemptCount,
      last_attempt_at: now.toISOString()
    })
    .eq('ip_address', ipAddress)
    .eq('phone', phone);

  return { allowed: true };
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string' || phone.length < 8 || phone.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const ipAddress = getClientIP(req);
    console.log(`Tracking request from IP: ${ipAddress} for phone: ${phone}`);

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(supabase, ipAddress, phone);
    
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          blockedUntil: rateLimitCheck.blockedUntil?.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Get tracking entries
    const { data: trackingData, error: trackingError } = await supabase
      .from('public_tracking')
      .select('request_id, request_type')
      .eq('phone', phone);

    if (trackingError) throw trackingError;

    if (!trackingData || trackingData.length === 0) {
      return new Response(
        JSON.stringify({ requests: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const allRequests = [];

    // Fetch company requests
    const companyIds = trackingData
      .filter(t => t.request_type === 'company')
      .map(t => t.request_id);

    if (companyIds.length > 0) {
      const { data: companyData } = await supabase
        .from('company_requests')
        .select('id, tracking_number, status, created_at, company_name, contact_name')
        .in('id', companyIds);

      if (companyData) {
        allRequests.push(...companyData.map(r => ({ ...r, type: 'company' })));
      }
    }

    // Fetch service requests
    const serviceIds = trackingData
      .filter(t => t.request_type === 'service')
      .map(t => t.request_id);

    if (serviceIds.length > 0) {
      const { data: serviceData } = await supabase
        .from('service_requests')
        .select('id, tracking_number, status, created_at, service_type, contact_name')
        .in('id', serviceIds);

      if (serviceData) {
        allRequests.push(...serviceData.map(r => ({ ...r, type: 'service' })));
      }
    }

    return new Response(
      JSON.stringify({ requests: allRequests }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in secure-public-tracking function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);
