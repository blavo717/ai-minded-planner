
import { useState, useCallback, useRef, useEffect } from 'react';
import { Task } from '@/hooks/useTasks';

interface LazyMicrotaskConfig {
  pageSize?: number;
  preloadThreshold?: number;
  maxCachedPages?: number;
}

export const useLazyMicrotasks = (
  subtaskId: string,
  getMicrotasksForSubtask: (subtaskId: string) => Task[],
  config: LazyMicrotaskConfig = {}
) => {
  const {
    pageSize = 5,
    preloadThreshold = 2,
    maxCachedPages = 10
  } = config;

  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cacheRef = useRef<Map<number, Task[]>>(new Map());
  const allMicrotasks = getMicrotasksForSubtask(subtaskId);
  const totalPages = Math.ceil(allMicrotasks.length / pageSize);

  // Obtener microtareas para una página específica
  const getMicrotasksPage = useCallback((page: number): Task[] => {
    if (cacheRef.current.has(page)) {
      return cacheRef.current.get(page)!;
    }

    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, allMicrotasks.length);
    const pageData = allMicrotasks.slice(startIndex, endIndex);
    
    // Mantener caché limitado
    if (cacheRef.current.size >= maxCachedPages) {
      const oldestPage = Math.min(...Array.from(cacheRef.current.keys()));
      cacheRef.current.delete(oldestPage);
    }
    
    cacheRef.current.set(page, pageData);
    return pageData;
  }, [allMicrotasks, pageSize, maxCachedPages]);

  // Obtener todas las microtareas cargadas actualmente
  const getLoadedMicrotasks = useCallback((): Task[] => {
    const loaded: Task[] = [];
    const sortedPages = Array.from(loadedPages).sort((a, b) => a - b);
    
    for (const page of sortedPages) {
      loaded.push(...getMicrotasksPage(page));
    }
    
    return loaded;
  }, [loadedPages, getMicrotasksPage]);

  // Cargar la siguiente página
  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    const nextPage = Math.max(...Array.from(loadedPages)) + 1;
    
    if (nextPage >= totalPages) {
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    
    // Simular latencia de carga
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setLoadedPages(prev => new Set([...prev, nextPage]));
    setHasMore(nextPage < totalPages - 1);
    setIsLoading(false);
  }, [isLoading, hasMore, loadedPages, totalPages]);

  // Precargar páginas cercanas
  const preloadNearbyPages = useCallback((currentPage: number) => {
    const pagesToPreload = [];
    
    for (let i = 1; i <= preloadThreshold; i++) {
      const nextPage = currentPage + i;
      const prevPage = currentPage - i;
      
      if (nextPage < totalPages && !loadedPages.has(nextPage)) {
        pagesToPreload.push(nextPage);
      }
      
      if (prevPage >= 0 && !loadedPages.has(prevPage)) {
        pagesToPreload.push(prevPage);
      }
    }

    if (pagesToPreload.length > 0) {
      setLoadedPages(prev => new Set([...prev, ...pagesToPreload]));
    }
  }, [loadedPages, preloadThreshold, totalPages]);

  // Detectar cuando se necesita cargar más contenido
  const handleScroll = useCallback((element: HTMLElement) => {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Cargar más cuando se llega al 80% del scroll
    if (scrollPercentage > 0.8 && hasMore && !isLoading) {
      loadNextPage();
    }
  }, [hasMore, isLoading, loadNextPage]);

  // Reset cuando cambia el subtask
  useEffect(() => {
    setLoadedPages(new Set([0]));
    setHasMore(totalPages > 1);
    cacheRef.current.clear();
  }, [subtaskId, totalPages]);

  const loadedMicrotasks = getLoadedMicrotasks();

  return {
    microtasks: loadedMicrotasks,
    isLoading,
    hasMore,
    loadNextPage,
    handleScroll,
    preloadNearbyPages,
    totalCount: allMicrotasks.length,
    loadedCount: loadedMicrotasks.length,
    loadedPages: Array.from(loadedPages).sort((a, b) => a - b)
  };
};
