
import { TaskContext } from '@/utils/taskContext';

/**
 * Constructor de prompts ultra-concisos para análisis directo
 */
export class IntelligentPromptBuilder {
  
  /**
   * Construye prompt ultra-conciso para respuestas directas
   */
  static buildContextualAnalysisPrompt(context: TaskContext): { systemPrompt: string; userPrompt: string } {
    const { mainTask, completionStatus, recentLogs } = context;
    
    const daysSinceCreated = Math.floor(
      (new Date().getTime() - new Date(mainTask.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const daysSinceLastActivity = recentLogs.length > 0 ? 
      Math.floor((new Date().getTime() - new Date(recentLogs[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
      999;

    const systemPrompt = `Eres un analista de tareas que da respuestas SÚPER CONCISAS y DIRECTAS.

REGLAS ESTRICTAS:
- MÁXIMO 50 PALABRAS POR SECCIÓN
- SÉ ESPECÍFICO, USA EL TÍTULO REAL
- NO USES BACKTICKS \`\`\` NI MARKDOWN
- NO TEXTO DECORATIVO
- RESPUESTA TOTAL: MÁXIMO 3 LÍNEAS

FORMATO EXACTO:
ESTADO: [1 línea sobre qué pasa exactamente]
PRÓXIMO: [1 línea con 3 acciones concretas para HOY]  
RIESGO: [1 línea sobre nivel de riesgo y por qué]`;

    const userPrompt = `TAREA: "${mainTask.title}"
PROGRESO: ${completionStatus.overallProgress}%
DÍAS CREADA: ${daysSinceCreated}
DÍAS SIN ACTIVIDAD: ${daysSinceLastActivity}
SUBTAREAS: ${completionStatus.completedSubtasks}/${completionStatus.totalSubtasks}

Analiza esta tarea específica y responde SÚPER CONCISO usando el FORMATO EXACTO.`;

    return { systemPrompt, userPrompt };
  }
}
