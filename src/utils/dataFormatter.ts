/**
 * SUBTAREA 3: Preparación y formateo de datos para IA
 * Formatea los datos de ComprehensiveReportDataService para consumo por IA
 */

import { ComprehensiveReportData } from '@/services/comprehensiveReportDataService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export interface FormattedDataForAI {
  periodo: {
    inicio: string;
    fin: string;
    tipo: string;
    duracionDias: number;
  };
  resumenEjecutivo: {
    estadoActual: any;
    datosDelPeriodo: any;
  };
  metricas: {
    principales: any;
    comparativas?: any;
  };
  proyectos: Array<{
    nombre: string;
    estado: string;
    progreso: number;
    tareas: number;
    completadas: number;
    tiempoInvertido: string;
    eficiencia: number;
  }>;
  tareas: Array<{
    titulo: string;
    estado: string;
    prioridad: string;
    proyecto: string;
    tiempoEstimado?: string;
    tiempoReal?: string;
    fechaCompletada?: string;
  }>;
  sesiones: Array<{
    fecha: string;
    duracion: string;
    productividad: number;
    tarea?: string;
  }>;
  insights: {
    tendencias: any;
    recomendaciones: string[];
    patrones: string[];
  };
}

/**
 * Formatea los datos comprehensivos para consumo por IA
 */
export function formatReportDataForAI(data: ComprehensiveReportData): FormattedDataForAI {
  console.log('🔄 Formateando datos para IA:', {
    proyectos: data.projects.length,
    tareas: data.tasks?.length || 0,
    sesiones: data.sessions.length
  });

  try {
    // Formatear período
    const startDate = parseISO(data.period.start);
    const endDate = parseISO(data.period.end);
    const duracionDias = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Formatear proyectos
    const proyectosFormateados = data.projects.map(project => ({
      nombre: project.name || 'Sin nombre',
      estado: translateStatus(project.status),
      progreso: Math.round(project.progress || 0),
      tareas: project.totalTasks,
      completadas: project.completedTasks,
      tiempoInvertido: formatMinutes(project.timeSpent),
      eficiencia: Math.round(project.efficiency || 100)
    }));

    // Formatear tareas
    const tareasFormateadas = (data.tasks || []).slice(0, 50).map(task => ({
      titulo: task.title || 'Sin título',
      estado: translateStatus(task.status),
      prioridad: translatePriority(task.priority),
      proyecto: task.project_name || 'Sin proyecto',
      tiempoEstimado: task.estimated_duration ? formatMinutes(task.estimated_duration) : undefined,
      tiempoReal: task.actual_duration ? formatMinutes(task.actual_duration) : undefined,
      fechaCompletada: task.completed_at ? formatDate(task.completed_at) : undefined
    }));

    // Formatear sesiones
    const sesionesFormateadas = data.sessions.slice(0, 30).map(session => ({
      fecha: formatDate(session.started_at),
      duracion: formatMinutes(session.duration_minutes || 0),
      productividad: session.productivity_score || 0,
      tarea: session.task?.title || undefined
    }));

    // Generar insights y recomendaciones
    const insights = generateInsights(data);

    const formattedData: FormattedDataForAI = {
      periodo: {
        inicio: formatDate(data.period.start),
        fin: formatDate(data.period.end),
        tipo: data.period.type === 'weekly' ? 'Semanal' : 'Mensual',
        duracionDias
      },
      resumenEjecutivo: {
        estadoActual: {
          proyectosActivos: data.currentState.activeProjects,
          totalTareas: data.currentState.totalTasks,
          tareasPendientes: data.currentState.pendingTasks,
          tareasEnProgreso: data.currentState.inProgressTasks,
          tareasCompletadas: data.currentState.completedTasksTotal,
          tareasVencidas: data.currentState.overdueTasksTotal
        },
        datosDelPeriodo: {
          tareasCompletadas: data.periodData.tasksCompleted,
          tareasCreadas: data.periodData.tasksCreated,
          tiempoTrabajado: formatMinutes(data.periodData.timeWorked),
          sesiones: data.periodData.sessionsCount,
          productividadPromedio: Math.round(data.periodData.avgProductivity * 10) / 10,
          proyectosTrabajados: data.periodData.projectsWorkedOn
        }
      },
      metricas: {
        principales: {
          tasasDeComplecion: Math.round(data.insights.completionRate),
          eficiencia: Math.round(data.insights.efficiency),
          duracionPromedioPorTarea: formatMinutes(data.insights.avgTaskDuration),
          proyectoMasProductivo: data.insights.mostProductiveProject,
          tendenciaProductividad: data.insights.trends.productivityTrend,
          tareasPromedioPorDia: Math.round(data.insights.trends.tasksPerDay * 10) / 10,
          horasPromedioPorDia: Math.round(data.insights.trends.hoursPerDay * 10) / 10
        },
        comparativas: data.comparison ? {
          periodoAnterior: {
            tareasCompletadas: data.comparison.previousPeriod.tasksCompleted,
            tiempoTrabajado: formatMinutes(data.comparison.previousPeriod.timeWorked),
            productividad: Math.round(data.comparison.previousPeriod.productivity * 10) / 10
          },
          cambios: {
            tareas: formatPercentage(data.comparison.changes.tasksChange),
            tiempo: formatPercentage(data.comparison.changes.timeChange),
            productividad: formatPercentage(data.comparison.changes.productivityChange)
          }
        } : undefined
      },
      proyectos: proyectosFormateados,
      tareas: tareasFormateadas,
      sesiones: sesionesFormateadas,
      insights
    };

    console.log('✅ Datos formateados exitosamente para IA:', {
      proyectos: formattedData.proyectos.length,
      tareas: formattedData.tareas.length,
      sesiones: formattedData.sesiones.length,
      tieneComparacion: !!formattedData.metricas.comparativas
    });

    return formattedData;

  } catch (error) {
    console.error('❌ Error formateando datos para IA:', error);
    
    // Retornar datos mínimos en caso de error
    return {
      periodo: {
        inicio: 'Error',
        fin: 'Error',
        tipo: data.period.type === 'weekly' ? 'Semanal' : 'Mensual',
        duracionDias: 0
      },
      resumenEjecutivo: {
        estadoActual: data.currentState,
        datosDelPeriodo: data.periodData
      },
      metricas: {
        principales: {
          tasasDeComplecion: 0,
          eficiencia: 0,
          duracionPromedioPorTarea: '0min',
          proyectoMasProductivo: 'N/A',
          tendenciaProductividad: 'stable',
          tareasPromedioPorDia: 0,
          horasPromedioPorDia: 0
        }
      },
      proyectos: [],
      tareas: [],
      sesiones: [],
      insights: {
        tendencias: {},
        recomendaciones: ['Error al procesar datos'],
        patrones: []
      }
    };
  }
}

/**
 * Genera insights inteligentes basados en los datos
 */
function generateInsights(data: ComprehensiveReportData): {
  tendencias: any;
  recomendaciones: string[];
  patrones: string[];
} {
  const recommendations: string[] = [];
  const patterns: string[] = [];

  // Analizar tasa de completación
  if (data.insights.completionRate < 70) {
    recommendations.push('Mejorar planificación: tasa de completación baja (< 70%)');
  } else if (data.insights.completionRate > 90) {
    recommendations.push('Excelente ejecución: mantener el momentum actual');
  }

  // Analizar eficiencia
  if (data.insights.efficiency < 80) {
    recommendations.push('Revisar estimaciones de tiempo: eficiencia por debajo del 80%');
  }

  // Analizar carga de trabajo
  if (data.insights.trends.hoursPerDay > 8) {
    recommendations.push('Considerar redistribuir carga de trabajo: > 8h promedio diarias');
  } else if (data.insights.trends.hoursPerDay < 4) {
    recommendations.push('Oportunidad de incrementar productividad: < 4h promedio diarias');
  }

  // Patrones de trabajo
  if (data.periodData.sessionsCount > 0) {
    const avgSessionDuration = data.periodData.timeWorked / data.periodData.sessionsCount;
    if (avgSessionDuration < 30) {
      patterns.push('Sesiones de trabajo cortas: promedio < 30min');
    } else if (avgSessionDuration > 120) {
      patterns.push('Sesiones de trabajo largas: promedio > 2h');
    }
  }

  // Análisis de proyectos
  const activeProjects = data.projects.filter(p => p.completedTasks > 0);
  if (activeProjects.length > 5) {
    recommendations.push('Considerar enfocar en menos proyectos simultáneos');
  }

  return {
    tendencias: {
      productividad: data.insights.trends.productivityTrend,
      tareasPromedio: data.insights.trends.tasksPerDay,
      tiempoPromedio: data.insights.trends.hoursPerDay
    },
    recomendaciones: recommendations,
    patrones: patterns
  };
}

/**
 * Traduce estados del inglés al español
 */
function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completada',
    active: 'Activo',
    paused: 'Pausado',
    archived: 'Archivado'
  };
  
  return translations[status] || status;
}

/**
 * Traduce prioridades del inglés al español
 */
function translatePriority(priority: string): string {
  const translations: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  };
  
  return translations[priority] || priority;
}

/**
 * Formatea minutos a string legible
 */
function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }
}

/**
 * Formatea fecha para display
 */
function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  } catch (error) {
    return dateString;
  }
}

/**
 * Formatea porcentaje con signo
 */
function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${Math.round(value)}%`;
}

/**
 * Valida que los datos tengan la estructura mínima requerida
 */
export function validateDataForAI(data: ComprehensiveReportData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones críticas
  if (!data.period) {
    errors.push('Datos de período requeridos');
  }

  if (!data.currentState) {
    errors.push('Estado actual requerido');
  }

  if (!data.periodData) {
    errors.push('Datos del período requeridos');
  }

  // Validaciones de advertencia
  if (!data.tasks || data.tasks.length === 0) {
    warnings.push('No hay tareas para mostrar en el reporte');
  }

  if (!data.projects || data.projects.length === 0) {
    warnings.push('No hay proyectos para analizar');
  }

  if (!data.sessions || data.sessions.length === 0) {
    warnings.push('No hay sesiones de trabajo registradas');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}