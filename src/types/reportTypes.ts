// ============================================================================
// TIPOS CENTRALIZADOS PARA REPORTES PDF
// ============================================================================

// Interfaces base para tareas
export interface TaskData {
  id: string;
  title: string;
  status: string;
  priority: string;
  project_name?: string;
  completed_at?: string;
  actual_duration?: number;
  description?: string;
  due_date?: string;
  created_at?: string;
}

// Interfaces para métricas
export interface ReportMetrics {
  tasksCompleted: number;
  tasksCreated: number;
  timeWorked: number; // en minutos
  productivity: number; // 1-5
  completionRate: number; // 0-100
  averageTaskDuration: number; // en minutos
  projectsActive: number;
  projectsCompleted: number;
}

// Interface para desglose semanal
export interface WeeklyBreakdown {
  week: number;
  tasksCompleted: number;
  timeWorked: number;
  productivity: number;
}

// Interface para proyectos
export interface ProjectData {
  id: string;
  name: string;
  status: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
}

// Interface para tendencias
export interface TrendsData {
  productivityTrend: 'up' | 'down' | 'stable';
  timeEfficiency: number;
  bestWeek?: number;
  improvements: string[];
}

// Interface para comparación
export interface ComparisonData {
  previousMonth: {
    tasksCompleted: number;
    timeWorked: number;
    productivity: number;
  };
  changePercentage: {
    tasks: number;
    time: number;
    productivity: number;
  };
}

// Interface unificada para datos del reporte mensual
export interface MonthlyReportData {
  period_start: string;
  period_end: string;
  metrics: ReportMetrics;
  tasks: TaskData[];
  weeklyBreakdown?: WeeklyBreakdown[];
  projects?: ProjectData[];
  trends?: TrendsData;
  comparison?: ComparisonData;
}

// Interface para configuración de marca
export interface BrandConfig {
  companyName?: string;
  logo?: string;
}

// Resultado de generación de PDF
export interface PDFGenerationResult {
  blob: Blob;
  filename: string;
  size: number;
  uploadUrl?: string;
}

// Validación de datos
export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}