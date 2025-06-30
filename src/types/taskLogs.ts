
export interface TaskLog {
  id: string;
  task_id: string;
  user_id: string;
  log_type: 'manual' | 'status_change' | 'creation' | 'completion' | 'assignment' | 'communication' | 'update' | 'deletion';
  title: string;
  content?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskLogData {
  task_id: string;
  log_type?: TaskLog['log_type'];
  title: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTaskLogData {
  id: string;
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
}

export const LOG_TYPES = {
  manual: 'Manual',
  status_change: 'Cambio de Estado',
  creation: 'Creación',
  completion: 'Completado',
  assignment: 'Asignación',
  communication: 'Comunicación',
  update: 'Actualización',
  deletion: 'Eliminación'
} as const;
