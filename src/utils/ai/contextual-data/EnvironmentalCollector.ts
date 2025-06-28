
import { ContextualData } from '@/types/contextual-data';

export class EnvironmentalCollector {
  static collectEnvironmentalData(
    context: Record<string, any> | undefined, 
    timestamp: Date
  ): ContextualData[] {
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
}
