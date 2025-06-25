
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskAnalysisRequest {
  taskIds?: string[];
  userId?: string;
  analysisType?: 'health_check' | 'bottleneck_detection' | 'priority_analysis' | 'completion_prediction';
}

interface TaskData {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  last_worked_at?: string;
  last_communication_at?: string;
  estimated_duration?: number;
  actual_duration?: number;
  task_level: number;
  needs_followup?: boolean;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function analyzeTaskHealth(task: TaskData): Promise<any> {
  try {
    console.log(`Analizando salud de tarea: ${task.id} (${task.title})`);
    
    const now = new Date();
    const createdAt = new Date(task.created_at);
    const lastActivity = task.last_worked_at ? new Date(task.last_worked_at) : 
                        task.last_communication_at ? new Date(task.last_communication_at) : 
                        createdAt;
    
    const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    
    let healthScore = 100;
    const issues = [];
    
    // Análisis de stagnación
    if (daysSinceActivity > 7 && task.status !== 'completed') {
      healthScore -= 30;
      issues.push('No hay actividad reciente (>7 días)');
    } else if (daysSinceActivity > 3 && task.status !== 'completed') {
      healthScore -= 15;
      issues.push('Poca actividad reciente (>3 días)');
    }
    
    // Análisis de duración vs estimación
    if (task.estimated_duration && task.actual_duration) {
      const overrun = (task.actual_duration / task.estimated_duration) - 1;
      if (overrun > 0.5) {
        healthScore -= 20;
        issues.push(`Excede estimación en ${Math.round(overrun * 100)}%`);
      }
    }
    
    // Análisis de fecha límite
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilDue < 0) {
        healthScore -= 40;
        issues.push(`Vencida hace ${Math.abs(Math.round(daysUntilDue))} días`);
      } else if (daysUntilDue < 2 && task.status !== 'completed') {
        healthScore -= 25;
        issues.push('Próxima a vencer');
      }
    }
    
    // Análisis de seguimiento
    if (task.needs_followup) {
      healthScore -= 15;
      issues.push('Requiere seguimiento');
    }
    
    // Análisis por estado
    if (task.status === 'blocked') {
      healthScore -= 25;
      issues.push('Tarea bloqueada');
    }
    
    const finalHealthScore = Math.max(0, healthScore);
    const recommendations = generateHealthRecommendations(issues, task);
    
    console.log(`Salud calculada para ${task.id}: ${finalHealthScore}%, ${issues.length} problemas`);
    
    return {
      health_score: finalHealthScore,
      issues,
      recommendations,
      last_analysis: now.toISOString(),
      days_since_activity: Math.round(daysSinceActivity),
      days_since_created: Math.round(daysSinceCreated)
    };
  } catch (error) {
    console.error('Error in analyzeTaskHealth:', error);
    return {
      health_score: 50,
      issues: ['Error en análisis de salud'],
      recommendations: ['Revisar datos de la tarea'],
      last_analysis: new Date().toISOString()
    };
  }
}

async function detectBottlenecks(tasks: TaskData[]): Promise<any> {
  try {
    console.log(`Detectando cuellos de botella en ${tasks.length} tareas`);
    
    const bottlenecks = [];
    const tasksByLevel = tasks.reduce((acc, task) => {
      if (!acc[task.task_level]) acc[task.task_level] = [];
      acc[task.task_level].push(task);
      return acc;
    }, {} as Record<number, TaskData[]>);
    
    // Detectar cuellos de botella por nivel
    Object.entries(tasksByLevel).forEach(([level, levelTasks]) => {
      const inProgressTasks = levelTasks.filter(t => t.status === 'in_progress');
      const pendingTasks = levelTasks.filter(t => t.status === 'pending');
      const blockedTasks = levelTasks.filter(t => t.status === 'blocked');
      
      if (inProgressTasks.length > 3) {
        bottlenecks.push({
          type: 'overload',
          level: parseInt(level),
          count: inProgressTasks.length,
          message: `Sobrecarga en nivel ${level}: ${inProgressTasks.length} tareas activas`,
          severity: inProgressTasks.length > 5 ? 'high' : 'medium'
        });
      }
      
      if (pendingTasks.length > 10) {
        bottlenecks.push({
          type: 'backlog',
          level: parseInt(level),
          count: pendingTasks.length,
          message: `Acumulación en nivel ${level}: ${pendingTasks.length} tareas pendientes`,
          severity: pendingTasks.length > 20 ? 'high' : 'medium'
        });
      }
      
      if (blockedTasks.length > 0) {
        bottlenecks.push({
          type: 'blocked',
          level: parseInt(level),
          count: blockedTasks.length,
          message: `Bloqueos en nivel ${level}: ${blockedTasks.length} tareas bloqueadas`,
          severity: 'high'
        });
      }
    });
    
    console.log(`Detectados ${bottlenecks.length} cuellos de botella`);
    
    return {
      bottlenecks_detected: bottlenecks.length > 0,
      bottlenecks,
      bottleneck_count: bottlenecks.length,
      recommendations: generateBottleneckRecommendations(bottlenecks)
    };
  } catch (error) {
    console.error('Error in detectBottlenecks:', error);
    return {
      bottlenecks_detected: false,
      bottlenecks: [],
      bottleneck_count: 0,
      recommendations: ['Error en detección de cuellos de botella']
    };
  }
}

async function calculatePriorityScore(task: TaskData): Promise<number> {
  try {
    console.log(`Calculando prioridad para tarea: ${task.id} (prioridad: ${task.priority})`);
    
    let score = 0;
    
    // Peso por prioridad declarada (base fundamental)
    const priorityWeights = { 
      low: 20, 
      medium: 50, 
      high: 75, 
      urgent: 95 
    };
    score += priorityWeights[task.priority as keyof typeof priorityWeights] || 50;
    
    // Peso por fecha límite (muy importante)
    if (task.due_date) {
      const daysUntilDue = (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 0) {
        score += 30; // Tarea vencida
      } else if (daysUntilDue < 1) {
        score += 25; // Vence hoy
      } else if (daysUntilDue < 3) {
        score += 15; // Vence pronto
      } else if (daysUntilDue < 7) {
        score += 10; // Vence esta semana
      }
    }
    
    // Peso por inactividad
    const lastActivity = task.last_worked_at || task.last_communication_at;
    if (lastActivity) {
      const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity > 7) {
        score += 15; // Requiere atención
      } else if (daysSinceActivity > 3) {
        score += 8;
      }
    }
    
    // Peso por seguimiento requerido
    if (task.needs_followup) {
      score += 12;
    }
    
    // Peso por estado crítico
    if (task.status === 'blocked') {
      score += 20; // Estado crítico
    }
    
    // Peso por nivel de tarea (tareas principales más importantes)
    if (task.task_level === 1) {
      score += 5;
    }
    
    const finalScore = Math.min(100, Math.max(0, score));
    console.log(`Prioridad calculada para ${task.id}: ${finalScore} (base: ${priorityWeights[task.priority as keyof typeof priorityWeights] || 50})`);
    
    return finalScore;
  } catch (error) {
    console.error('Error in calculatePriorityScore:', error);
    return 50; // Valor por defecto
  }
}

async function predictCompletion(task: TaskData): Promise<string | null> {
  try {
    if (task.status === 'completed') return null;
    
    console.log(`Prediciendo finalización para tarea: ${task.id}`);
    
    const now = new Date();
    let predictedDate = new Date(now);
    
    // Estimación basada en duración estimada
    if (task.estimated_duration) {
      predictedDate.setHours(predictedDate.getHours() + task.estimated_duration);
    } else {
      // Estimación por defecto basada en nivel de tarea y prioridad
      const baseHours = task.task_level === 1 ? 8 : task.task_level === 2 ? 4 : 2;
      predictedDate.setHours(predictedDate.getHours() + baseHours);
    }
    
    // Ajuste por prioridad
    const priorityAdjustment = { low: 1.5, medium: 1.0, high: 0.7, urgent: 0.5 };
    const adjustment = priorityAdjustment[task.priority as keyof typeof priorityAdjustment] || 1.0;
    const adjustedHours = Math.round(
      (predictedDate.getTime() - now.getTime()) / (1000 * 60 * 60) * adjustment
    );
    
    predictedDate = new Date(now.getTime() + adjustedHours * 60 * 60 * 1000);
    
    // Ajuste por estado actual
    if (task.status === 'blocked') {
      predictedDate.setDate(predictedDate.getDate() + 2); // Retraso por bloqueo
    }
    
    console.log(`Predicción para ${task.id}: ${predictedDate.toISOString()}`);
    return predictedDate.toISOString();
  } catch (error) {
    console.error('Error in predictCompletion:', error);
    return null;
  }
}

function generateHealthRecommendations(issues: string[], task: TaskData): string[] {
  const recommendations = [];
  
  if (issues.some(i => i.includes('actividad reciente'))) {
    recommendations.push('Programa tiempo específico para trabajar en esta tarea');
    recommendations.push('Considera dividir la tarea en pasos más pequeños');
  }
  
  if (issues.some(i => i.includes('estimación'))) {
    recommendations.push('Revisa la complejidad real de la tarea');
    recommendations.push('Actualiza las estimaciones para futuras tareas similares');
  }
  
  if (issues.some(i => i.includes('Vencida'))) {
    recommendations.push('Prioriza esta tarea inmediatamente');
    recommendations.push('Comunícate con stakeholders sobre el retraso');
  }
  
  if (issues.some(i => i.includes('seguimiento'))) {
    recommendations.push('Programa comunicación de seguimiento');
    recommendations.push('Define próximos pasos concretos');
  }
  
  if (issues.some(i => i.includes('bloqueada'))) {
    recommendations.push('Identifica y resuelve el impedimento');
    recommendations.push('Busca alternativas para desbloquear la tarea');
  }
  
  return recommendations;
}

function generateBottleneckRecommendations(bottlenecks: any[]): string[] {
  const recommendations = [];
  
  if (bottlenecks.some(b => b.type === 'overload')) {
    recommendations.push('Considera completar algunas tareas antes de iniciar nuevas');
    recommendations.push('Evalúa la posibilidad de delegar o posponer tareas menos críticas');
  }
  
  if (bottlenecks.some(b => b.type === 'backlog')) {
    recommendations.push('Prioriza las tareas pendientes más importantes');
    recommendations.push('Considera dividir tareas grandes en subtareas más manejables');
  }
  
  if (bottlenecks.some(b => b.type === 'blocked')) {
    recommendations.push('Resuelve inmediatamente las tareas bloqueadas');
    recommendations.push('Identifica patrones que causan bloqueos frecuentes');
  }
  
  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { taskIds, userId, analysisType }: TaskAnalysisRequest = requestBody;
    
    console.log('=== INICIO ANÁLISIS AI ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // Validaciones básicas
    if (!taskIds && !userId) {
      throw new Error('Se requiere taskIds o userId para el análisis');
    }
    
    // Obtener tareas para análizar
    let query = supabase.from('tasks').select('*');
    
    if (taskIds && taskIds.length > 0) {
      query = query.in('id', taskIds);
      console.log(`Filtrando por taskIds: ${taskIds.join(', ')}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
      console.log(`Filtrando por userId: ${userId}`);
    }
    
    const { data: tasks, error: tasksError } = await query;
    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw new Error(`Error al obtener tareas: ${tasksError.message}`);
    }
    
    if (!tasks || tasks.length === 0) {
      console.log('No se encontraron tareas para analizar');
      return new Response(JSON.stringify({ 
        results: [],
        message: 'No se encontraron tareas para analizar'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const results = [];
    console.log(`Analizando ${tasks.length} tareas con tipo: ${analysisType || 'complete_analysis'}`);
    
    for (const task of tasks) {
      let analysisData = {};
      let priorityScore = 0;
      let predictedCompletion = null;
      let bottleneckDetected = false;
      let suggestions = [];
      
      try {
        console.log(`--- Procesando tarea: ${task.id} (${task.title}) ---`);
        
        switch (analysisType) {
          case 'health_check':
            analysisData = await analyzeTaskHealth(task);
            suggestions = analysisData.recommendations || [];
            break;
            
          case 'bottleneck_detection':
            const bottleneckAnalysis = await detectBottlenecks([task]);
            analysisData = bottleneckAnalysis;
            bottleneckDetected = bottleneckAnalysis.bottlenecks_detected;
            suggestions = bottleneckAnalysis.recommendations || [];
            break;
            
          case 'priority_analysis':
            priorityScore = await calculatePriorityScore(task);
            analysisData = { 
              priority_score: priorityScore,
              priority_level: task.priority,
              calculated_at: new Date().toISOString()
            };
            break;
            
          case 'completion_prediction':
            predictedCompletion = await predictCompletion(task);
            analysisData = { 
              predicted_completion: predictedCompletion,
              current_status: task.status,
              predicted_at: new Date().toISOString()
            };
            break;
            
          default:
            // Análisis completo
            console.log('Ejecutando análisis completo...');
            const healthData = await analyzeTaskHealth(task);
            priorityScore = await calculatePriorityScore(task);
            predictedCompletion = await predictCompletion(task);
            const bottleneckData = await detectBottlenecks([task]);
            
            analysisData = {
              health: healthData,
              priority_analysis: { 
                priority_score: priorityScore,
                priority_level: task.priority
              },
              completion_prediction: { 
                predicted_completion: predictedCompletion,
                current_status: task.status
              },
              bottleneck_analysis: bottleneckData
            };
            
            bottleneckDetected = bottleneckData.bottlenecks_detected;
            suggestions = [
              ...healthData.recommendations,
              ...bottleneckData.recommendations
            ];
        }
        
        // Guardar resultados del análisis usando UPSERT con el constraint único
        const monitoringType = analysisType || 'complete_analysis';
        
        console.log(`Guardando análisis tipo '${monitoringType}' para tarea ${task.id}`);
        console.log(`Datos: priorityScore=${priorityScore}, bottleneckDetected=${bottleneckDetected}`);
        
        const { error: insertError } = await supabase
          .from('ai_task_monitoring')
          .upsert({
            task_id: task.id,
            monitoring_type: monitoringType,
            analysis_data: analysisData,
            priority_score: priorityScore,
            predicted_completion_date: predictedCompletion,
            bottleneck_detected: bottleneckDetected,
            suggestions: suggestions,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'task_id,monitoring_type'
          });
        
        if (insertError) {
          console.error('Error saving analysis for task', task.id, ':', insertError);
          // Continuamos con el siguiente en lugar de fallar completamente
        } else {
          console.log(`✓ Análisis guardado exitosamente para tarea ${task.id}`);
        }
        
        results.push({
          task_id: task.id,
          task_title: task.title,
          analysis: analysisData,
          priority_score: priorityScore,
          predicted_completion: predictedCompletion,
          bottleneck_detected: bottleneckDetected,
          suggestions,
          status: 'success'
        });
        
      } catch (taskError) {
        console.error(`Error analyzing task ${task.id}:`, taskError);
        // Añadir resultado de error para esta tarea específica
        results.push({
          task_id: task.id,
          task_title: task.title || 'Sin título',
          error: `Error en análisis: ${taskError.message}`,
          analysis: {},
          priority_score: 0,
          predicted_completion: null,
          bottleneck_detected: false,
          suggestions: ['Error en el análisis de esta tarea'],
          status: 'error'
        });
      }
    }
    
    const successfulAnalyses = results.filter(r => r.status === 'success').length;
    const failedAnalyses = results.filter(r => r.status === 'error').length;
    
    console.log(`=== ANÁLISIS COMPLETADO ===`);
    console.log(`Total tareas: ${tasks.length}`);
    console.log(`Exitosos: ${successfulAnalyses}`);
    console.log(`Fallidos: ${failedAnalyses}`);
    
    return new Response(JSON.stringify({ 
      results,
      summary: {
        total_tasks: tasks.length,
        successful_analyses: successfulAnalyses,
        failed_analyses: failedAnalyses,
        analysis_type: analysisType || 'complete_analysis',
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('=== ERROR EN AI-TASK-MONITOR ===');
    console.error('Error details:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Error en el análisis de monitoreo AI',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
