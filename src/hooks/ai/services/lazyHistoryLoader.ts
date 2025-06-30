
import { EnhancedMessage } from '../types/enhancedAITypes';
import { messageHistoryService } from './messageHistoryService';

interface LazyLoadConfig {
  batchSize: number;
  maxBatches: number;
  loadThreshold: number; // Número de mensajes restantes para cargar más
  cacheSize: number; // Máximo de mensajes en memoria
}

interface LazyLoadState {
  isLoading: boolean;
  hasMore: boolean;
  currentOffset: number;
  totalCount: number;
  loadedBatches: number;
  error: string | null;
}

class LazyHistoryLoader {
  private config: LazyLoadConfig = {
    batchSize: 20,
    maxBatches: 50, // Máximo 1000 mensajes
    loadThreshold: 5,
    cacheSize: 200
  };

  private state: LazyLoadState = {
    isLoading: false,
    hasMore: true,
    currentOffset: 0,
    totalCount: 0,
    loadedBatches: 0,
    error: null
  };

  private messageCache = new Map<string, EnhancedMessage[]>();
  private cacheKeys: string[] = [];

  constructor(config?: Partial<LazyLoadConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Cargar lote inicial de mensajes
  async loadInitialBatch(userId: string): Promise<{
    messages: EnhancedMessage[];
    state: LazyLoadState;
  }> {
    if (this.state.isLoading) {
      return { messages: [], state: this.state };
    }

    this.state.isLoading = true;
    this.state.error = null;

    try {
      console.log('📚 LazyHistoryLoader: Cargando lote inicial...');
      
      // Cargar primer lote desde BD
      const messages = await this.loadBatchFromDB(userId, 0, this.config.batchSize);
      
      if (messages.length > 0) {
        // Cachear el lote
        const cacheKey = this.getCacheKey(userId, 0);
        this.setCacheEntry(cacheKey, messages);
        
        this.state.currentOffset = messages.length;
        this.state.loadedBatches = 1;
        this.state.hasMore = messages.length === this.config.batchSize;
        
        console.log(`✅ LazyHistoryLoader: Lote inicial cargado - ${messages.length} mensajes`);
      } else {
        this.state.hasMore = false;
        console.log('📭 LazyHistoryLoader: No hay mensajes en el historial');
      }

      this.state.isLoading = false;
      return { messages, state: { ...this.state } };
      
    } catch (error) {
      console.error('❌ LazyHistoryLoader: Error cargando lote inicial:', error);
      this.state.error = error instanceof Error ? error.message : 'Error desconocido';
      this.state.isLoading = false;
      return { messages: [], state: { ...this.state } };
    }
  }

  // Cargar siguiente lote de mensajes
  async loadNextBatch(userId: string): Promise<{
    messages: EnhancedMessage[];
    state: LazyLoadState;
  }> {
    if (this.state.isLoading || !this.state.hasMore) {
      return { messages: [], state: this.state };
    }

    if (this.state.loadedBatches >= this.config.maxBatches) {
      console.log('⚠️ LazyHistoryLoader: Máximo de lotes alcanzado');
      this.state.hasMore = false;
      return { messages: [], state: this.state };
    }

    this.state.isLoading = true;
    this.state.error = null;

    try {
      console.log(`📚 LazyHistoryLoader: Cargando lote ${this.state.loadedBatches + 1}...`);
      
      // Verificar cache primero
      const cacheKey = this.getCacheKey(userId, this.state.currentOffset);
      const cachedMessages = this.getCacheEntry(cacheKey);
      
      let messages: EnhancedMessage[];
      
      if (cachedMessages) {
        console.log('🚀 LazyHistoryLoader: Cache hit para lote');
        messages = cachedMessages;
      } else {
        // Cargar desde BD
        messages = await this.loadBatchFromDB(userId, this.state.currentOffset, this.config.batchSize);
        
        if (messages.length > 0) {
          this.setCacheEntry(cacheKey, messages);
        }
      }
      
      if (messages.length > 0) {
        this.state.currentOffset += messages.length;
        this.state.loadedBatches++;
        this.state.hasMore = messages.length === this.config.batchSize;
        
        console.log(`✅ LazyHistoryLoader: Lote ${this.state.loadedBatches} cargado - ${messages.length} nuevos mensajes`);
      } else {
        this.state.hasMore = false;
        console.log('📭 LazyHistoryLoader: No hay más mensajes');
      }

      this.state.isLoading = false;
      return { messages, state: { ...this.state } };
      
    } catch (error) {
      console.error('❌ LazyHistoryLoader: Error cargando siguiente lote:', error);
      this.state.error = error instanceof Error ? error.message : 'Error desconocido';
      this.state.isLoading = false;
      return { messages: [], state: { ...this.state } };
    }
  }

  // Verificar si debe cargar más mensajes
  shouldLoadMore(currentMessageCount: number): boolean {
    if (!this.state.hasMore || this.state.isLoading) {
      return false;
    }
    
    // Cargar más si estamos cerca del final
    const remainingMessages = this.state.currentOffset - currentMessageCount;
    return remainingMessages <= this.config.loadThreshold;
  }

  // Cargar lote desde base de datos
  private async loadBatchFromDB(userId: string, offset: number, limit: number): Promise<EnhancedMessage[]> {
    // Usamos el servicio existente pero con paginación
    const allMessages = await messageHistoryService.loadConversationHistory(userId);
    
    // Simular paginación (en producción esto debería ser una query SQL con OFFSET/LIMIT)
    const startIndex = Math.max(0, allMessages.length - offset - limit);
    const endIndex = Math.max(0, allMessages.length - offset);
    
    return allMessages.slice(startIndex, endIndex).reverse();
  }

  // Gestión de cache
  private getCacheKey(userId: string, offset: number): string {
    return `${userId}-${offset}`;
  }

  private getCacheEntry(key: string): EnhancedMessage[] | null {
    const entry = this.messageCache.get(key);
    if (entry) {
      // Mover al final para LRU
      this.messageCache.delete(key);
      this.messageCache.set(key, entry);
      return entry;
    }
    return null;
  }

  private setCacheEntry(key: string, messages: EnhancedMessage[]): void {
    // Implementar LRU: eliminar entrada más antigua si excedemos el tamaño
    if (this.messageCache.size >= this.config.cacheSize / this.config.batchSize) {
      const oldestKey = this.messageCache.keys().next().value;
      if (oldestKey) {
        this.messageCache.delete(oldestKey);
        this.cacheKeys = this.cacheKeys.filter(k => k !== oldestKey);
      }
    }
    
    this.messageCache.set(key, messages);
    this.cacheKeys.push(key);
  }

  // Limpiar cache
  clearCache(): void {
    this.messageCache.clear();
    this.cacheKeys = [];
    console.log('🧹 LazyHistoryLoader: Cache limpiado');
  }

  // Reiniciar estado
  reset(): void {
    this.state = {
      isLoading: false,
      hasMore: true,
      currentOffset: 0,
      totalCount: 0,
      loadedBatches: 0,
      error: null
    };
    this.clearCache();
    console.log('🔄 LazyHistoryLoader: Estado reiniciado');
  }

  // Obtener estadísticas
  getStats(): {
    cacheSize: number;
    loadedBatches: number;
    currentOffset: number;
    hasMore: boolean;
    isLoading: boolean;
    error: string | null;
  } {
    return {
      cacheSize: this.messageCache.size,
      loadedBatches: this.state.loadedBatches,
      currentOffset: this.state.currentOffset,
      hasMore: this.state.hasMore,
      isLoading: this.state.isLoading,
      error: this.state.error
    };
  }

  // Configurar parámetros
  configure(config: Partial<LazyLoadConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ LazyHistoryLoader: Configuración actualizada:', this.config);
  }
}

// Instancia singleton
export const lazyHistoryLoader = new LazyHistoryLoader();
