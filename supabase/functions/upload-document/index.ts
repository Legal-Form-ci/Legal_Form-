import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const companyRequestId = formData.get('companyRequestId') as string
    const associateId = formData.get('associateId') as string | null
    const documentType = formData.get('documentType') as string
    const associateName = formData.get('associateName') as string
    const isManager = formData.get('isManager') === 'true'

    if (!file || !companyRequestId || !documentType || !associateName) {
      throw new Error('Missing required fields')
    }

    console.log('Upload request for company request:', companyRequestId)

    // SECURITY: Verify user owns this request or is admin
    const { data: request, error: requestError } = await supabase
      .from('company_requests')
      .select('user_id')
      .eq('id', companyRequestId)
      .single()

    if (requestError) {
      console.error('Error fetching request:', requestError)
      throw new Error('Request not found')
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    const isAdmin = !!roleData
    const isOwner = request?.user_id === user.id

    if (!isOwner && !isAdmin) {
      console.error('Unauthorized upload attempt by user:', user.id)
      throw new Error('Unauthorized - You can only upload to your own requests')
    }

    console.log('Authorization verified, proceeding with upload')

    console.log('Uploading document:', { 
      documentType, 
      associateName, 
      isManager, 
      companyRequestId,
      originalName: file.name 
    })

    // Generate appropriate filename based on role
    const rolePrefix = isManager ? 'Gerant' : 'Associe'
    const extension = file.name.split('.').pop()
    const sanitizedName = associateName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
    
    // Document type mapping
    const typeMapping: Record<string, string> = {
      'id_document': 'CNI',
      'birth_certificate': 'ExtraitNaissance',
      'criminal_record': 'CasierJudiciaire'
    }
    
    const docTypePrefix = typeMapping[documentType] || documentType
    const fileName = `${docTypePrefix}_${rolePrefix}_${sanitizedName}.${extension}`
    const filePath = `${companyRequestId}/${fileName}`

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('company-documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Save document reference in database
    const { error: dbError } = await supabase
      .from('company_documents')
      .insert({
        company_request_id: companyRequestId,
        associate_id: associateId,
        document_type: documentType,
        file_name: fileName,
        file_path: filePath,
        uploaded_by: user.id,
        original_name: file.name
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    console.log('Document uploaded successfully:', filePath)

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileName,
        filePath 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Upload document error:', error)
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