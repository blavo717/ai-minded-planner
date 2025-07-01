
import React, { useState } from 'react';
import { Search, Filter, ChevronDown, AlertTriangle, Calendar, Star, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ExpandableAdvancedFilters from './ExpandableAdvancedFilters';
import QuickFilterButton from './QuickFilterButton';
import { FilterState } from '@/types/filters';

interface Project {
  id: string;
  name: string;
  color?: string;
}

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
}

interface TopFiltersBarProps {
  projects: Project[];
  profiles: Profile[];
  availableTags: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSaveFilter: (name: string, filterData: FilterState) => void;
  onLoadFilter: (filters: FilterState) => void;
  taskAssignments: any[];
  taskDependencies: any[];
  overdueTasks: number;
  todayTasks: number;
  highPriorityTasks: number;
  unassignedTasks: number;
  recentTasks: number;
}

const TopFiltersBar = ({
  projects,
  profiles,
  availableTags,
  filters,
  onFiltersChange,
  onSaveFilter,
  onLoadFilter,
  taskAssignments,
  taskDependencies,
  overdueTasks,
  todayTasks,
  highPriorityTasks,
  unassignedTasks,
  recentTasks
}: TopFiltersBarProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleSmartFilterToggle = (filterId: string) => {
    const currentFilters = filters.smartFilters || [];
    const isActive = currentFilters.includes(filterId);
    
    const newFilters = isActive
      ? currentFilters.filter(id => id !== filterId)
      : [...currentFilters, filterId];
    
    onFiltersChange({
      ...filters,
      smartFilters: newFilters
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Fila principal de filtros */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Búsqueda prominente */}
        <div className="flex-1 min-w-64 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tareas..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>

        {/* Filtros rápidos horizontales */}
        <div className="flex items-center gap-2 flex-wrap">
          <QuickFilterButton
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Vencidas"
            active={filters.smartFilters?.includes('overdue') || false}
            count={overdueTasks}
            onClick={() => handleSmartFilterToggle('overdue')}
          />
          <QuickFilterButton
            icon={<Calendar className="h-4 w-4" />}
            label="Hoy"
            active={filters.smartFilters?.includes('today') || false}
            count={todayTasks}
            onClick={() => handleSmartFilterToggle('today')}
          />
          <QuickFilterButton
            icon={<Star className="h-4 w-4" />}
            label="Alta Prioridad"
            active={filters.smartFilters?.includes('high-priority') || false}
            count={highPriorityTasks}
            onClick={() => handleSmartFilterToggle('high-priority')}
          />
          <QuickFilterButton
            icon={<User className="h-4 w-4" />}
            label="Sin Asignar"
            active={filters.smartFilters?.includes('unassigned') || false}
            count={unassignedTasks}
            onClick={() => handleSmartFilterToggle('unassigned')}
          />
          <QuickFilterButton
            icon={<CheckCircle className="h-4 w-4" />}
            label="Recientes"
            active={filters.smartFilters?.includes('recent') || false}
            count={recentTasks}
            onClick={() => handleSmartFilterToggle('recent')}
          />
        </div>

        {/* Botón filtros avanzados */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2 ml-auto"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Panel expandible de filtros avanzados */}
      {showAdvanced && (
        <div className="border-t pt-4 mt-4">
          <ExpandableAdvancedFilters
            projects={projects}
            profiles={profiles}
            availableTags={availableTags}
            filters={filters}
            onFiltersChange={onFiltersChange}
            onSaveFilter={onSaveFilter}
            onLoadFilter={onLoadFilter}
            taskAssignments={taskAssignments}
            taskDependencies={taskDependencies}
          />
        </div>
      )}
    </div>
  );
};

export default TopFiltersBar;
