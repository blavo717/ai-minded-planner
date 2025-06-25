
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { configId } = await req.json()

    if (!configId) {
      return new Response(
        JSON.stringify({ error: 'Missing configId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener configuración del usuario
    const { data: config, error: configError } = await supabaseClient
      .from('llm_configurations')
      .select('*')
      .eq('id', configId)
      .eq('user_id', user.id)
      .single()

    if (configError || !config) {
      console.error('Configuration error:', configError)
      return new Response(
        JSON.stringify({ error: 'Configuration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener API key desde los secrets de Supabase
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API key not configured',
          details: 'Please configure OPENROUTER_API_KEY in Supabase Edge Functions secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Testing connection for model: ${config.model_name}`)
    console.log(`Configuration details:`, {
      model: config.model_name,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      top_p: config.top_p
    })

    // Verificar si el modelo es compatible con OpenRouter
    const isGeminiModel = config.model_name.includes('gemini')
    
    if (isGeminiModel) {
      console.log('Detected Gemini model, checking format...')
      
      // Para modelos Gemini, verificar que el ID sea correcto
      if (!config.model_name.startsWith('google/')) {
        console.error('Invalid Gemini model format:', config.model_name)
        return new Response(
          JSON.stringify({ 
            error: 'Formato de modelo Gemini inválido',
            details: `El modelo '${config.model_name}' debe empezar con 'google/' (ej: 'google/gemini-flash-1.5')`,
            suggestion: 'Verifica el nombre del modelo en la lista de OpenRouter'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Probar la conexión con OpenRouter
    const requestBody = {
      model: config.model_name,
      messages: [
        { role: 'user', content: 'Hello! This is a connection test. Please respond briefly.' }
      ],
      max_tokens: Math.min(config.max_tokens, 100), // Limitar tokens para test
      temperature: config.temperature,
      top_p: config.top_p,
      frequency_penalty: config.frequency_penalty,
      presence_penalty: config.presence_penalty
    }

    console.log('Sending request to OpenRouter:', {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: config.model_name,
      max_tokens: requestBody.max_tokens
    })

    const testResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || '',
        'X-Title': 'AI Task Manager'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('OpenRouter response status:', testResponse.status)
    console.log('OpenRouter response headers:', Object.fromEntries(testResponse.headers.entries()))

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error('OpenRouter API error:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        body: errorText
      })
      
      let errorMessage = 'Failed to connect to OpenRouter'
      let errorDetails = errorText
      
      try {
        const errorData = JSON.parse(errorText)
        errorDetails = errorData.error?.message || errorData.message || errorText
      } catch (e) {
        // Si no es JSON válido, usar el texto crudo
      }
      
      if (testResponse.status === 401) {
        errorMessage = 'Invalid API key'
        errorDetails = 'Tu API key de OpenRouter no es válida o ha expirado'
      } else if (testResponse.status === 404) {
        errorMessage = `Model '${config.model_name}' not found`
        errorDetails = `El modelo '${config.model_name}' no está disponible en OpenRouter. Verifica que el nombre sea correcto.`
      } else if (testResponse.status === 429) {
        errorMessage = 'Rate limit exceeded'
        errorDetails = 'Has excedido el límite de solicitudes. Espera un momento antes de volver a intentar.'
      } else if (testResponse.status === 400) {
        errorMessage = 'Bad request'
        if (errorDetails.includes('model')) {
          errorDetails = `Error con el modelo '${config.model_name}': ${errorDetails}`
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorDetails,
          status: testResponse.status,
          model_tested: config.model_name
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await testResponse.json()
    console.log('Successful response from OpenRouter:', {
      model: config.model_name,
      choices: data.choices?.length || 0,
      usage: data.usage
    })

    const responseContent = data.choices?.[0]?.message?.content || 'No response content'

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Connection test successful',
        model: config.model_name,
        response: responseContent,
        usage: data.usage
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in test-llm-connection:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
