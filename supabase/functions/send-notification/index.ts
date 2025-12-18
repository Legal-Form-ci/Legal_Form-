import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  requestId: string;
  type: 'status_change' | 'new_request' | 'payment_received';
  newStatus?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify user is admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    const { requestId, type, newStatus }: NotificationRequest = await req.json()
    
    console.log('Processing notification:', { requestId, type, newStatus })

    // Fetch request details
    const { data: request, error: requestError } = await supabase
      .from('company_requests')
      .select('*, profiles!inner(*)')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      throw new Error('Request not found')
    }

    const clientEmail = request.email
    const clientPhone = request.phone
    const clientName = request.contact_name
    const trackingNumber = request.tracking_number

    let emailSubject = ''
    let emailHtml = ''
    let smsMessage = ''

    // Prepare messages based on type
    if (type === 'status_change' && newStatus) {
      const statusMessages: Record<string, { subject: string; message: string }> = {
        'en_cours': {
          subject: 'Dossier en cours de traitement',
          message: 'Votre dossier est maintenant en cours de traitement. Notre équipe travaille activement dessus.'
        },
        'documents_requis': {
          subject: 'Documents supplémentaires requis',
          message: 'Nous avons besoin de documents supplémentaires pour traiter votre dossier. Veuillez vérifier votre espace client.'
        },
        'en_attente_paiement': {
          subject: 'En attente de paiement',
          message: 'Votre dossier est prêt. Veuillez effectuer le paiement pour finaliser la création de votre entreprise.'
        },
        'complete': {
          subject: '🎉 Votre entreprise est créée !',
          message: 'Félicitations ! Votre entreprise a été créée avec succès. Tous vos documents sont disponibles dans votre espace client.'
        }
      }

      const statusInfo = statusMessages[newStatus] || {
        subject: 'Mise à jour de votre dossier',
        message: 'Le statut de votre dossier a été mis à jour.'
      }

      emailSubject = `LegalForm - ${statusInfo.subject}`
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #118091 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Legal Form</h1>
            <p style="color: white; margin: 10px 0 0 0;">Formaliser votre business est notre raison d'être</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #17a2b8;">Bonjour ${clientName},</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              ${statusInfo.message}
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Numéro de suivi:</strong> ${trackingNumber}</p>
              <p style="margin: 5px 0;"><strong>Nouveau statut:</strong> ${statusInfo.subject}</p>
            </div>
            <p style="margin-top: 30px;">
              <a href="${supabaseUrl.replace('.supabase.co', '')}/client/dashboard" 
                 style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accéder à mon espace client
              </a>
            </p>
            <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
              Pour toute question, contactez-nous:<br>
              📧 entreprise@legalform.ci<br>
              📱 +225 07 09 67 79 25
            </p>
          </div>
        </div>
      `
      smsMessage = `LegalForm: ${statusInfo.subject}. Dossier ${trackingNumber}. ${statusInfo.message} Consultez votre espace: legalform.ci`
    }

    // Send email if Resend is configured
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'LegalForm <entreprise@legalform.ci>',
            to: [clientEmail],
            subject: emailSubject,
            html: emailHtml,
          }),
        })
        
        if (!emailResponse.ok) {
          throw new Error(`Email API error: ${emailResponse.status}`)
        }
        
        console.log('Email sent successfully to:', clientEmail)
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
      }
    } else {
      console.log('Resend API key not configured, skipping email')
    }

    // TODO: Integrate SMS provider (Orange Money SMS API or similar)
    console.log('SMS would be sent to:', clientPhone, 'Message:', smsMessage)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent',
        emailSent: !!resendApiKey,
        smsSent: false // Will be true once SMS provider is integrated
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Notification error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})