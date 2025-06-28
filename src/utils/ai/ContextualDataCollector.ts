
import { 
  ContextualData, 
  DataCollectionRule, 
  ContextualDataConfig, 
  DataAggregationResult, 
  ContextualDataQuery 
} from '@/types/contextual-data';
import { Task } from '@/hooks/useTasks';
import { TaskSession } from '@/hooks/useTaskSessions';
import { Project } from '@/hooks/useProjects';

// Import the new modular collectors
import { DataCollectionUtils } from './contextual-data/DataCollectionUtils';
import { UserBehaviorCollector } from './contextual-data/UserBehaviorCollector';
import { TaskPatternCollector } from './contextual-data/TaskPatternCollector';
import { ProductivityCollector } from './contextual-data/ProductivityCollector';
import { EnvironmentalCollector } from './contextual-data/EnvironmentalCollector';
import { TemporalCollector } from './contextual-data/TemporalCollector';
import { DataAggregator } from './contextual-data/DataAggregator';
import { DataQueryEngine } from './contextual-data/DataQueryEngine';

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

    this.rules = DataCollectionUtils.createDefaultRules();
    DataCollectionUtils.startPeriodicCollection(this.rules, this.collectionIntervals);
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
        const behaviorData = UserBehaviorCollector.collectUserBehaviorData(tasks, sessions, timestamp);
        collectedData.push(...behaviorData);
      }

      // Recopilar patrones de tareas
      if (this.config.enableTaskPatternTracking) {
        const patternData = TaskPatternCollector.collectTaskPatternData(tasks, projects, timestamp);
        collectedData.push(...patternData);
      }

      // Recopilar métricas de productividad
      if (this.config.enableProductivityMetrics) {
        const productivityData = ProductivityCollector.collectProductivityMetrics(sessions, timestamp);
        collectedData.push(...productivityData);
      }

      // Recopilar datos ambientales
      if (this.config.enableEnvironmentalData) {
        const environmentalData = EnvironmentalCollector.collectEnvironmentalData(currentContext, timestamp);
        collectedData.push(...environmentalData);
      }

      // Recopilar datos temporales
      if (this.config.enableTemporalData) {
        const temporalData = TemporalCollector.collectTemporalData(timestamp);
        collectedData.push(...temporalData);
      }

      // Almacenar datos recopilados
      DataCollectionUtils.storeCollectedData(
        collectedData, 
        this.dataStorage, 
        this.config.maxDataPointsPerType
      );

      // Limpiar datos expirados
      DataCollectionUtils.cleanExpiredData(this.dataStorage, this.config.defaultRetentionHours);

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
    return DataQueryEngine.queryContextualData(
      this.dataStorage, 
      query, 
      this.config.minRelevanceScore
    );
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
    const aggregatedData = DataAggregator.performDataAggregation(relevantData);
    
    // Calcular tendencias
    const trends = DataAggregator.calculateTrends(relevantData, timeRange);

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
