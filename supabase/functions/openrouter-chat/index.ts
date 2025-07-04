
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 OpenRouter chat function called')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      console.error('❌ Unauthorized request')
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Authenticated user: ${user.id}`)

    const requestBody = await req.json()
    const { messages, function_name, temperature, max_tokens } = requestBody

    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages format')
      return new Response(
        JSON.stringify({ success: false, error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📨 Processing ${messages.length} messages for function: ${function_name}`)

    // Obtener configuración activa del usuario
    const { data: config, error: configError } = await supabaseClient
      .from('llm_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (configError || !config) {
      console.error('❌ No active LLM configuration found:', configError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No active LLM configuration found. Please configure your LLM settings first.' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`⚙️ Using LLM config: ${config.model_name}`)

    // Obtener API key desde los secrets de Supabase
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    
    if (!apiKey) {
      console.error('❌ OpenRouter API key not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenRouter API key not configured in server' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔑 API key found, making request to OpenRouter...')

    // Hacer la llamada a OpenRouter con parámetros correctos
    const requestPayload = {
      model: config.model_name,
      messages: messages,
      max_tokens: max_tokens || config.max_tokens,
      temperature: temperature !== undefined ? temperature : config.temperature,
      top_p: config.top_p,
      frequency_penalty: config.frequency_penalty,
      presence_penalty: config.presence_penalty
    }

    console.log('📡 Request payload:', JSON.stringify(requestPayload, null, 2))

    const startTime = Date.now()
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || '',
        'X-Title': 'AI Task Manager'
      },
      body: JSON.stringify(requestPayload)
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      
      let userFriendlyError = 'Failed to get response from AI service'
      
      if (response.status === 401) {
        userFriendlyError = 'Invalid API key. Please check your OpenRouter configuration.'
      } else if (response.status === 429) {
        userFriendlyError = 'Rate limit exceeded. Please try again later.'
      } else if (response.status === 404) {
        userFriendlyError = 'Model not found. Please check your model configuration.'
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: userFriendlyError,
          details: errorText,
          status: response.status
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('✅ OpenRouter response received:', {
      model: data.model,
      usage: data.usage,
      responseLength: data.choices?.[0]?.message?.content?.length || 0,
      responseTime: `${responseTime}ms`
    })

    // Verificar que tenemos una respuesta válida
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from OpenRouter:', data)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid response from AI service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const responseContent = data.choices[0].message.content

    // Log usage para analytics
    console.log('📊 OpenRouter API call completed:', {
      model: config.model_name,
      user_id: user.id,
      usage: data.usage,
      function_name: function_name,
      response_time: responseTime
    })

    // CORREGIDO: Retornar respuesta completa con metadata estructurada
    const completeResponse = {
      success: true,
      response: responseContent,
      model_used: data.model || config.model_name,
      tokens_used: data.usage?.total_tokens || 0,
      prompt_tokens: data.usage?.prompt_tokens || 0,
      completion_tokens: data.usage?.completion_tokens || 0,
      response_time: responseTime,
      usage: data.usage || {}
    }

    console.log('✅ Respuesta completa enviada:', {
      success: completeResponse.success,
      model_used: completeResponse.model_used,
      tokens_used: completeResponse.tokens_used,
      response_time: completeResponse.response_time
    })

    return new Response(
      JSON.stringify(completeResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Critical error in openrouter-chat:', error)
    
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
