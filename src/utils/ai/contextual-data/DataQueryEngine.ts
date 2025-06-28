
import { ContextualData, ContextualDataQuery } from '@/types/contextual-data';

export class DataQueryEngine {
  /**
   * Queries contextual data based on provided criteria
   */
  static queryContextualData(
    storage: Map<string, ContextualData[]>,
    query: ContextualDataQuery,
    minRelevanceScore: number
  ): ContextualData[] {
    let results: ContextualData[] = [];

    // Recopilar datos de todos los tipos
    for (const [type, dataPoints] of storage.entries()) {
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
    const minRelevance = query.minRelevanceScore || minRelevanceScore;
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
}
