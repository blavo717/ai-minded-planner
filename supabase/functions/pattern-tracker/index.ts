
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
        confidence_score: 0.7, // Score inicial
      })

    if (error) throw error

    // Analizar patrones existentes para generar insights
    const { data: patterns } = await supabaseClient
      .from('user_patterns')
      .select('*')
      .eq('user_id', user.id)
      .eq('pattern_type', pattern_type)
      .order('created_at', { ascending: false })
      .limit(10)

    // Lógica básica para detectar patrones
    if (patterns && patterns.length >= 3) {
      let insight = null

      if (pattern_type === 'task_completion') {
        const durations = patterns.map(p => p.pattern_data.duration_minutes).filter(d => d > 0)
        if (durations.length >= 3) {
          const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
          const recentDuration = durations[0]
          
          if (recentDuration > avgDuration * 1.5) {
            insight = {
              insight_type: 'productivity_trend',
              title: 'Tiempo de tarea más largo de lo usual',
              description: `Esta tarea te tomó ${Math.round(recentDuration)} minutos, un 50% más que tu promedio de ${Math.round(avgDuration)} minutos.`,
              insight_data: {
                pattern_type,
                average_duration: avgDuration,
                recent_duration: recentDuration,
                improvement_suggestion: 'Considera dividir tareas largas en subtareas más pequeñas.'
              },
              priority: 2
            }
          }
        }
      }

      if (pattern_type === 'work_session') {
        const productivityScores = patterns.map(p => p.pattern_data.productivity_score).filter(s => s > 0)
        if (productivityScores.length >= 3) {
          const avgScore = productivityScores.reduce((a, b) => a + b, 0) / productivityScores.length
          
          if (avgScore >= 4) {
            insight = {
              insight_type: 'productivity_trend',
              title: '¡Excelente productividad!',
              description: `Tu puntuación promedio de productividad es ${avgScore.toFixed(1)}/5. ¡Sigue así!`,
              insight_data: {
                pattern_type,
                average_score: avgScore,
                trend: 'positive'
              },
              priority: 3
            }
          }
        }
      }

      // Crear insight si se detectó un patrón
      if (insight) {
        await supabaseClient
          .from('ai_insights')
          .insert({
            user_id: user.id,
            ...insight
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true, patterns_analyzed: patterns?.length || 0 }),
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
