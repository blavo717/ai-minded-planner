
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

    // Obtener datos del usuario para análisis
    const { data: tasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: patterns } = await supabaseClient
      .from('user_patterns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const insights = []

    // Análisis 1: Tareas pendientes vs completadas
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

      // Análisis 2: Tareas sin fecha de vencimiento
      const tasksWithoutDueDate = tasks.filter(t => !t.due_date && t.status === 'pending')
      if (tasksWithoutDueDate.length > 5) {
        insights.push({
          insight_type: 'time_optimization',
          title: 'Tareas sin fecha límite',
          description: `${tasksWithoutDueDate.length} tareas no tienen fecha límite. Establecer fechas te ayudará a organizarte mejor.`,
          insight_data: {
            count: tasksWithoutDueDate.length,
            suggestion: 'set_due_dates'
          },
          priority: 3
        })
      }
    }

    // Análisis 3: Patrones de productividad
    if (patterns && patterns.length > 0) {
      const workSessions = patterns.filter(p => p.pattern_type === 'work_session')
      if (workSessions.length >= 5) {
        const avgProductivity = workSessions
          .map(s => s.pattern_data.productivity_score)
          .filter(s => s > 0)
          .reduce((a, b, _, arr) => a + b / arr.length, 0)

        if (avgProductivity < 3) {
          insights.push({
            insight_type: 'productivity_trend',
            title: 'Productividad por debajo del promedio',
            description: `Tu puntuación promedio de productividad es ${avgProductivity.toFixed(1)}/5. Intenta identificar qué factores afectan tu concentración.`,
            insight_data: {
              average_score: avgProductivity,
              suggestion: 'analyze_distractions'
            },
            priority: 1
          })
        }
      }
    }

    // Guardar insights en la base de datos
    if (insights.length > 0) {
      const insightsToInsert = insights.map(insight => ({
        user_id: user.id,
        ...insight
      }))

      const { error } = await supabaseClient
        .from('ai_insights')
        .insert(insightsToInsert)

      if (error) throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights_generated: insights.length,
        insights: insights 
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
