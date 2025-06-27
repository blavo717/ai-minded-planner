
export interface FilterOperator {
  type: 'AND' | 'OR';
}

export interface SmartFilter {
  id: string;
  name: string;
  description: string;
  filterFunction: (tasks: any[]) => any[];
  icon: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filter_data: FilterState;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilterState {
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
  // Nuevos filtros inteligentes
  smartFilters: string[];
  // Operadores lógicos
  operators: {
    status: FilterOperator;
    priority: FilterOperator;
    projects: FilterOperator;
    tags: FilterOperator;
    assignedTo: FilterOperator;
  };
}
