
import { TaskContext } from '@/utils/taskContext';

/**
 * Constructor de prompts inteligentes para análisis contextual avanzado
 * NUEVO: Genera texto estructurado en lugar de JSON
 */
export class IntelligentPromptBuilder {
  
  /**
   * Construye prompt especializado para texto estructurado
   */
  static buildContextualAnalysisPrompt(context: TaskContext): { systemPrompt: string; userPrompt: string } {
    const { mainTask, completionStatus, recentLogs, dependencies } = context;
    
    // Detectar patrón de la tarea
    const taskPattern = this.detectTaskPattern(mainTask, completionStatus, recentLogs);
    
    const systemPrompt = `Eres un analista de productividad experto que genera análisis específicos y accionables.

MISIÓN: Analizar la situación de la tarea y generar un análisis útil en TEXTO ESTRUCTURADO.

FORMATO DE RESPUESTA REQUERIDO (usar exactamente estos marcadores):

ESTADO: [Análisis específico del estado actual con datos cuantitativos]

PRÓXIMOS PASOS: [Acciones concretas y priorizadas que se deben tomar]

ALERTA: [Solo si hay problemas reales que requieren atención inmediata]

ANÁLISIS: [Patrones detectados y recomendaciones estratégicas específicas]

PRINCIPIOS DE ANÁLISIS:
1. ESPECÍFICO: Usar datos reales (números, fechas, progreso)
2. CONTEXTUAL: Considerar el tipo de tarea y su estado
3. ACCIONABLE: Generar pasos concretos, no genéricos
4. INTELIGENTE: Detectar patrones y problemas ocultos
5. ÚTIL: Proveer información que acelere el progreso

PATRONES A DETECTAR:
• Tareas estancadas: Sin actividad >3 días
• Progreso lento: <20% completado en >7 días
• Subtareas bloqueantes: Dependencias no resueltas
• Sobrecarga: >10 subtareas activas simultáneas
• Deadline pressure: <7 días para fecha límite

RESPONDE SOLO CON EL TEXTO ESTRUCTURADO USANDO LOS MARCADORES EXACTOS.`;

    const userPrompt = this.buildSpecificUserPrompt(context, taskPattern);
    
    return { systemPrompt, userPrompt };
  }

  /**
   * Construye prompt de usuario específico según el patrón detectado
   */
  private static buildSpecificUserPrompt(context: TaskContext, pattern: TaskAnalysisPattern): string {
    const { mainTask, completionStatus, recentLogs, dependencies, projectContext } = context;
    
    let prompt = `ANÁLISIS DE TAREA ESPECÍFICA:\n\n`;
    
    // Información básica
    prompt += `TAREA: "${mainTask.title}"\n`;
    prompt += `ESTADO: ${mainTask.status} | PRIORIDAD: ${mainTask.priority}\n`;
    prompt += `PROGRESO: ${completionStatus.overallProgress}% completado\n`;
    
    if (mainTask.due_date) {
      const daysToDeadline = Math.ceil((new Date(mainTask.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      prompt += `DEADLINE: ${daysToDeadline} días restantes\n`;
    }
    
    // Análisis de progreso detallado
    prompt += `\nPROGRESO DETALLADO:\n`;
    prompt += `- Subtareas: ${completionStatus.completedSubtasks}/${completionStatus.totalSubtasks} completadas\n`;
    prompt += `- Microtareas: ${completionStatus.completedMicrotasks}/${completionStatus.totalMicrotasks} completadas\n`;
    
    // Actividad reciente significativa
    if (recentLogs.length > 0) {
      prompt += `\nACTIVIDAD RECIENTE (últimos 7 días):\n`;
      recentLogs.slice(0, 3).forEach(log => {
        const daysAgo = Math.floor((new Date().getTime() - new Date(log.created_at).getTime()) / (1000 * 60 * 60 * 24));
        prompt += `- ${log.log_type}: "${log.title}" (hace ${daysAgo} días)\n`;
      });
    }
    
    // Dependencias críticas
    if (dependencies.blocking.length > 0) {
      prompt += `\nDEPENDENCIAS BLOQUEANTES: ${dependencies.blocking.length} tareas esperando esta\n`;
    }
    if (dependencies.dependent.length > 0) {
      prompt += `DEPENDENCIAS REQUERIDAS: ${dependencies.dependent.length} tareas necesarias\n`;
    }
    
    // Contexto del proyecto
    if (projectContext) {
      prompt += `\nCONTEXTO PROYECTO: "${projectContext.name}" - ${projectContext.status}\n`;
    }
    
    // Patrón específico detectado
    prompt += `\nPATRÓN DETECTADO: ${pattern.name}\n`;
    prompt += `CARACTERÍSTICAS: ${pattern.characteristics.join(', ')}\n`;
    
    prompt += `\nGENERA ANÁLISIS ESPECÍFICO USANDO LOS MARCADORES EXACTOS (ESTADO:, PRÓXIMOS PASOS:, etc.)`;
    
    return prompt;
  }

  /**
   * Detecta el patrón específico de la tarea para análisis contextual
   */
  private static detectTaskPattern(task: any, completion: any, logs: any[]): TaskAnalysisPattern {
    const daysSinceUpdate = logs.length > 0 ? 
      Math.floor((new Date().getTime() - new Date(logs[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
      999;
    
    const daysSinceCreation = Math.floor((new Date().getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    // Tarea estancada
    if (daysSinceUpdate > 3 && completion.overallProgress < 50) {
      return {
        name: 'TAREA_ESTANCADA',
        characteristics: ['Sin actividad reciente', 'Progreso bajo', 'Posibles bloqueos'],
        riskLevel: 'high'
      };
    }
    
    // Progreso lento
    if (daysSinceCreation > 7 && completion.overallProgress < 20) {
      return {
        name: 'PROGRESO_LENTO',
        characteristics: ['Tiempo transcurrido alto', 'Avance mínimo', 'Necesita impulso'],
        riskLevel: 'medium'
      };
    }
    
    // Deadline crítico
    if (task.due_date) {
      const daysToDeadline = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysToDeadline <= 3 && completion.overallProgress < 80) {
        return {
          name: 'DEADLINE_CRITICO',
          characteristics: ['Fecha límite cercana', 'Progreso insuficiente', 'Acción urgente requerida'],
          riskLevel: 'high'
        };
      }
    }
    
    // Subtareas complejas
    if (completion.totalSubtasks > 8 && completion.completedSubtasks < 3) {
      return {
        name: 'COMPLEJIDAD_ALTA',
        characteristics: ['Muchas subtareas', 'Poco avance', 'Necesita estructuración'],
        riskLevel: 'medium'
      };
    }
    
    // En progreso normal
    return {
      name: 'PROGRESO_NORMAL',
      characteristics: ['Avance constante', 'Actividad reciente', 'Ritmo adecuado'],
      riskLevel: 'low'
    };
  }
}

interface TaskAnalysisPattern {
  name: string;
  characteristics: string[];
  riskLevel: 'low' | 'medium' | 'high';
}
