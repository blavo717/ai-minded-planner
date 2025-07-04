
import Logger, { LogCategory } from './logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: any;
}

export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  private static metrics: PerformanceMetric[] = [];

  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  static endTimer(name: string, data?: any): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      Logger.warn(LogCategory.PERFORMANCE, `Timer ${name} not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    // Store metric for dashboard
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      metadata: data
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    Logger.performance(LogCategory.PERFORMANCE, name, { duration, ...data });
    return duration;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>, data?: any): Promise<T> {
    this.startTimer(name);
    return fn()
      .then(result => {
        this.endTimer(name, { success: true, ...data });
        return result;
      })
      .catch(error => {
        this.endTimer(name, { success: false, error: error.message, ...data });
        throw error;
      });
  }

  static measure<T>(name: string, fn: () => T, data?: any): T {
    this.startTimer(name);
    try {
      const result = fn();
      this.endTimer(name, { success: true, ...data });
      return result;
    } catch (error) {
      this.endTimer(name, { success: false, error: error instanceof Error ? error.message : 'Unknown error', ...data });
      throw error;
    }
  }

  static getMemoryUsage(): { used: number; total: number } {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize
      };
    }
    return { used: 0, total: 0 };
  }

  static logMemoryUsage(context: string): void {
    const memory = this.getMemoryUsage();
    Logger.info(LogCategory.PERFORMANCE, `Memory usage - ${context}`, {
      usedMB: Math.round(memory.used / 1024 / 1024),
      totalMB: Math.round(memory.total / 1024 / 1024)
    });
  }

  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  static clearMetrics(): void {
    this.metrics = [];
  }
}

// Export instance for easy access
export const performanceMonitor = PerformanceMonitor;

// Debounce utility function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
