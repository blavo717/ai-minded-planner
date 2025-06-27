
import { Task } from '@/hooks/useTasks';

export type QuadrantType = 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';

export const getTaskQuadrant = (task: Task): QuadrantType => {
  const isUrgent = task.priority === 'urgent' || 
                  (task.due_date && new Date(task.due_date) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
  const isImportant = task.priority === 'urgent' || task.priority === 'high';

  if (isUrgent && isImportant) return 'urgent-important';
  if (!isUrgent && isImportant) return 'important-not-urgent';
  if (isUrgent && !isImportant) return 'urgent-not-important';
  return 'not-urgent-not-important';
};

export const organizeTasksByQuadrants = (tasks: Task[]) => {
  const quadrants = {
    'urgent-important': [] as Task[],
    'important-not-urgent': [] as Task[],
    'urgent-not-important': [] as Task[],
    'not-urgent-not-important': [] as Task[]
  };

  tasks.forEach(task => {
    const quadrant = getTaskQuadrant(task);
    quadrants[quadrant].push(task);
  });

  return quadrants;
};

export const getNewPriorityForQuadrant = (quadrant: QuadrantType): Task['priority'] => {
  const priorityMap: Record<QuadrantType, Task['priority']> = {
    'urgent-important': 'urgent',
    'important-not-urgent': 'high',
    'urgent-not-important': 'medium',
    'not-urgent-not-important': 'low'
  };
  
  return priorityMap[quadrant];
};
