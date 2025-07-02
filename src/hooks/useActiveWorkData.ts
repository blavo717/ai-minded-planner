import { useMemo } from 'react';
import { useTasks } from './useTasks';

export const useActiveWorkData = (taskId: string) => {
  const { tasks } = useTasks();

  // Buscar la tarea en todos los niveles
  const task = useMemo(() => {
    return tasks.find(t => t.id === taskId);
  }, [tasks, taskId]);

  // Generar datos de jerarquía completa
  const hierarchyData = useMemo(() => {
    if (!task) return { parentTask: undefined, children: [], siblings: [], totalHierarchy: [] };

    // Tarea padre
    const parentTask = task.parent_task_id 
      ? tasks.find(t => t.id === task.parent_task_id)
      : undefined;

    // Tareas hijas (nivel inmediatamente inferior)
    const children = tasks.filter(t => t.parent_task_id === task.id);

    // Tareas hermanas (mismo nivel y mismo padre)
    const siblings = task.parent_task_id
      ? tasks.filter(t => t.parent_task_id === task.parent_task_id && t.task_level === task.task_level)
      : tasks.filter(t => t.task_level === task.task_level && !t.parent_task_id);

    return {
      parentTask,
      children,
      siblings,
      totalHierarchy: tasks
    };
  }, [task, tasks]);

  return { task, hierarchyData };
};