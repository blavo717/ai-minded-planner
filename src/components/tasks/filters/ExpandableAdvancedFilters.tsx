
import React from 'react';
import { FilterState } from '@/types/filters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import SavedFiltersSection from './SavedFiltersSection';
import { useSavedFilters } from '@/hooks/useSavedFilters';

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

interface ExpandableAdvancedFiltersProps {
  projects: Project[];
  profiles: Profile[];
  availableTags: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSaveFilter: (name: string, filterData: FilterState) => void;
  onLoadFilter: (filters: FilterState) => void;
  taskAssignments: any[];
  taskDependencies: any[];
}

const ExpandableAdvancedFilters = ({
  projects,
  profiles,
  availableTags,
  filters,
  onFiltersChange,
  onSaveFilter,
  onLoadFilter,
  taskAssignments,
  taskDependencies
}: ExpandableAdvancedFiltersProps) => {
  const { savedFilters, loading } = useSavedFilters();

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, status: [] });
    } else {
      onFiltersChange({ ...filters, status: [value] });
    }
  };

  const handlePriorityChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, priority: [] });
    } else {
      onFiltersChange({ ...filters, priority: [value] });
    }
  };

  const handleProjectChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, projects: [] });
    } else {
      onFiltersChange({ ...filters, projects: [value] });
    }
  };

  const handleAssigneeChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, assignedTo: [] });
    } else {
      onFiltersChange({ ...filters, assignedTo: [value] });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
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

  return (
    <div className="space-y-4">
      {/* Grid de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estado */}
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">Estado</label>
          <Select value={filters.status?.[0] || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prioridad */}
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">Prioridad</label>
          <Select value={filters.priority?.[0] || 'all'} onValueChange={handlePriorityChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas las prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Proyecto */}
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">Proyecto</label>
          <Select value={filters.projects?.[0] || 'all'} onValueChange={handleProjectChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos los proyectos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asignado a */}
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">Asignado a</label>
          <Select value={filters.assignedTo?.[0] || 'all'} onValueChange={handleAssigneeChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.full_name || profile.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros guardados y acciones */}
      <div className="flex items-center justify-between pt-2 border-t">
        <SavedFiltersSection
          savedFilters={savedFilters}
          loading={loading}
          onLoadFilter={onLoadFilter}
        />
        
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar filtros ({getActiveFiltersCount()})
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExpandableAdvancedFilters;
