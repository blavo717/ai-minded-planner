
import { useState, useMemo } from 'react';
import { Task } from '@/hooks/useTasks';

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  projects: string[];
  tags: string[];
  assignedTo: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  hasSubtasks?: boolean;
  hasDependencies?: boolean;
}

export const useTaskFilters = (tasks: Task[], getSubtasksForTask: (taskId: string) => Task[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    projects: [],
    tags: [],
    assignedTo: [],
    dueDateFrom: undefined,
    dueDateTo: undefined,
    hasSubtasks: undefined,
    hasDependencies: undefined,
  });

  const availableTags = useMemo(() => {
    return Array.from(
      new Set(
        tasks
          .filter(task => task.tags)
          .flatMap(task => task.tags || [])
      )
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      if (filters.projects.length > 0) {
        if (!task.project_id || !filters.projects.includes(task.project_id)) {
          return false;
        }
      }

      if (filters.tags.length > 0) {
        if (!task.tags || !filters.tags.some(tag => task.tags?.includes(tag))) {
          return false;
        }
      }

      if (filters.dueDateFrom && task.due_date) {
        if (new Date(task.due_date) < filters.dueDateFrom) {
          return false;
        }
      }
      if (filters.dueDateTo && task.due_date) {
        if (new Date(task.due_date) > filters.dueDateTo) {
          return false;
        }
      }

      if (filters.hasSubtasks !== undefined) {
        const hasSubtasks = getSubtasksForTask(task.id).length > 0;
        if (filters.hasSubtasks !== hasSubtasks) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters, getSubtasksForTask]);

  return {
    filters,
    setFilters,
    filteredTasks,
    availableTags
  };
};
