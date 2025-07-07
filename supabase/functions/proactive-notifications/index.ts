import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user preferences for notification frequency
    const { data: preferences } = await supabaseClient
      .from('user_productivity_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const notificationFrequency = preferences?.notification_frequency || 30; // minutes

    // Get tasks that need reminders
    const now = new Date();
    const reminderThreshold = new Date(now.getTime() + (notificationFrequency * 60 * 1000));

    const { data: tasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .eq('is_archived', false)
      .not('due_date', 'is', null)
      .lte('due_date', reminderThreshold.toISOString());

    // Get existing notifications to avoid duplicates
    const { data: existingNotifications } = await supabaseClient
      .from('proactive_notifications')
      .select('action_data')
      .eq('user_id', user.id)
      .eq('notification_type', 'reminder')
      .eq('is_sent', false);

    const existingTaskIds = existingNotifications?.map(n => n.action_data?.task_id) || [];

    const notifications = [];

    // Generate smart reminders
    for (const task of tasks || []) {
      if (existingTaskIds.includes(task.id)) continue;

      const dueDate = new Date(task.due_date);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60));

      let priority = 3;
      let title = '';
      let message = '';
      let scheduledFor = new Date();

      if (hoursUntilDue <= 2) {
        priority = 1;
        title = '🚨 Tarea urgente vence pronto';
        message = `"${task.title}" vence en ${hoursUntilDue <= 0 ? 'menos de una hora' : `${hoursUntilDue} horas`}. ¡Es momento de actuar!`;
        scheduledFor = now; // Send immediately
      } else if (hoursUntilDue <= 24) {
        priority = 2;
        title = '⏰ Recordatorio: Tarea vence hoy';
        message = `"${task.title}" vence hoy. ¿Ya empezaste a trabajar en ella?`;
        scheduledFor = new Date(now.getTime() + (15 * 60 * 1000)); // 15 minutes from now
      } else if (hoursUntilDue <= 48) {
        priority = 3;
        title = '📅 Tarea vence mañana';
        message = `"${task.title}" vence mañana. Sería bueno planificarla para hoy.`;
        scheduledFor = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now
      }

      if (title) {
        notifications.push({
          user_id: user.id,
          notification_type: 'reminder',
          title,
          message,
          action_data: {
            task_id: task.id,
            task_title: task.title,
            due_date: task.due_date,
            priority: task.priority
          },
          priority,
          scheduled_for: scheduledFor.toISOString()
        });
      }
    }

    // Generate productivity suggestions based on patterns
    const { data: recentActions } = await supabaseClient
      .from('recommendation_feedback')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString()) // Last 7 days
      .order('timestamp', { ascending: false })
      .limit(50);

    // Analyze patterns and generate suggestions
    if (recentActions && recentActions.length > 0) {
      const acceptedCount = recentActions.filter(a => a.action === 'accepted').length;
      const skippedCount = recentActions.filter(a => a.action === 'skipped').length;
      const acceptanceRate = acceptedCount / recentActions.length;

      if (acceptanceRate < 0.5 && skippedCount > 5) {
        notifications.push({
          user_id: user.id,
          notification_type: 'suggestion',
          title: '💡 Sugerencia de productividad',
          message: 'He notado que has estado saltando muchas recomendaciones. ¿Te gustaría ajustar tus preferencias de horarios y energía?',
          action_data: {
            type: 'preferences_suggestion',
            acceptance_rate: acceptanceRate,
            skipped_count: skippedCount
          },
          priority: 4,
          scheduled_for: new Date(now.getTime() + (2 * 60 * 60 * 1000)).toISOString() // 2 hours from now
        });
      }
    }

    // Check for overdue tasks and generate warnings
    const { data: overdueTasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .eq('is_archived', false)
      .not('due_date', 'is', null)
      .lt('due_date', now.toISOString());

    if (overdueTasks && overdueTasks.length > 3) {
      notifications.push({
        user_id: user.id,
        notification_type: 'warning',
        title: '⚠️ Múltiples tareas vencidas',
        message: `Tienes ${overdueTasks.length} tareas vencidas. ¿Necesitas reorganizar tus prioridades?`,
        action_data: {
          type: 'overdue_warning',
          overdue_count: overdueTasks.length,
          tasks: overdueTasks.slice(0, 5).map(t => ({ id: t.id, title: t.title, due_date: t.due_date }))
        },
        priority: 2,
        scheduled_for: now.toISOString()
      });
    }

    // Generate celebration notifications for achievements
    const { data: todayCompleted } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('completed_at', new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString());

    if (todayCompleted && todayCompleted.length >= (preferences?.productivity_goals?.daily_tasks || 3)) {
      const alreadyCelebrated = existingNotifications?.some(n => 
        n.action_data?.type === 'daily_goal_celebration' && 
        n.action_data?.date === now.toDateString()
      );

      if (!alreadyCelebrated) {
        notifications.push({
          user_id: user.id,
          notification_type: 'celebration',
          title: '🎉 ¡Meta diaria alcanzada!',
          message: `¡Felicidades! Has completado ${todayCompleted.length} tareas hoy. ¡Excelente trabajo!`,
          action_data: {
            type: 'daily_goal_celebration',
            completed_count: todayCompleted.length,
            date: now.toDateString()
          },
          priority: 4,
          scheduled_for: now.toISOString()
        });
      }
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { data: insertedNotifications, error } = await supabaseClient
        .from('proactive_notifications')
        .insert(notifications)
        .select();

      if (error) {
        console.error('Error inserting notifications:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Created ${insertedNotifications.length} proactive notifications for user ${user.id}`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        notifications_created: insertedNotifications.length,
        notifications: insertedNotifications 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      notifications_created: 0,
      message: 'No new notifications needed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in proactive-notifications function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});