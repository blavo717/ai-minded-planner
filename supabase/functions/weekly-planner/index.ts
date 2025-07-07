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

    const { weekStartDate, strategy = 'balanced' } = await req.json();

    // Calculate week dates
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    // Get user preferences
    const { data: preferences } = await supabaseClient
      .from('user_productivity_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const workDays = preferences?.preferred_work_days || [1, 2, 3, 4, 5];
    const workHoursPerDay = (preferences?.work_hours_end || 17) - (preferences?.work_hours_start || 9);
    const dailyTaskGoal = preferences?.productivity_goals?.daily_tasks || 3;

    // Get pending tasks
    const { data: tasks } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .eq('is_archived', false)
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No tasks found to plan',
        weekPlan: null
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze user's historical productivity patterns
    const { data: completedTasks } = await supabaseClient
      .from('tasks')
      .select('*, completed_at, actual_duration')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('completed_at', { ascending: false })
      .limit(100);

    // Calculate average completion rate by day of week and hour
    const productivityByDay = {};
    const productivityByHour = {};
    const avgTaskDuration = {};

    (completedTasks || []).forEach(task => {
      if (task.completed_at) {
        const completedDate = new Date(task.completed_at);
        const dayOfWeek = completedDate.getDay();
        const hour = completedDate.getHours();
        
        productivityByDay[dayOfWeek] = (productivityByDay[dayOfWeek] || 0) + 1;
        productivityByHour[hour] = (productivityByHour[hour] || 0) + 1;
        
        if (task.actual_duration) {
          const priority = task.priority || 'medium';
          avgTaskDuration[priority] = avgTaskDuration[priority] || [];
          avgTaskDuration[priority].push(task.actual_duration);
        }
      }
    });

    // Calculate optimal time slots for different task types
    const getOptimalTimeSlots = (priority: string, energyLevel: string) => {
      const energySchedule = preferences?.energy_schedule || {
        high: [9, 10, 11],
        medium: [12, 13, 14, 15, 16],
        low: [17, 18, 19]
      };

      const optimalHours = energySchedule[energyLevel] || energySchedule.medium;
      
      // Prioritize based on historical productivity
      return optimalHours.sort((a, b) => 
        (productivityByHour[b] || 0) - (productivityByHour[a] || 0)
      );
    };

    // Smart task planning algorithm
    const planTasks = () => {
      const weekPlan = [];
      const taskQueue = [...tasks];
      
      // Sort tasks by strategic priority
      taskQueue.sort((a, b) => {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority] || 2;
        const bPriority = priorityWeight[b.priority] || 2;
        
        // Consider due dates too
        const aDueDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDueDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        
        if (aDueDate !== bDueDate) {
          return aDueDate - bDueDate;
        }
        
        return bPriority - aPriority;
      });

      // Assign tasks to days
      const currentDate = new Date(startDate);
      let dayIndex = 0;
      
      while (dayIndex < 7 && taskQueue.length > 0) {
        const dayOfWeek = currentDate.getDay();
        const isWorkDay = workDays.includes(dayOfWeek);
        
        if (!isWorkDay) {
          currentDate.setDate(currentDate.getDate() + 1);
          dayIndex++;
          continue;
        }

        const dayPlan = {
          date: new Date(currentDate).toISOString().split('T')[0],
          dayOfWeek,
          tasks: [],
          estimatedHours: 0,
          taskCount: 0
        };

        let dailyHours = 0;
        let dailyTaskCount = 0;
        const maxDailyHours = Math.min(workHoursPerDay, 8); // Cap at 8 hours
        const maxDailyTasks = strategy === 'focused' ? Math.max(1, dailyTaskGoal - 1) : 
                             strategy === 'intensive' ? dailyTaskGoal + 2 : dailyTaskGoal;

        // Assign tasks to this day
        for (let i = taskQueue.length - 1; i >= 0 && dailyTaskCount < maxDailyTasks; i--) {
          const task = taskQueue[i];
          const estimatedDuration = task.estimated_duration || 
            (avgTaskDuration[task.priority]?.reduce((a, b) => a + b, 0) / 
             avgTaskDuration[task.priority]?.length) || 60; // Default 1 hour

          const estimatedHours = estimatedDuration / 60;

          // Check if task fits in remaining day capacity
          if (dailyHours + estimatedHours <= maxDailyHours) {
            // Determine optimal time slot
            const taskEnergyRequirement = task.priority === 'urgent' || task.priority === 'high' ? 'high' :
                                         task.priority === 'medium' ? 'medium' : 'low';
            
            const optimalTimeSlots = getOptimalTimeSlots(task.priority, taskEnergyRequirement);
            const suggestedTime = optimalTimeSlots[0] || preferences?.work_hours_start || 9;

            dayPlan.tasks.push({
              id: task.id,
              title: task.title,
              priority: task.priority,
              estimated_duration: estimatedDuration,
              estimated_hours: estimatedHours,
              suggested_time: `${suggestedTime.toString().padStart(2, '0')}:00`,
              energy_requirement: taskEnergyRequirement,
              due_date: task.due_date,
              rationale: `Programada para ${suggestedTime}:00 por ${taskEnergyRequirement === 'high' ? 'alta prioridad y energía requerida' : 
                                                                  taskEnergyRequirement === 'medium' ? 'energía media apropiada' : 
                                                                  'tarea ligera ideal para cierre de día'}`
            });

            dailyHours += estimatedHours;
            dailyTaskCount++;
            taskQueue.splice(i, 1);
          }
        }

        dayPlan.estimatedHours = Math.round(dailyHours * 10) / 10;
        dayPlan.taskCount = dailyTaskCount;
        
        if (dayPlan.tasks.length > 0) {
          // Sort tasks by suggested time
          dayPlan.tasks.sort((a, b) => a.suggested_time.localeCompare(b.suggested_time));
          weekPlan.push(dayPlan);
        }

        currentDate.setDate(currentDate.getDate() + 1);
        dayIndex++;
      }

      return weekPlan;
    };

    const weeklyPlan = planTasks();
    
    // Calculate plan statistics
    const totalTasks = weeklyPlan.reduce((sum, day) => sum + day.taskCount, 0);
    const totalHours = weeklyPlan.reduce((sum, day) => sum + day.estimatedHours, 0);
    const planComplexity = totalTasks > tasks.length * 0.8 ? 'high' : 
                          totalTasks > tasks.length * 0.5 ? 'medium' : 'low';
    
    // Generate AI confidence score
    const aiConfidence = Math.min(95, 
      50 + // Base confidence
      (completedTasks?.length || 0) * 0.5 + // Historical data bonus
      (totalTasks > 0 ? 20 : 0) + // Planning success bonus
      (workDays.length >= 5 ? 10 : 5) + // Work pattern bonus
      (preferences ? 10 : 0) // Preferences bonus
    );

    // Create optimization insights
    const optimizationInsights = [];
    
    if (totalHours > workDays.length * workHoursPerDay * 0.8) {
      optimizationInsights.push({
        type: 'warning',
        title: 'Carga de trabajo alta',
        message: 'El plan incluye muchas horas. Considera priorizar solo las tareas más importantes.',
        suggestion: 'Reduce el número de tareas por día o extiende el plazo de algunas tareas no urgentes.'
      });
    }

    if (weeklyPlan.some(day => day.taskCount > dailyTaskGoal + 2)) {
      optimizationInsights.push({
        type: 'tip',
        title: 'Distribución desigual',
        message: 'Algunos días tienen muchas tareas concentradas.',
        suggestion: 'Considera redistribuir tareas para una carga más equilibrada.'
      });
    }

    if (taskQueue.length > 0) {
      optimizationInsights.push({
        type: 'info',
        title: `${taskQueue.length} tareas sin planificar`,
        message: 'Algunas tareas no cupieron en esta semana.',
        suggestion: 'Revisa las fechas límite y considera planificarlas para la próxima semana.'
      });
    }

    // Save the weekly plan
    const weekPlanData = {
      user_id: user.id,
      week_start_date: startDate.toISOString().split('T')[0],
      week_end_date: endDate.toISOString().split('T')[0],
      planned_tasks: weeklyPlan,
      optimization_strategy: strategy,
      ai_confidence: Math.round(aiConfidence),
      total_estimated_hours: Math.round(totalHours * 10) / 10,
      status: 'draft'
    };

    const { data: savedPlan, error } = await supabaseClient
      .from('weekly_plans')
      .upsert(weekPlanData, { onConflict: 'user_id,week_start_date' })
      .select()
      .single();

    if (error) {
      console.error('Error saving weekly plan:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Created weekly plan for user ${user.id}: ${totalTasks} tasks, ${totalHours} hours`);

    return new Response(JSON.stringify({
      success: true,
      weeklyPlan: savedPlan,
      statistics: {
        totalTasks,
        totalHours,
        plannedDays: weeklyPlan.length,
        unplannedTasks: taskQueue.length,
        aiConfidence: Math.round(aiConfidence),
        planComplexity
      },
      insights: optimizationInsights
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weekly-planner function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});