
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

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Obtener tareas con fechas de vencimiento próximas
    const { data: upcomingTasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('due_date', now.toISOString())
      .lte('due_date', tomorrow.toISOString())

    const reminders = []

    // Crear recordatorios para tareas próximas a vencer
    if (upcomingTasks && upcomingTasks.length > 0) {
      for (const task of upcomingTasks) {
        const dueDate = new Date(task.due_date)
        const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))
        
        if (hoursUntilDue <= 24) {
          reminders.push({
            user_id: user.id,
            task_id: task.id,
            reminder_type: 'deadline_approach',
            title: `Tarea próxima a vencer: ${task.title}`,
            message: `La tarea "${task.title}" vence en ${hoursUntilDue} horas.`,
            scheduled_for: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutos
          })
        }
      }
    }

    // Obtener tareas vencidas
    const { data: overdueTasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lt('due_date', now.toISOString())

    // Crear recordatorios para tareas vencidas
    if (overdueTasks && overdueTasks.length > 0) {
      for (const task of overdueTasks) {
        const dueDate = new Date(task.due_date)
        const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        
        reminders.push({
          user_id: user.id,
          task_id: task.id,
          reminder_type: 'overdue',
          title: `Tarea vencida: ${task.title}`,
          message: `La tarea "${task.title}" está vencida desde hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}.`,
          scheduled_for: now.toISOString(),
        })
      }
    }

    // Revisar sesiones de trabajo largas (más de 2 horas)
    const { data: longSessions } = await supabaseClient
      .from('task_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('ended_at', null)
      .lt('started_at', new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString())

    // Sugerir descansos
    if (longSessions && longSessions.length > 0) {
      reminders.push({
        user_id: user.id,
        task_id: null,
        reminder_type: 'break_suggestion',
        title: 'Hora de un descanso',
        message: 'Has estado trabajando por más de 2 horas. Considera tomar un descanso de 15 minutos.',
        scheduled_for: now.toISOString(),
      })
    }

    // Guardar recordatorios
    if (reminders.length > 0) {
      const { error } = await supabaseClient
        .from('smart_reminders')
        .insert(reminders)

      if (error) throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_created: reminders.length,
        reminders: reminders 
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
