
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  Tag, 
  Bookmark,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface AdvancedFiltersProps {
  projects: Project[];
  profiles: Profile[];
  availableTags: string[];
  filters: {
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
  };
  onFiltersChange: (filters: any) => void;
  onSaveFilter?: (name: string, filters: any) => void;
  savedFilters?: Array<{ name: string; filters: any }>;
  onLoadFilter?: (filters: any) => void;
}

const AdvancedFilters = ({ 
  projects, 
  profiles,
  availableTags, 
  filters, 
  onFiltersChange,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter 
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja', color: 'bg-green-500' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-500' },
    { value: 'high', label: 'Alta', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgente', color: 'bg-red-500' }
  ];

  const handleArrayFilterChange = (key: string, value: string, checked: boolean) => {
    const currentArray = filters[key as keyof typeof filters] as string[] || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [key]: newArray
    });
  };

  const handleDateRangeChange = (type: 'from' | 'to', date?: Date) => {
    onFiltersChange({
      ...filters,
      [type === 'from' ? 'dueDateFrom' : 'dueDateTo']: date
    });
  };

  const handleBooleanFilterChange = (key: string, value?: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
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
      hasDependencies: undefined
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.projects.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.assignedTo.length > 0) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    if (filters.hasSubtasks !== undefined) count++;
    if (filters.hasDependencies !== undefined) count++;
    return count;
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim() && onSaveFilter) {
      onSaveFilter(saveFilterName.trim(), filters);
      setSaveFilterName('');
      setShowSaveInput(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros Avanzados
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </span>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Contraer' : 'Expandir'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Búsqueda básica - siempre visible */}
        <div>
          <Input
            placeholder="Buscar tareas..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Filtros guardados */}
        {savedFilters.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Filtros Guardados</Label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((savedFilter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadFilter?.(savedFilter.filters)}
                  className="text-xs"
                >
                  <Bookmark className="h-3 w-3 mr-1" />
                  {savedFilter.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="space-y-6">
            {/* Estados */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estados</Label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.status.includes(status.value)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('status', status.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`status-${status.value}`} className="text-sm font-normal">
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Prioridades */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prioridades</Label>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map((priority) => (
                  <div key={priority.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority.value}`}
                      checked={filters.priority.includes(priority.value)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('priority', priority.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`priority-${priority.value}`} className="text-sm font-normal flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                      {priority.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Proyectos */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Proyectos</Label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={filters.projects.includes(project.id)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('projects', project.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`project-${project.id}`} className="text-sm font-normal flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: project.color || '#3B82F6' }}
                        />
                        {project.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personas asignadas */}
            {profiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Personas Asignadas</Label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignedTo-${profile.id}`}
                        checked={filters.assignedTo.includes(profile.id)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('assignedTo', profile.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`assignedTo-${profile.id}`} className="text-sm font-normal">
                        {profile.full_name || profile.email}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Etiquetas */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Etiquetas</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs flex items-center gap-1"
                      onClick={() => handleArrayFilterChange('tags', tag, !filters.tags.includes(tag))}
                    >
                      <Tag className="h-2 w-2" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rango de fechas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha de Vencimiento</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dueDateFrom ? (
                        format(filters.dueDateFrom, 'PPP', { locale: es })
                      ) : (
                        <span>Desde...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dueDateFrom}
                      onSelect={(date) => handleDateRangeChange('from', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dueDateTo ? (
                        format(filters.dueDateTo, 'PPP', { locale: es })
                      ) : (
                        <span>Hasta...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dueDateTo}
                      onSelect={(date) => handleDateRangeChange('to', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filtros adicionales */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Características</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSubtasks"
                    checked={filters.hasSubtasks === true}
                    onCheckedChange={(checked) => 
                      handleBooleanFilterChange('hasSubtasks', checked ? true : undefined)
                    }
                  />
                  <Label htmlFor="hasSubtasks" className="text-sm font-normal">
                    Con subtareas
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDependencies"
                    checked={filters.hasDependencies === true}
                    onCheckedChange={(checked) => 
                      handleBooleanFilterChange('hasDependencies', checked ? true : undefined)
                    }
                  />
                  <Label htmlFor="hasDependencies" className="text-sm font-normal">
                    Con dependencias
                  </Label>
                </div>
              </div>
            </div>

            {/* Guardar filtro */}
            {onSaveFilter && getActiveFiltersCount() > 0 && (
              <div className="space-y-2 pt-4 border-t">
                {!showSaveInput ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveInput(true)}
                    className="w-full"
                  >
                    <Bookmark className="h-3 w-3 mr-2" />
                    Guardar Filtro Actual
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del filtro..."
                      value={saveFilterName}
                      onChange={(e) => setSaveFilterName(e.target.value)}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={handleSaveFilter}>
                      Guardar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowSaveInput(false);
                        setSaveFilterName('');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
