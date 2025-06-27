export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export enum LogCategory {
  USER_ACTION = 'UserAction',
  API_ERROR = 'APIError',
  PERFORMANCE = 'Performance',
  AI_SEARCH = 'AISearch',
  GANTT_RENDER = 'GanttRender',
  SYSTEM_HEALTH = 'SystemHealth'
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  stackTrace?: string;
}

class Logger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 1000;
  private static isDev = import.meta.env.DEV;

  private static addLog(level: LogLevel, category: LogCategory, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      stackTrace: level >= LogLevel.ERROR ? new Error().stack : undefined
    };

    this.logs.push(entry);
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (this.isDev) {
      const prefix = `[${category}]`;
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, data);
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(prefix, message, data);
          break;
      }
    }
  }

  static debug(category: LogCategory, message: string, data?: any) {
    this.addLog(LogLevel.DEBUG, category, message, data);
  }

  static info(category: LogCategory, message: string, data?: any) {
    this.addLog(LogLevel.INFO, category, message, data);
  }

  static warn(category: LogCategory, message: string, data?: any) {
    this.addLog(LogLevel.WARN, category, message, data);
  }

  static error(category: LogCategory, message: string, data?: any) {
    this.addLog(LogLevel.ERROR, category, message, data);
  }

  static critical(category: LogCategory, message: string, data?: any) {
    this.addLog(LogLevel.CRITICAL, category, message, data);
  }

  static performance(category: LogCategory, message: string, data: { duration: number; [key: string]: any }) {
    this.info(category, `${message} (${data.duration.toFixed(2)}ms)`, data);
  }

  static getLogs(level?: LogLevel, category?: LogCategory): LogEntry[] {
    return this.logs.filter(log => {
      if (level !== undefined && log.level < level) return false;
      if (category !== undefined && log.category !== category) return false;
      return true;
    });
  }

  static clearLogs() {
    this.logs = [];
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export default Logger;
