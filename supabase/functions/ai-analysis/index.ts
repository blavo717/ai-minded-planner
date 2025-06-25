
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

    // Obtener configuración LLM activa del usuario
    const { data: llmConfig, error: configError } = await supabaseClient
      .from('llm_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (configError || !llmConfig) {
      console.log('No active LLM configuration found, using basic analysis')
      return await performBasicAnalysis(supabaseClient, user.id)
    }

    // Usar configuración LLM personalizada del usuario
    return await performAIAnalysis(supabaseClient, user.id, llmConfig)

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function performBasicAnalysis(supabaseClient: any, userId: string) {
  // Obtener datos del usuario para análisis
  const { data: tasks } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: patterns } = await supabaseClient
    .from('user_patterns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const insights = []

  // Análisis básico sin IA
  if (tasks && tasks.length > 0) {
    const pendingTasks = tasks.filter(t => t.status === 'pending')
    const completedTasks = tasks.filter(t => t.status === 'completed')
    
    if (pendingTasks.length > completedTasks.length * 2) {
      insights.push({
        insight_type: 'task_suggestion',
        title: 'Muchas tareas pendientes',
        description: `Tienes ${pendingTasks.length} tareas pendientes vs ${completedTasks.length} completadas. Considera priorizar las más importantes.`,
        insight_data: {
          pending_count: pendingTasks.length,
          completed_count: completedTasks.length,
          suggestion: 'focus_on_priorities'
        },
        priority: 2
      })
    }
  }

  // Guardar insights básicos
  if (insights.length > 0) {
    const insightsToInsert = insights.map(insight => ({
      user_id: userId,
      ...insight
    }))

    await supabaseClient
      .from('ai_insights')
      .insert(insightsToInsert)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      insights_generated: insights.length,
      insights: insights,
      analysis_type: 'basic'
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function performAIAnalysis(supabaseClient: any, userId: string, llmConfig: any) {
  // Obtener datos del usuario
  const { data: tasks } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: patterns } = await supabaseClient
    .from('user_patterns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: sessions } = await supabaseClient
    .from('task_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  // Preparar datos para análisis IA
  const analysisData = {
    tasks: tasks || [],
    patterns: patterns || [],
    sessions: sessions || [],
    summary: {
      total_tasks: tasks?.length || 0,
      pending_tasks: tasks?.filter(t => t.status === 'pending').length || 0,
      completed_tasks: tasks?.filter(t => t.status === 'completed').length || 0,
      total_patterns: patterns?.length || 0,
      recent_sessions: sessions?.length || 0
    }
  }

  // Llamar a OpenRouter con configuración personalizada
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  
  if (!apiKey) {
    return await performBasicAnalysis(supabaseClient, userId)
  }

  const systemPrompt = `Eres un asistente de productividad experto. Analiza los datos del usuario y genera insights útiles y accionables sobre su productividad y patrones de trabajo. 

Enfócate en:
1. Patrones de productividad y áreas de mejora
2. Sugerencias específicas y accionables
3. Identificación de tendencias en el trabajo
4. Recomendaciones personalizadas

Responde en formato JSON con un array de insights, cada uno con:
- insight_type: tipo de insight
- title: título conciso
- description: descripción detallada
- insight_data: datos específicos del insight
- priority: prioridad del 1 al 3

Los datos del usuario incluyen tareas, patrones de uso y sesiones de trabajo.`

  const userPrompt = `Analiza estos datos de productividad del usuario:

${JSON.stringify(analysisData, null, 2)}

Genera 3-5 insights útiles y específicos basados en estos datos.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || '',
        'X-Title': 'AI Task Manager - Analysis'
      },
      body: JSON.stringify({
        model: llmConfig.model_name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: llmConfig.max_tokens,
        temperature: llmConfig.temperature,
        top_p: llmConfig.top_p,
        frequency_penalty: llmConfig.frequency_penalty,
        presence_penalty: llmConfig.presence_penalty
      })
    })

    if (!response.ok) {
      console.error('OpenRouter API error:', await response.text())
      return await performBasicAnalysis(supabaseClient, userId)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      return await performBasicAnalysis(supabaseClient, userId)
    }

    // Parsear respuesta de IA
    let insights = []
    try {
      const parsed = JSON.parse(aiResponse)
      insights = Array.isArray(parsed) ? parsed : [parsed]
    } catch (e) {
      console.error('Error parsing AI response:', e)
      return await performBasicAnalysis(supabaseClient, userId)
    }

    // Guardar insights generados por IA
    if (insights.length > 0) {
      const insightsToInsert = insights.map(insight => ({
        user_id: userId,
        ...insight
      }))

      await supabaseClient
        .from('ai_insights')
        .insert(insightsToInsert)
    }

    // Log de uso de API
    await logAPIUsage(supabaseClient, userId, llmConfig.model_name, data.usage, 'ai-analysis')

    console.log('AI Analysis completed:', {
      user_id: userId,
      model: llmConfig.model_name,
      insights_generated: insights.length,
      usage: data.usage
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights_generated: insights.length,
        insights: insights,
        analysis_type: 'ai',
        model_used: llmConfig.model_name
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('AI analysis error:', error)
    return await performBasicAnalysis(supabaseClient, userId)
  }
}

async function logAPIUsage(supabaseClient: any, userId: string, model: string, usage: any, functionName: string) {
  try {
    const usageData = {
      user_id: userId,
      model_name: model,
      function_name: functionName,
      prompt_tokens: usage?.prompt_tokens || 0,
      completion_tokens: usage?.completion_tokens || 0,
      total_tokens: usage?.total_tokens || 0,
      timestamp: new Date().toISOString()
    }

    // Por ahora guardamos en ai_insights con tipo especial para logging
    await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: userId,
        insight_type: 'api_usage_log',
        title: `API Usage - ${functionName}`,
        description: `Used ${model} for ${functionName}`,
        insight_data: usageData,
        priority: 1
      })
  } catch (error) {
    console.error('Error logging API usage:', error)
  }
}
