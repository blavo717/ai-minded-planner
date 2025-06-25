
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

    const { pattern_type, pattern_data } = await req.json()

    // Validar datos del patrón
    if (!pattern_type || !pattern_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Guardar patrón en la base de datos
    const { error } = await supabaseClient
      .from('user_patterns')
      .insert({
        user_id: user.id,
        pattern_type,
        pattern_data,
        confidence_score: 0.7,
      })

    if (error) throw error

    // Obtener configuración LLM activa
    const { data: llmConfig } = await supabaseClient
      .from('llm_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    // Analizar patrones con IA o lógica básica
    let insights = []
    
    if (llmConfig) {
      insights = await generateAIInsights(supabaseClient, user.id, pattern_type, pattern_data, llmConfig)
    } else {
      insights = await generateBasicInsights(supabaseClient, user.id, pattern_type, pattern_data)
    }

    // Crear insights si se detectaron patrones
    if (insights.length > 0) {
      const insightsToInsert = insights.map(insight => ({
        user_id: user.id,
        ...insight
      }))

      await supabaseClient
        .from('ai_insights')
        .insert(insightsToInsert)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        patterns_analyzed: insights.length,
        insights_generated: insights.length,
        analysis_type: llmConfig ? 'ai' : 'basic'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

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

async function generateBasicInsights(supabaseClient: any, userId: string, patternType: string, patternData: any) {
  // Obtener patrones similares
  const { data: patterns } = await supabaseClient
    .from('user_patterns')
    .select('*')
    .eq('user_id', userId)
    .eq('pattern_type', patternType)
    .order('created_at', { ascending: false })
    .limit(10)

  const insights = []

  if (patterns && patterns.length >= 3) {
    if (patternType === 'task_completion') {
      const durations = patterns.map(p => p.pattern_data.duration_minutes).filter(d => d > 0)
      if (durations.length >= 3) {
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
        const recentDuration = durations[0]
        
        if (recentDuration > avgDuration * 1.5) {
          insights.push({
            insight_type: 'productivity_trend',
            title: 'Tiempo de tarea más largo de lo usual',
            description: `Esta tarea te tomó ${Math.round(recentDuration)} minutos, un 50% más que tu promedio de ${Math.round(avgDuration)} minutos.`,
            insight_data: {
              pattern_type: patternType,
              average_duration: avgDuration,
              recent_duration: recentDuration,
              improvement_suggestion: 'Considera dividir tareas largas en subtareas más pequeñas.'
            },
            priority: 2
          })
        }
      }
    }

    if (patternType === 'work_session') {
      const productivityScores = patterns.map(p => p.pattern_data.productivity_score).filter(s => s > 0)
      if (productivityScores.length >= 3) {
        const avgScore = productivityScores.reduce((a, b) => a + b, 0) / productivityScores.length
        
        if (avgScore >= 4) {
          insights.push({
            insight_type: 'productivity_trend',
            title: '¡Excelente productividad!',
            description: `Tu puntuación promedio de productividad es ${avgScore.toFixed(1)}/5. ¡Sigue así!`,
            insight_data: {
              pattern_type: patternType,
              average_score: avgScore,
              trend: 'positive'
            },
            priority: 3
          })
        }
      }
    }
  }

  return insights
}

async function generateAIInsights(supabaseClient: any, userId: string, patternType: string, patternData: any, llmConfig: any) {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  
  if (!apiKey) {
    return await generateBasicInsights(supabaseClient, userId, patternType, patternData)
  }

  // Obtener contexto de patrones históricos
  const { data: historicalPatterns } = await supabaseClient
    .from('user_patterns')
    .select('*')
    .eq('user_id', userId)
    .eq('pattern_type', patternType)
    .order('created_at', { ascending: false })
    .limit(15)

  const systemPrompt = `Eres un experto en análisis de productividad. Analiza el nuevo patrón de comportamiento del usuario junto con su historial para generar insights útiles y específicos.

Enfócate en:
1. Detectar tendencias y cambios en el comportamiento
2. Identificar oportunidades de mejora específicas
3. Generar recomendaciones accionables
4. Mantener un tono positivo y motivador

Responde en formato JSON con un array de insights (máximo 2), cada uno con:
- insight_type: tipo de insight
- title: título motivador y específico
- description: descripción detallada con números específicos
- insight_data: datos relevantes del análisis
- priority: prioridad del 1 al 3`

  const userPrompt = `Analiza este nuevo patrón:
Tipo: ${patternType}
Datos actuales: ${JSON.stringify(patternData)}

Contexto histórico (últimos 15 patrones similares):
${JSON.stringify(historicalPatterns || [])}

Genera insights específicos y accionables basados en este análisis.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || '',
        'X-Title': 'AI Task Manager - Pattern Analysis'
      },
      body: JSON.stringify({
        model: llmConfig.model_name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: Math.min(llmConfig.max_tokens, 800),
        temperature: llmConfig.temperature,
        top_p: llmConfig.top_p,
        frequency_penalty: llmConfig.frequency_penalty,
        presence_penalty: llmConfig.presence_penalty
      })
    })

    if (!response.ok) {
      console.error('OpenRouter API error:', await response.text())
      return await generateBasicInsights(supabaseClient, userId, patternType, patternData)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      return await generateBasicInsights(supabaseClient, userId, patternType, patternData)
    }

    // Parsear respuesta de IA
    let insights = []
    try {
      const parsed = JSON.parse(aiResponse)
      insights = Array.isArray(parsed) ? parsed : [parsed]
    } catch (e) {
      console.error('Error parsing AI response:', e)
      return await generateBasicInsights(supabaseClient, userId, patternType, patternData)
    }

    // Log de uso
    console.log('AI Pattern Analysis completed:', {
      user_id: userId,
      pattern_type: patternType,
      model: llmConfig.model_name,
      insights_generated: insights.length,
      usage: data.usage
    })

    return insights

  } catch (error) {
    console.error('AI pattern analysis error:', error)
    return await generateBasicInsights(supabaseClient, userId, patternType, patternData)
  }
}
