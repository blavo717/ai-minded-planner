
import { Task } from '@/hooks/useTasks';
import { FilterState } from '@/types/filters';
import { applySmartFilter } from '@/utils/smartFilters';

export const applyTaskFilters = (
  tasks: Task[],
  filters: FilterState,
  debouncedSearch: string,
  getSubtasksForTask: (taskId: string) => Task[],
  taskAssignments: any[],
  taskDependencies: any[]
): Task[] => {
  let result = [...tasks];

  // Apply smart filters first
  if (filters.smartFilters?.length > 0) {
    for (const smartFilterId of filters.smartFilters) {
      result = applySmartFilter(result, smartFilterId);
    }
  }

  // Search filter
  if (debouncedSearch) {
    result = applySearchFilter(result, debouncedSearch, getSubtasksForTask);
  }

  // Status filter
  if (filters.status.length > 0) {
    result = applyStatusFilter(result, filters);
  }

  // Priority filter
  if (filters.priority.length > 0) {
    result = applyPriorityFilter(result, filters);
  }

  // Projects filter
  if (filters.projects.length > 0) {
    result = applyProjectsFilter(result, filters);
  }

  // Tags filter
  if (filters.tags.length > 0) {
    result = applyTagsFilter(result, filters);
  }

  // Assigned to filter
  if (filters.assignedTo.length > 0) {
    result = applyAssignedToFilter(result, filters, taskAssignments);
  }

  // Date range filters
  if (filters.dueDateFrom || filters.dueDateTo) {
    result = applyDateRangeFilter(result, filters);
  }

  // Has subtasks filter
  if (filters.hasSubtasks !== undefined) {
    result = applySubtasksFilter(result, filters, getSubtasksForTask);
  }

  // Has dependencies filter
  if (filters.hasDependencies !== undefined) {
    result = applyDependenciesFilter(result, filters, taskDependencies);
  }

  return result;
};

const applySearchFilter = (
  tasks: Task[],
  searchTerm: string,
  getSubtasksForTask: (taskId: string) => Task[]
): Task[] => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return tasks.filter(task => {
    const matchesTitle = task.title.toLowerCase().includes(lowerSearchTerm);
    const matchesDescription = task.description?.toLowerCase().includes(lowerSearchTerm);
    
    const subtasks = getSubtasksForTask(task.id);
    const matchesSubtasks = subtasks.some(subtask => 
      subtask.title.toLowerCase().includes(lowerSearchTerm) ||
      subtask.description?.toLowerCase().includes(lowerSearchTerm)
    );
    
    return matchesTitle || matchesDescription || matchesSubtasks;
  });
};

const applyStatusFilter = (tasks: Task[], filters: FilterState): Task[] => {
  return tasks.filter(task => {
    if (filters.operators.status.type === 'OR') {
      return filters.status.includes(task.status);
    } else {
      return filters.status.every(status => task.status === status);
    }
  });
};

const applyPriorityFilter = (tasks: Task[], filters: FilterState): Task[] => {
  return tasks.filter(task => {
    if (filters.operators.priority.type === 'OR') {
      return filters.priority.includes(task.priority);
    } else {
      return filters.priority.every(priority => task.priority === priority);
    }
  });
};

const applyProjectsFilter = (tasks: Task[], filters: FilterState): Task[] => {
  return tasks.filter(task => {
    if (!task.project_id) return false;
    if (filters.operators.projects.type === 'OR') {
      return filters.projects.includes(task.project_id);
    } else {
      return filters.projects.every(projectId => task.project_id === projectId);
    }
  });
};

const applyTagsFilter = (tasks: Task[], filters: FilterState): Task[] => {
  return tasks.filter(task => {
    if (!task.tags || task.tags.length === 0) return false;
    if (filters.operators.tags.type === 'OR') {
      return filters.tags.some(tag => task.tags?.includes(tag));
    } else {
      return filters.tags.every(tag => task.tags?.includes(tag));
    }
  });
};

const applyAssignedToFilter = (tasks: Task[], filters: FilterState, taskAssignments: any[]): Task[] => {
  return tasks.filter(task => {
    const currentTaskAssignments = taskAssignments.filter(assignment => assignment.task_id === task.id);
    if (currentTaskAssignments.length === 0) return false;
    
    const assignedUserIds = currentTaskAssignments.map(assignment => assignment.assigned_to);
    
    if (filters.operators.assignedTo.type === 'OR') {
      return filters.assignedTo.some(userId => assignedUserIds.includes(userId));
    } else {
      return filters.assignedTo.every(userId => assignedUserIds.includes(userId));
    }
  });
};

const applyDateRangeFilter = (tasks: Task[], filters: FilterState): Task[] => {
  return tasks.filter(task => {
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
};

const applySubtasksFilter = (
  tasks: Task[],
  filters: FilterState,
  getSubtasksForTask: (taskId: string) => Task[]
): Task[] => {
  return tasks.filter(task => {
    const hasSubtasks = getSubtasksForTask(task.id).length > 0;
    return filters.hasSubtasks ? hasSubtasks : !hasSubtasks;
  });
};

const applyDependenciesFilter = (tasks: Task[], filters: FilterState, taskDependencies: any[]): Task[] => {
  return tasks.filter(task => {
    const hasDependencies = taskDependencies.some(dep => dep.task_id === task.id);
    return filters.hasDependencies ? hasDependencies : !hasDependencies;
  });
};
