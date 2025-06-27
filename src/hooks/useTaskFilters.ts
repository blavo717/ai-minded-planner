
import { useState, useMemo } from 'react';
import { Task } from '@/hooks/useTasks';
import { FilterState } from '@/types/filters';
import { applySmartFilter } from '@/utils/smartFilters';

export const useTaskFilters = (
  tasks: Task[],
  getSubtasksForTask: (taskId: string) => Task[],
  taskAssignments: any[] = [],
  taskDependencies: any[] = []
) => {
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
    smartFilters: [],
    operators: {
      status: { type: 'OR' },
      priority: { type: 'OR' },
      projects: { type: 'OR' },
      tags: { type: 'OR' },
      assignedTo: { type: 'OR' },
    }
  });

  const updateFilter = (key: keyof FilterState | string, value: any) => {
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');
      setFilters(prev => ({
        ...prev,
        [parentKey]: {
          ...(prev[parentKey as keyof FilterState] as object),
          [childKey]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
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
      smartFilters: [],
      operators: {
        status: { type: 'OR' },
        priority: { type: 'OR' },
        projects: { type: 'OR' },
        tags: { type: 'OR' },
        assignedTo: { type: 'OR' },
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status?.length > 0) count++;
    if (filters.priority?.length > 0) count++;
    if (filters.projects?.length > 0) count++;
    if (filters.tags?.length > 0) count++;
    if (filters.assignedTo?.length > 0) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    if (filters.hasSubtasks !== undefined) count++;
    if (filters.hasDependencies !== undefined) count++;
    if (filters.smartFilters?.length > 0) count++;
    return count;
  };

  const loadFilter = (filterData: FilterState) => {
    setFilters(filterData);
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply smart filters first
    if (filters.smartFilters?.length > 0) {
      for (const smartFilterId of filters.smartFilters) {
        result = applySmartFilter(result, smartFilterId);
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(task => {
        const matchesTitle = task.title.toLowerCase().includes(searchTerm);
        const matchesDescription = task.description?.toLowerCase().includes(searchTerm);
        
        // Search in subtasks
        const subtasks = getSubtasksForTask(task.id);
        const matchesSubtasks = subtasks.some(subtask => 
          subtask.title.toLowerCase().includes(searchTerm) ||
          subtask.description?.toLowerCase().includes(searchTerm)
        );
        
        return matchesTitle || matchesDescription || matchesSubtasks;
      });
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(task => {
        if (filters.operators.status.type === 'OR') {
          return filters.status.includes(task.status);
        } else {
          return filters.status.every(status => task.status === status);
        }
      });
    }

    // Priority filter
    if (filters.priority.length > 0) {
      result = result.filter(task => {
        if (filters.operators.priority.type === 'OR') {
          return filters.priority.includes(task.priority);
        } else {
          return filters.priority.every(priority => task.priority === priority);
        }
      });
    }

    // Projects filter
    if (filters.projects.length > 0) {
      result = result.filter(task => {
        if (!task.project_id) return false;
        if (filters.operators.projects.type === 'OR') {
          return filters.projects.includes(task.project_id);
        } else {
          return filters.projects.every(projectId => task.project_id === projectId);
        }
      });
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter(task => {
        if (!task.tags || task.tags.length === 0) return false;
        if (filters.operators.tags.type === 'OR') {
          return filters.tags.some(tag => task.tags?.includes(tag));
        } else {
          return filters.tags.every(tag => task.tags?.includes(tag));
        }
      });
    }

    // Assigned to filter - declare assignments here to avoid scoping issues
    if (filters.assignedTo.length > 0) {
      result = result.filter(task => {
        const currentTaskAssignments = taskAssignments.filter(assignment => assignment.task_id === task.id);
        if (currentTaskAssignments.length === 0) return false;
        
        const assignedUserIds = currentTaskAssignments.map(assignment => assignment.assigned_to);
        
        if (filters.operators.assignedTo.type === 'OR') {
          return filters.assignedTo.some(userId => assignedUserIds.includes(userId));
        } else {
          return filters.assignedTo.every(userId => assignedUserIds.includes(userId));
        }
      });
    }

    // Date range filters
    if (filters.dueDateFrom || filters.dueDateTo) {
      result = result.filter(task => {
        if (!task.due_date) return false;
        
        const taskDate = new Date(task.due_date);
        
        if (filters.dueDateFrom) {
          const fromDate = new Date(filters.dueDateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (taskDate < fromDate) return false;
        }
        
        if (filters.dueDateTo) {
          const toDate = new Date(filters.dueDateTo);
          toDate.setHours(23, 59, 59, 999);
          if (taskDate > toDate) return false;
        }
        
        return true;
      });
    }

    // Has subtasks filter
    if (filters.hasSubtasks !== undefined) {
      result = result.filter(task => {
        const hasSubtasks = getSubtasksForTask(task.id).length > 0;
        return filters.hasSubtasks ? hasSubtasks : !hasSubtasks;
      });
    }

    // Has dependencies filter
    if (filters.hasDependencies !== undefined) {
      result = result.filter(task => {
        const hasDependencies = taskDependencies.some(dep => dep.task_id === task.id);
        return filters.hasDependencies ? hasDependencies : !hasDependencies;
      });
    }

    return result;
  }, [tasks, filters, getSubtasksForTask, taskAssignments, taskDependencies]);

  const availableTags = useMemo(() => {
    const allTags = tasks.flatMap(task => task.tags || []);
    return [...new Set(allTags)];
  }, [tasks]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearAllFilters,
    getActiveFiltersCount,
    loadFilter,
    filteredTasks,
    availableTags
  };
};
