
import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '@/hooks/useTasks';

interface ColumnMetrics {
  id: string;
  taskCount: number;
  totalHeight: number;
  averageTaskHeight: number;
  maxWidth: number;
}

export const useSmartKanbanLayout = (tasks: Task[]) => {
  const [columnMetrics, setColumnMetrics] = useState<ColumnMetrics[]>([]);
  const [optimalWidths, setOptimalWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);
  const columnsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Calcular métricas de columnas
  const calculateColumnMetrics = useCallback((columnId: string, tasks: Task[]) => {
    const columnTasks = tasks.filter(task => task.status === columnId);
    const element = columnsRef.current.get(columnId);
    
    if (!element) return null;

    const taskElements = element.querySelectorAll('[data-task-id]');
    let totalHeight = 0;
    let maxWidth = 240; // Ancho mínimo
    
    taskElements.forEach((taskEl) => {
      const rect = taskEl.getBoundingClientRect();
      totalHeight += rect.height;
      maxWidth = Math.max(maxWidth, Math.min(rect.width + 40, 400)); // Máximo 400px
    });

    return {
      id: columnId,
      taskCount: columnTasks.length,
      totalHeight,
      averageTaskHeight: columnTasks.length > 0 ? totalHeight / columnTasks.length : 0,
      maxWidth
    };
  }, []);

  // Auto-resize de columnas basado en contenido
  const updateColumnWidths = useCallback(() => {
    const columns = ['pending', 'in_progress', 'completed', 'cancelled'];
    const newMetrics: ColumnMetrics[] = [];
    const newWidths: Record<string, number> = {};

    columns.forEach(columnId => {
      const metrics = calculateColumnMetrics(columnId, tasks);
      if (metrics) {
        newMetrics.push(metrics);
        
        // Calcular ancho óptimo basado en contenido y número de tareas
        let optimalWidth = 280; // Ancho base
        
        if (metrics.taskCount > 10) {
          optimalWidth = Math.min(350, optimalWidth + (metrics.taskCount - 10) * 5);
        }
        
        if (metrics.maxWidth > optimalWidth) {
          optimalWidth = Math.min(400, metrics.maxWidth);
        }
        
        newWidths[columnId] = optimalWidth;
      }
    });

    setColumnMetrics(newMetrics);
    setOptimalWidths(newWidths);
  }, [tasks, calculateColumnMetrics]);

  // Configurar ResizeObserver para columnas
  const observeColumn = useCallback((columnId: string, element: HTMLElement) => {
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        const hasChanges = entries.some(entry => entry.contentRect.height > 0);
        if (hasChanges && !isResizing) {
          setIsResizing(true);
          setTimeout(() => {
            updateColumnWidths();
            setIsResizing(false);
          }, 100);
        }
      });
    }

    columnsRef.current.set(columnId, element);
    observerRef.current.observe(element);
  }, [updateColumnWidths, isResizing]);

  // Limpiar observer de columna
  const unobserveColumn = useCallback((columnId: string) => {
    const element = columnsRef.current.get(columnId);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
      columnsRef.current.delete(columnId);
    }
  }, []);

  // Scroll inteligente para tareas expandidas
  const scrollToExpandedTask = useCallback((taskId: string) => {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, []);

  // Calcular altura óptima para el viewport
  const getOptimalViewportHeight = useCallback(() => {
    const maxColumnHeight = Math.max(...columnMetrics.map(m => m.totalHeight));
    const viewportHeight = window.innerHeight;
    const headerHeight = 200; // Espacio para header y filtros
    
    return Math.min(maxColumnHeight + 100, viewportHeight - headerHeight);
  }, [columnMetrics]);

  // Efectos
  useEffect(() => {
    // Actualizar métricas cuando cambien las tareas
    const timeoutId = setTimeout(updateColumnWidths, 300);
    return () => clearTimeout(timeoutId);
  }, [tasks, updateColumnWidths]);

  useEffect(() => {
    // Cleanup al desmontar
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    columnMetrics,
    optimalWidths,
    isResizing,
    observeColumn,
    unobserveColumn,
    scrollToExpandedTask,
    getOptimalViewportHeight,
    updateColumnWidths
  };
};
