
import { useState, useCallback, useEffect, useRef } from 'react';
import { lazyHistoryLoader } from './services/lazyHistoryLoader';
import { EnhancedMessage } from './types/enhancedAITypes';

interface LazyHistoryState {
  messages: EnhancedMessage[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  stats: {
    cacheSize: number;
    loadedBatches: number;
    currentOffset: number;
  };
}

export const useLazyHistoryLoader = (userId?: string) => {
  const [state, setState] = useState<LazyHistoryState>({
    messages: [],
    isLoading: false,
    hasMore: true,
    error: null,
    stats: {
      cacheSize: 0,
      loadedBatches: 0,
      currentOffset: 0,
    }
  });

  const isInitializedRef = useRef(false);
  const userIdRef = useRef(userId);

  // Actualizar estado desde loader
  const updateState = useCallback(() => {
    const stats = lazyHistoryLoader.getStats();
    setState(prev => ({
      ...prev,
      isLoading: stats.isLoading,
      hasMore: stats.hasMore,
      error: stats.error,
      stats: {
        cacheSize: stats.cacheSize,
        loadedBatches: stats.loadedBatches,
        currentOffset: stats.currentOffset,
      }
    }));
  }, []);

  // Cargar lote inicial
  const loadInitialBatch = useCallback(async () => {
    if (!userId || isInitializedRef.current) return;

    console.log('🔄 useLazyHistoryLoader: Iniciando carga inicial...');
    
    try {
      const result = await lazyHistoryLoader.loadInitialBatch(userId);
      
      setState(prev => ({
        ...prev,
        messages: result.messages,
        isLoading: result.state.isLoading,
        hasMore: result.state.hasMore,
        error: result.state.error,
        stats: {
          cacheSize: lazyHistoryLoader.getStats().cacheSize,
          loadedBatches: result.state.loadedBatches,
          currentOffset: result.state.currentOffset,
        }
      }));

      isInitializedRef.current = true;
      
    } catch (error) {
      console.error('❌ useLazyHistoryLoader: Error en carga inicial:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      }));
    }
  }, [userId]);

  // Cargar siguiente lote
  const loadNextBatch = useCallback(async () => {
    if (!userId || state.isLoading || !state.hasMore) return;

    console.log('📚 useLazyHistoryLoader: Cargando siguiente lote...');
    
    try {
      const result = await lazyHistoryLoader.loadNextBatch(userId);
      
      if (result.messages.length > 0) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, ...result.messages],
          isLoading: result.state.isLoading,
          hasMore: result.state.hasMore,
          error: result.state.error,
          stats: {
            cacheSize: lazyHistoryLoader.getStats().cacheSize,
            loadedBatches: result.state.loadedBatches,
            currentOffset: result.state.currentOffset,
          }
        }));
      } else {
        updateState();
      }
      
    } catch (error) {
      console.error('❌ useLazyHistoryLoader: Error cargando siguiente lote:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      }));
    }
  }, [userId, state.isLoading, state.hasMore, updateState]);

  // Verificar si debe cargar más
  const checkShouldLoadMore = useCallback(() => {
    if (!userId) return;
    
    const shouldLoad = lazyHistoryLoader.shouldLoadMore(state.messages.length);
    if (shouldLoad) {
      console.log('🔍 useLazyHistoryLoader: Detectada necesidad de cargar más mensajes');
      loadNextBatch();
    }
  }, [userId, state.messages.length, loadNextBatch]);

  // Reiniciar loader
  const reset = useCallback(() => {
    console.log('🔄 useLazyHistoryLoader: Reiniciando...');
    lazyHistoryLoader.reset();
    setState({
      messages: [],
      isLoading: false,
      hasMore: true,
      error: null,
      stats: {
        cacheSize: 0,
        loadedBatches: 0,
        currentOffset: 0,
      }
    });
    isInitializedRef.current = false;
  }, []);

  // Limpiar cache
  const clearCache = useCallback(() => {
    console.log('🧹 useLazyHistoryLoader: Limpiando cache...');
    lazyHistoryLoader.clearCache();
    updateState();
  }, [updateState]);

  // Agregar mensaje nuevo (para mantener sincronización)
  const addMessage = useCallback((message: EnhancedMessage) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  // Configurar parámetros
  const configure = useCallback((config: {
    batchSize?: number;
    maxBatches?: number;
    loadThreshold?: number;
    cacheSize?: number;
  }) => {
    lazyHistoryLoader.configure(config);
    console.log('⚙️ useLazyHistoryLoader: Configuración actualizada');
  }, []);

  // Efecto para cargar inicial cuando cambia userId
  useEffect(() => {
    if (userId && userId !== userIdRef.current) {
      userIdRef.current = userId;
      isInitializedRef.current = false;
      reset();
      loadInitialBatch();
    }
  }, [userId, reset, loadInitialBatch]);

  // Efecto para verificar carga automática
  useEffect(() => {
    if (state.messages.length > 0) {
      checkShouldLoadMore();
    }
  }, [state.messages.length, checkShouldLoadMore]);

  return {
    // Estado
    messages: state.messages,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    error: state.error,
    stats: state.stats,
    
    // Acciones
    loadNextBatch,
    reset,
    clearCache,
    addMessage,
    configure,
    checkShouldLoadMore,
  };
};
