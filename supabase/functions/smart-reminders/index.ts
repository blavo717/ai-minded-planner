
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Contextos específicos del dominio industrial
const INDUSTRY_CONTEXTS = {
  repuestos: {
    keywords: ['repuesto', 'pieza', 'componente', 'stock', 'inventario'],
    leadTime: 7, // días
    suggestions: [
      'Verificar disponibilidad en stock',
      'Contactar proveedor para tiempo de entrega',
      'Considerar alternativas o equivalencias'
    ]
  },
  moldes: {
    keywords: ['molde', 'matriz', 'troquel', 'herramental'],
    leadTime: 14, // días
    suggestions: [
      'Programar mantenimiento preventivo',
      'Verificar desgaste y tolerancias',
      'Planificar tiempo de setup'
    ]
  },
  produccion: {
    keywords: ['producir', 'fabricar', 'lote', 'batch', 'turno'],
    leadTime: 3, // días
    suggestions: [
      'Verificar disponibilidad de materias primas',
      'Coordinar con equipo de producción',
      'Programar control de calidad'
    ]
  },
  mantenimiento: {
    keywords: ['mantenimiento', 'reparar', 'ajustar', 'calibrar'],
    leadTime: 5, // días
    suggestions: [
      'Preparar herramientas necesarias',
      'Coordinar parada de equipo',
      'Verificar disponibilidad de técnicos'
    ]
  }
}

function detectTaskContext(task: any): string | null {
  const text = `${task.title} ${task.description || ''}`.toLowerCase();
  
  for (const [context, config] of Object.entries(INDUSTRY_CONTEXTS)) {
    if (config.keywords.some(keyword => text.includes(keyword))) {
      return context;
    }
  }
  
  return null;
}

function generateContextualReminders(task: any, context: string): any[] {
  const config = INDUSTRY_CONTEXTS[context as keyof typeof INDUSTRY_CONTEXTS];
  const reminders = [];
  const now = new Date();
  
  if (task.due_date) {
    const dueDate = new Date(task.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Recordatorio anticipado basado en el contexto
    if (daysUntilDue <= config.leadTime && daysUntilDue > 0) {
      reminders.push({
        user_id: task.user_id,
        task_id: task.id,
        reminder_type: 'contextual_preparation',
        title: `Preparación necesaria: ${task.title}`,
        message: `Esta tarea requiere ${config.leadTime} días de preparación. Sugerencias: ${config.suggestions.join(', ')}`,
        scheduled_for: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutos
      });
    }
  }
  
  // Recordatorios para subtareas
  if (task.parent_task_id === null) { // Es tarea principal
    reminders.push({
      user_id: task.user_id,
      task_id: task.id,
      reminder_type: 'subtask_planning',
      title: `Planificar subtareas: ${task.title}`,
      message: `Considera dividir esta tarea en subtareas más específicas para mejor seguimiento.`,
      scheduled_for: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
    });
  }
  
  return reminders;
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

    // Obtener tareas con contexto (incluyendo subtareas)
    const { data: tasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'completed')

    const reminders = []

    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        // Recordatorios tradicionales
        if (task.due_date) {
          const dueDate = new Date(task.due_date)
          const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))
          
          if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
            reminders.push({
              user_id: user.id,
              task_id: task.id,
              reminder_type: 'deadline_approach',
              title: `Tarea próxima a vencer: ${task.title}`,
              message: `La tarea "${task.title}" vence en ${hoursUntilDue} horas.`,
              scheduled_for: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
            })
          }
          
          // Tareas vencidas
          if (dueDate < now) {
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

        // Recordatorios contextuales inteligentes
        const context = detectTaskContext(task)
        if (context) {
          const contextualReminders = generateContextualReminders(task, context)
          reminders.push(...contextualReminders)
        }

        // Recordatorios para tareas con dependencias
        const { data: dependencies } = await supabaseClient
          .from('task_dependencies')
          .select(`
            *,
            depends_on_task:tasks!task_dependencies_depends_on_task_id_fkey(id, title, status, due_date)
          `)
          .eq('task_id', task.id)

        if (dependencies && dependencies.length > 0) {
          for (const dep of dependencies) {
            const depTask = dep.depends_on_task
            if (depTask && depTask.status !== 'completed') {
              if (depTask.due_date) {
                const depDueDate = new Date(depTask.due_date)
                const daysUntilDepDue = Math.ceil((depDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                
                if (daysUntilDepDue <= 2) {
                  reminders.push({
                    user_id: user.id,
                    task_id: task.id,
                    reminder_type: 'dependency_blocking',
                    title: `Dependencia crítica: ${task.title}`,
                    message: `La tarea "${depTask.title}" debe completarse antes de poder iniciar "${task.title}". Vence en ${daysUntilDepDue} días.`,
                    scheduled_for: now.toISOString(),
                  })
                }
              }
            }
          }
        }
      }
    }

    // Análisis de patrones de trabajo
    const { data: recentSessions } = await supabaseClient
      .from('task_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('started_at', { ascending: false })

    if (recentSessions && recentSessions.length > 0) {
      // Detectar sesiones muy largas activas
      const activeSessions = recentSessions.filter(session => !session.ended_at)
      for (const session of activeSessions) {
        const sessionStart = new Date(session.started_at)
        const hoursWorking = (now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60)
        
        if (hoursWorking > 2) {
          reminders.push({
            user_id: user.id,
            task_id: session.task_id,
            reminder_type: 'break_suggestion',
            title: 'Hora de un descanso',
            message: `Has estado trabajando por ${Math.round(hoursWorking)} horas. Considera tomar un descanso de 15 minutos para mantener la productividad.`,
            scheduled_for: now.toISOString(),
          })
        }
      }

      // Sugerir revisión de estimaciones
      const completedSessions = recentSessions.filter(session => session.ended_at && session.duration_minutes)
      if (completedSessions.length > 0) {
        const avgDuration = completedSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) / completedSessions.length
        
        const { data: tasksWithEstimates } = await supabaseClient
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .not('estimated_duration', 'is', null)
          .eq('status', 'pending')

        if (tasksWithEstimates && tasksWithEstimates.length > 0) {
          const underestimatedTasks = tasksWithEstimates.filter(task => 
            task.estimated_duration && task.estimated_duration < avgDuration * 0.7
          )

          if (underestimatedTasks.length > 0) {
            reminders.push({
              user_id: user.id,
              task_id: null,
              reminder_type: 'estimation_review',
              title: 'Revisar estimaciones de tiempo',
              message: `Basado en tu historial reciente (promedio: ${Math.round(avgDuration)} min), algunas tareas podrían estar subestimadas.`,
              scheduled_for: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 horas
            })
          }
        }
      }
    }

    // Guardar recordatorios únicos
    if (reminders.length > 0) {
      // Evitar duplicados verificando recordatorios existentes
      const { data: existingReminders } = await supabaseClient
        .from('smart_reminders')
        .select('task_id, reminder_type')
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())

      const existingKeys = new Set(
        existingReminders?.map(r => `${r.task_id}-${r.reminder_type}`) || []
      )

      const newReminders = reminders.filter(reminder => 
        !existingKeys.has(`${reminder.task_id}-${reminder.reminder_type}`)
      )

      if (newReminders.length > 0) {
        const { error } = await supabaseClient
          .from('smart_reminders')
          .insert(newReminders)

        if (error) throw error
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_created: reminders.length,
        contextual_analysis: 'enabled',
        industry_contexts: Object.keys(INDUSTRY_CONTEXTS)
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
