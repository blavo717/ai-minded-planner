
import { useCallback } from 'react';
import { FilterState } from '@/types/filters';
import { applyTaskFilters } from '@/utils/taskFilterUtils';
import { Task } from '@/hooks/useTasks';
import { TaskAssignment } from '@/hooks/useTaskAssignments';
import { TaskDependency } from '@/hooks/useTaskDependencies';

export const useTaskFilterOperations = () => {
  const applyFilters = useCallback((
    tasks: Task[],
    filters: FilterState,
    getSubtasksForTask: (taskId: string) => Task[],
    taskAssignments: TaskAssignment[],
    taskDependencies: TaskDependency[]
  ) => {
    return applyTaskFilters(tasks, filters, filters.search, getSubtasksForTask, taskAssignments, taskDependencies);
  }, []);

  return {
    applyFilters
  };
};
