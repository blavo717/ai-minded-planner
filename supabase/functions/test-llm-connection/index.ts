
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

    // Probar la conexión con OpenRouter
    const testResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || '',
        'X-Title': 'AI Task Manager'
      },
      body: JSON.stringify({
        model: config.model_name,
        messages: [
          { role: 'user', content: 'Hello! This is a connection test.' }
        ],
        max_tokens: 50,
        temperature: config.temperature,
        top_p: config.top_p,
        frequency_penalty: config.frequency_penalty,
        presence_penalty: config.presence_penalty
      })
    })

    if (!testResponse.ok) {
      const errorData = await testResponse.text()
      console.error('OpenRouter API error:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        error: errorData
      })
      
      let errorMessage = 'Failed to connect to OpenRouter'
      if (testResponse.status === 401) {
        errorMessage = 'Invalid API key'
      } else if (testResponse.status === 404) {
        errorMessage = `Model '${config.model_name}' not found`
      } else if (testResponse.status === 429) {
        errorMessage = 'Rate limit exceeded'
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorData,
          status: testResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await testResponse.json()
    const responseContent = data.choices?.[0]?.message?.content || 'No response content'

    console.log('Connection test successful:', {
      model: config.model_name,
      response_length: responseContent.length,
      usage: data.usage
    })

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
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
