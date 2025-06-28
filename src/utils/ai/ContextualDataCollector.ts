
import { ContextualData, DataCollectionRule, ContextualDataConfig, DataAggregationResult, DataTrend, ContextualDataQuery } from '@/types/contextual-data';
import { Task } from '@/hooks/useTasks';
import { TaskSession } from '@/hooks/useTaskSessions';
import { Project } from '@/hooks/useProjects';
import { addHours, subHours, startOfDay, endOfDay, differenceInHours, getHours, getDay } from 'date-fns';

export class ContextualDataCollector {
  private config: ContextualDataConfig;
  private rules: DataCollectionRule[] = [];
  private dataStorage: Map<string, ContextualData[]> = new Map();
  private collectionIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<ContextualDataConfig> = {}) {
    this.config = {
      enableUserBehaviorTracking: true,
      enableTaskPatternTracking: true,
      enableProductivityMetrics: true,
      enableEnvironmentalData: true,
      enableTemporalData: true,
      maxDataPointsPerType: 1000,
      defaultRetentionHours: 168, // 7 días
      minRelevanceScore: 0.1,
      aggregationInterval: 15, // 15 minutos
      ...config,
    };

    this.initializeDefaultRules();
    this.startPeriodicCollection();
  }

  /**
   * Recopila datos contextuales de múltiples fuentes
   */
  public async collectContextualData(
    tasks: Task[],
    sessions: TaskSession[],
    projects: Project[],
    currentContext?: Record<string, any>
  ): Promise<ContextualData[]> {
    const collectedData: ContextualData[] = [];
    const timestamp = new Date();

    try {
      // Recopilar datos de comportamiento del usuario
      if (this.config.enableUserBehaviorTracking) {
        const behaviorData = this.collectUserBehaviorData(tasks, sessions, timestamp);
        collectedData.push(...behaviorData);
      }

      // Recopilar patrones de tareas
      if (this.config.enableTaskPatternTracking) {
        const patternData = this.collectTaskPatternData(tasks, projects, timestamp);
        collectedData.push(...patternData);
      }

      // Recopilar métricas de productividad
      if (this.config.enableProductivityMetrics) {
        const productivityData = this.collectProductivityMetrics(sessions, timestamp);
        collectedData.push(...productivityData);
      }

      // Recopilar datos ambientales
      if (this.config.enableEnvironmentalData) {
        const environmentalData = this.collectEnvironmentalData(currentContext, timestamp);
        collectedData.push(...environmentalData);
      }

      // Recopilar datos temporales
      if (this.config.enableTemporalData) {
        const temporalData = this.collectTemporalData(timestamp);
        collectedData.push(...temporalData);
      }

      // Almacenar datos recopilados
      this.storeCollectedData(collectedData);

      // Limpiar datos expirados
      this.cleanExpiredData();

      return collectedData;

    } catch (error) {
      console.error('Error collecting contextual data:', error);
      return [];
    }
  }

  /**
   * Obtiene datos contextuales según consulta
   */
  public queryContextualData(query: ContextualDataQuery): ContextualData[] {
    let results: ContextualData[] = [];

    // Recopilar datos de todos los tipos
    for (const [type, dataPoints] of this.dataStorage.entries()) {
      results.push(...dataPoints);
    }

    // Filtrar por tipos
    if (query.types) {
      results = results.filter(data => query.types!.includes(data.type));
    }

    // Filtrar por categorías
    if (query.categories) {
      results = results.filter(data => query.categories!.includes(data.category));
    }

    // Filtrar por rango de tiempo
    if (query.timeRange) {
      results = results.filter(data => 
        data.timestamp >= query.timeRange!.start && 
        data.timestamp <= query.timeRange!.end
      );
    }

    // Filtrar por relevancia mínima
    const minRelevance = query.minRelevanceScore || this.config.minRelevanceScore;
    results = results.filter(data => data.relevanceScore >= minRelevance);

    // Ordenar
    const orderBy = query.orderBy || 'timestamp';
    const orderDirection = query.orderDirection || 'desc';
    
    results.sort((a, b) => {
      const aVal = orderBy === 'timestamp' ? a.timestamp.getTime() : a.relevanceScore;
      const bVal = orderBy === 'timestamp' ? b.timestamp.getTime() : b.relevanceScore;
      
      return orderDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Limitar resultados
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Agrega datos contextuales
   */
  public aggregateContextualData(
    type: ContextualData['type'],
    timeRange: { start: Date; end: Date }
  ): DataAggregationResult {
    const relevantData = this.queryContextualData({
      types: [type],
      timeRange,
    });

    if (relevantData.length === 0) {
      return {
        type,
        aggregatedData: {},
        dataPoints: 0,
        timeRange,
        confidence: 0,
        trends: [],
      };
    }

    // Agregar datos
    const aggregatedData = this.performDataAggregation(relevantData);
    
    // Calcular tendencias
    const trends = this.calculateTrends(relevantData, timeRange);

    // Calcular confianza
    const confidence = relevantData.reduce((sum, d) => sum + d.relevanceScore, 0) / relevantData.length;

    return {
      type,
      aggregatedData,
      dataPoints: relevantData.length,
      timeRange,
      confidence,
      trends,
    };
  }

  /**
   * Métodos privados para recopilación de datos específicos
   */
  private collectUserBehaviorData(tasks: Task[], sessions: TaskSession[], timestamp: Date): ContextualData[] {
    const data: ContextualData[] = [];

    // Patrón de creación de tareas
    const recentTasks = tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      return differenceInHours(timestamp, taskDate) <= 24;
    });

    if (recentTasks.length > 0) {
      data.push({
        id: `user-behavior-tasks-${timestamp.getTime()}`,
        type: 'user_behavior',
        category: 'real_time',
        data: {
          tasksCreatedLast24h: recentTasks.length,
          avgTasksPerHour: recentTasks.length / 24,
          taskStatusDistribution: this.getTaskStatusDistribution(recentTasks),
          taskPriorityDistribution: this.getTaskPriorityDistribution(recentTasks),
        },
        timestamp,
        relevanceScore: Math.min(recentTasks.length / 10, 1), // Más tareas = más relevante
        source: 'task_creation_patterns',
        metadata: {
          collectionMethod: 'automatic',
          confidence: 0.8,
          dataSources: ['tasks'],
        },
      });
    }

    // Patrones de sesiones de trabajo
    const recentSessions = sessions.filter(session => {
      const sessionDate = new Date(session.started_at);
      return differenceInHours(timestamp, sessionDate) <= 24;
    });

    if (recentSessions.length > 0) {
      data.push({
        id: `user-behavior-sessions-${timestamp.getTime()}`,
        type: 'user_behavior',
        category: 'real_time',
        data: {
          sessionsLast24h: recentSessions.length,
          avgSessionDuration: recentSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / recentSessions.length,
          avgProductivityScore: recentSessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / recentSessions.length,
        },
        timestamp,
        relevanceScore: Math.min(recentSessions.length / 5, 1),
        source: 'work_session_patterns',
        metadata: {
          collectionMethod: 'automatic',
          confidence: 0.9,
          dataSources: ['task_sessions'],
        },
      });
    }

    return data;
  }

  private collectTaskPatternData(tasks: Task[], projects: Project[], timestamp: Date): ContextualData[] {
    const data: ContextualData[] = [];

    // Análisis de distribución de tareas por proyecto
    const projectDistribution = this.getProjectTaskDistribution(tasks, projects);
    
    data.push({
      id: `task-patterns-projects-${timestamp.getTime()}`,
      type: 'task_patterns',
      category: 'historical',
      data: {
        projectDistribution,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        tasksPerProject: projectDistribution,
      },
      timestamp,
      relevanceScore: projects.length > 0 ? 0.8 : 0.3,
      source: 'project_task_analysis',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 0.85,
        dataSources: ['tasks', 'projects'],
      },
    });

    // Análisis de patrones de deadline
    const deadlinePatterns = this.analyzeDeadlinePatterns(tasks, timestamp);
    
    data.push({
      id: `task-patterns-deadlines-${timestamp.getTime()}`,
      type: 'task_patterns',
      category: 'predictive',
      data: deadlinePatterns,
      timestamp,
      relevanceScore: deadlinePatterns.tasksWithDeadlines > 0 ? 0.9 : 0.2,
      source: 'deadline_pattern_analysis',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 0.7,
        dataSources: ['tasks'],
      },
    });

    return data;
  }

  private collectProductivityMetrics(sessions: TaskSession[], timestamp: Date): ContextualData[] {
    const data: ContextualData[] = [];

    if (sessions.length === 0) return data;

    // Métricas de productividad por hora del día
    const hourlyProductivity = this.calculateHourlyProductivity(sessions);
    
    data.push({
      id: `productivity-hourly-${timestamp.getTime()}`,
      type: 'productivity_metrics',
      category: 'historical',
      data: {
        hourlyProductivity,
        peakHours: this.findPeakProductivityHours(hourlyProductivity),
        averageProductivity: Object.values(hourlyProductivity).reduce((a, b) => a + b, 0) / 24,
      },
      timestamp,
      relevanceScore: 0.9,
      source: 'productivity_analysis',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 0.85,
        dataSources: ['task_sessions'],
      },
    });

    return data;
  }

  private collectEnvironmentalData(context: Record<string, any> | undefined, timestamp: Date): ContextualData[] {
    const data: ContextualData[] = [];

    if (!context) return data;

    // Datos del navegador/entorno
    const environmentalInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      ...context,
    };

    data.push({
      id: `environmental-${timestamp.getTime()}`,
      type: 'environmental',
      category: 'real_time',
      data: environmentalInfo,
      timestamp,
      relevanceScore: 0.4,
      source: 'browser_environment',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 0.6,
        dataSources: ['browser_api', 'context'],
      },
    });

    return data;
  }

  private collectTemporalData(timestamp: Date): ContextualData[] {
    const data: ContextualData[] = [];

    const temporalInfo = {
      hour: getHours(timestamp),
      dayOfWeek: getDay(timestamp),
      isWeekend: getDay(timestamp) === 0 || getDay(timestamp) === 6,
      isBusinessHours: getHours(timestamp) >= 9 && getHours(timestamp) < 17,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      quarterOfDay: Math.floor(getHours(timestamp) / 6), // 0-3
    };

    data.push({
      id: `temporal-${timestamp.getTime()}`,
      type: 'temporal',
      category: 'real_time',
      data: temporalInfo,
      timestamp,
      relevanceScore: 0.7,
      source: 'temporal_analysis',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 1.0,
        dataSources: ['system_time'],
      },
    });

    return data;
  }

  /**
   * Métodos auxiliares
   */
  private initializeDefaultRules(): void {
    // Reglas por defecto para recopilación de datos
    this.rules = [
      {
        id: 'user-behavior-periodic',
        name: 'Comportamiento del usuario periódico',
        type: 'user_behavior',
        isActive: true,
        frequency: 'periodic',
        interval: 15 * 60 * 1000, // 15 minutos
        conditions: [],
        priority: 2,
        maxDataPoints: 100,
        retentionHours: 48,
        createdAt: new Date(),
      },
      {
        id: 'productivity-realtime',
        name: 'Métricas de productividad en tiempo real',
        type: 'productivity_metrics',
        isActive: true,
        frequency: 'real_time',
        conditions: [],
        priority: 1,
        maxDataPoints: 200,
        retentionHours: 72,
        createdAt: new Date(),
      },
    ];
  }

  private startPeriodicCollection(): void {
    this.rules
      .filter(rule => rule.isActive && rule.frequency === 'periodic' && rule.interval)
      .forEach(rule => {
        const interval = setInterval(() => {
          // Aquí se ejecutaría la recopilación periódica
          console.log(`Executing periodic collection for rule: ${rule.name}`);
        }, rule.interval!);
        
        this.collectionIntervals.set(rule.id, interval);
      });
  }

  private storeCollectedData(data: ContextualData[]): void {
    data.forEach(item => {
      const typeKey = item.type;
      
      if (!this.dataStorage.has(typeKey)) {
        this.dataStorage.set(typeKey, []);
      }
      
      const typeData = this.dataStorage.get(typeKey)!;
      typeData.push(item);
      
      // Limitar número de datos por tipo
      if (typeData.length > this.config.maxDataPointsPerType) {
        typeData.splice(0, typeData.length - this.config.maxDataPointsPerType);
      }
    });
  }

  private cleanExpiredData(): void {
    const now = new Date();
    
    for (const [type, dataPoints] of this.dataStorage.entries()) {
      const validData = dataPoints.filter(data => {
        if (data.expiresAt) {
          return data.expiresAt > now;
        }
        // Usar retención por defecto
        const expiryTime = addHours(data.timestamp, this.config.defaultRetentionHours);
        return expiryTime > now;
      });
      
      this.dataStorage.set(type, validData);
    }
  }

  private getTaskStatusDistribution(tasks: Task[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    tasks.forEach(task => {
      distribution[task.status] = (distribution[task.status] || 0) + 1;
    });
    return distribution;
  }

  private getTaskPriorityDistribution(tasks: Task[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    tasks.forEach(task => {
      distribution[task.priority] = (distribution[task.priority] || 0) + 1;
    });
    return distribution;
  }

  private getProjectTaskDistribution(tasks: Task[], projects: Project[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    projects.forEach(project => {
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      distribution[project.name] = projectTasks.length;
    });
    
    // Tareas sin proyecto
    const tasksWithoutProject = tasks.filter(task => !task.project_id);
    if (tasksWithoutProject.length > 0) {
      distribution['Sin proyecto'] = tasksWithoutProject.length;
    }
    
    return distribution;
  }

  private analyzeDeadlinePatterns(tasks: Task[], currentTime: Date): Record<string, any> {
    const tasksWithDeadlines = tasks.filter(task => task.due_date);
    
    if (tasksWithDeadlines.length === 0) {
      return { tasksWithDeadlines: 0 };
    }

    const now = currentTime.getTime();
    const overdue = tasksWithDeadlines.filter(task => new Date(task.due_date!).getTime() < now);
    const dueSoon = tasksWithDeadlines.filter(task => {
      const deadline = new Date(task.due_date!).getTime();
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
      return hoursUntilDeadline > 0 && hoursUntilDeadline <= 48;
    });

    return {
      tasksWithDeadlines: tasksWithDeadlines.length,
      overdueTasks: overdue.length,
      dueSoonTasks: dueSoon.length,
      overduePercentage: (overdue.length / tasksWithDeadlines.length) * 100,
      avgDaysToDeadline: tasksWithDeadlines.reduce((sum, task) => {
        const days = (new Date(task.due_date!).getTime() - now) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, days);
      }, 0) / tasksWithDeadlines.length,
    };
  }

  private calculateHourlyProductivity(sessions: TaskSession[]): Record<number, number> {
    const hourlyData: Record<number, number[]> = {};
    
    // Inicializar todas las horas
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = [];
    }
    
    sessions.forEach(session => {
      if (session.productivity_score !== null) {
        const hour = getHours(new Date(session.started_at));
        hourlyData[hour].push(session.productivity_score);
      }
    });
    
    // Calcular promedio por hora
    const hourlyProductivity: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      const scores = hourlyData[i];
      hourlyProductivity[i] = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
    }
    
    return hourlyProductivity;
  }

  private findPeakProductivityHours(hourlyProductivity: Record<number, number>): number[] {
    const entries = Object.entries(hourlyProductivity);
    const avgProductivity = entries.reduce((sum, [_, score]) => sum + score, 0) / entries.length;
    
    return entries
      .filter(([_, score]) => score > avgProductivity * 1.2) // 20% por encima del promedio
      .map(([hour, _]) => parseInt(hour))
      .sort((a, b) => hourlyProductivity[b] - hourlyProductivity[a]);
  }

  private performDataAggregation(data: ContextualData[]): Record<string, any> {
    const aggregated: Record<string, any> = {};
    
    // Agrupar por claves comunes
    const commonKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item.data).forEach(key => commonKeys.add(key));
    });
    
    commonKeys.forEach(key => {
      const values = data
        .map(item => item.data[key])
        .filter(value => value !== undefined && value !== null);
      
      if (values.length > 0) {
        // Calcular estadísticas según el tipo de dato
        if (typeof values[0] === 'number') {
          aggregated[key] = {
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length,
          };
        } else if (typeof values[0] === 'object') {
          // Para objetos, mantener el más reciente
          aggregated[key] = values[values.length - 1];
        } else {
          // Para strings u otros tipos, contar frecuencias
          const frequency: Record<string, number> = {};
          values.forEach(val => {
            const strVal = String(val);
            frequency[strVal] = (frequency[strVal] || 0) + 1;
          });
          aggregated[key] = frequency;
        }
      }
    });
    
    return aggregated;
  }

  private calculateTrends(data: ContextualData[], timeRange: { start: Date; end: Date }): DataTrend[] {
    // Implementación simplificada de cálculo de tendencias
    // En una implementación real, esto sería más sofisticado
    const trends: DataTrend[] = [];
    
    // Analizar tendencias básicas
    const numericKeys = new Set<string>();
    data.forEach(item => {
      Object.entries(item.data).forEach(([key, value]) => {
        if (typeof value === 'number') {
          numericKeys.add(key);
        }
      });
    });
    
    numericKeys.forEach(key => {
      const values = data
        .map(item => ({ value: item.data[key], timestamp: item.timestamp }))
        .filter(item => typeof item.value === 'number')
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      if (values.length >= 2) {
        const firstValue = values[0].value;
        const lastValue = values[values.length - 1].value;
        const change = ((lastValue - firstValue) / firstValue) * 100;
        
        trends.push({
          metric: key,
          direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
          magnitude: Math.abs(change),
          confidence: Math.min(values.length / 10, 1), // Más datos = más confianza
          timespan: differenceInHours(timeRange.end, timeRange.start),
        });
      }
    });
    
    return trends;
  }

  // Métodos públicos adicionales
  public getStoredDataSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    
    for (const [type, dataPoints] of this.dataStorage.entries()) {
      summary[type] = dataPoints.length;
    }
    
    return summary;
  }

  public clearAllData(): void {
    this.dataStorage.clear();
  }

  public updateConfig(newConfig: Partial<ContextualDataConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ContextualDataConfig {
    return { ...this.config };
  }

  public destroy(): void {
    // Limpiar intervalos
    this.collectionIntervals.forEach(interval => clearInterval(interval));
    this.collectionIntervals.clear();
    
    // Limpiar datos
    this.dataStorage.clear();
  }
}

// Instancia por defecto
export const defaultContextualDataCollector = new ContextualDataCollector();
