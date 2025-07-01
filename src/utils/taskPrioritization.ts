
import { Task } from '@/hooks/useTasks';

export interface TaskWithReason {
  task: Task;
  reason: string;
  priority: number;
}

export function getWhatToDoNow(tasks: Task[], userId: string, skippedIds: string[] = []): TaskWithReason | null {
  // Solo tareas pendientes o en progreso, no completadas ni archivadas
  const availableTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    !task.is_archived &&
    !skippedIds.includes(task.id)
  );

  if (availableTasks.length === 0) return null;

  // Calcular prioridad y razón para cada tarea
  const tasksWithPriority = availableTasks.map(task => {
    const { priority, reason } = calculateTaskPriority(task);
    return { task, reason, priority };
  });

  // Ordenar por prioridad (mayor número = mayor prioridad)
  tasksWithPriority.sort((a, b) => b.priority - a.priority);

  return tasksWithPriority[0];
}

function calculateTaskPriority(task: Task): { priority: number, reason: string } {
  let priority = 0;
  let reason = '';

  // 1. VENCIDAS (máxima prioridad: +1000)
  if (isOverdue(task.due_date)) {
    priority += 1000;
    const daysOverdue = getDaysOverdue(task.due_date!);
    reason = `⚠️ Vencida hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}`;
    return { priority, reason };
  }

  // 2. VENCEN HOY (+500)
  if (isDueToday(task.due_date)) {
    priority += 500;
    reason = '📅 Vence hoy';
    return { priority, reason };
  }

  // 3. VENCEN MAÑANA (+300)
  if (isDueTomorrow(task.due_date)) {
    priority += 300;
    reason = '📅 Vence mañana';
  }

  // 4. EN PROGRESO (+200) - continuar lo que ya empezaste
  if (task.status === 'in_progress') {
    priority += 200;
    if (!reason) reason = '▶️ En progreso';
  }

  // 5. PRIORIDAD MANUAL (+50 a +200)
  const priorityWeights = {
    'urgent': 200,
    'high': 150,
    'medium': 100,
    'low': 50
  };
  priority += priorityWeights[task.priority as keyof typeof priorityWeights] || 100;

  // 6. DÍAS SIN TOCAR (+1 por día sin actualizar)
  const daysSinceUpdate = getDaysSince(task.updated_at || task.created_at);
  if (daysSinceUpdate > 3) {
    priority += Math.min(daysSinceUpdate, 30); // máximo 30 puntos
    if (!reason) reason = `⏰ Sin tocar ${daysSinceUpdate} día${daysSinceUpdate > 1 ? 's' : ''}`;
  }

  // Razón por defecto basada en prioridad
  if (!reason) {
    if (task.priority === 'urgent') reason = '🔥 Prioridad urgente';
    else if (task.priority === 'high') reason = '⭐ Alta prioridad';
    else if (task.priority === 'medium') reason = '📋 Prioridad media';
    else reason = '📋 Siguiente en tu lista';
  }

  return { priority, reason };
}

// Funciones helper
export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  return due < now;
}

export function isDueToday(dueDate?: string): boolean {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(dueDate);
  return due.toDateString() === today.toDateString();
}

export function isDueTomorrow(dueDate?: string): boolean {
  if (!dueDate) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(dueDate);
  return due.toDateString() === tomorrow.toDateString();
}

export function getDaysOverdue(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = now.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysSince(date: string): number {
  const now = new Date();
  const past = new Date(date);
  const diffTime = now.getTime() - past.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
