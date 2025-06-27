
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
  RotateCcw,
  AlertTriangle,
  Clock,
  Zap,
  Users,
  Archive
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FilterState } from '@/types/filters';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { getSmartFilters } from '@/utils/smartFilters';

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
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSaveFilter?: (name: string, filters: FilterState) => void;
  onLoadFilter?: (filters: FilterState) => void;
}

const getIconForSmartFilter = (filterId: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    overdue: AlertTriangle,
    due_today: CalendarIcon,
    inactive: Clock,
    high_priority_pending: Zap,
    unassigned: Users,
    recently_completed: Archive,
  };
  return icons[filterId] || Bookmark;
};

const AdvancedFilters = ({ 
  projects, 
  profiles,
  availableTags, 
  filters, 
  onFiltersChange,
  onSaveFilter,
  onLoadFilter 
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [saveFilterDescription, setSaveFilterDescription] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  
  const { savedFilters, saveFilter } = useSavedFilters();
  const smartFilters = getSmartFilters();

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

  const handleArrayFilterChange = (key: keyof FilterState, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[] || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [key]: newArray
    });
  };

  const handleSmartFilterChange = (filterId: string, checked: boolean) => {
    const currentFilters = filters.smartFilters || [];
    const newFilters = checked
      ? [...currentFilters, filterId]
      : currentFilters.filter(id => id !== filterId);
    
    onFiltersChange({
      ...filters,
      smartFilters: newFilters
    });
  };

  const handleOperatorChange = (filterType: keyof FilterState['operators'], operatorType: 'AND' | 'OR') => {
    onFiltersChange({
      ...filters,
      operators: {
        ...filters.operators,
        [filterType]: { type: operatorType }
      }
    });
  };

  const handleDateRangeChange = (type: 'from' | 'to', date?: Date) => {
    onFiltersChange({
      ...filters,
      [type === 'from' ? 'dueDateFrom' : 'dueDateTo']: date
    });
  };

  const handleBooleanFilterChange = (key: keyof FilterState, value?: boolean) => {
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

  const handleSaveFilter = async () => {
    if (saveFilterName.trim()) {
      if (onSaveFilter) {
        onSaveFilter(saveFilterName.trim(), filters);
      } else {
        await saveFilter(saveFilterName.trim(), saveFilterDescription.trim(), filters);
      }
      setSaveFilterName('');
      setSaveFilterDescription('');
      setShowSaveInput(false);
    }
  };

  const handleLoadFilter = (filterData: FilterState) => {
    if (onLoadFilter) {
      onLoadFilter(filterData);
    } else {
      onFiltersChange(filterData);
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

        {/* Filtros inteligentes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filtros Inteligentes</Label>
          <div className="flex flex-wrap gap-2">
            {smartFilters.map((filter) => {
              const Icon = getIconForSmartFilter(filter.id);
              const isActive = filters.smartFilters?.includes(filter.id) || false;
              
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSmartFilterChange(filter.id, !isActive)}
                  className="text-xs"
                  title={filter.description}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {filter.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Filtros guardados */}
        {savedFilters.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Filtros Guardados</Label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((savedFilter) => (
                <Button
                  key={savedFilter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadFilter(savedFilter.filter_data)}
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
            {/* Estados con operador */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Estados</Label>
                <Select
                  value={filters.operators.status.type}
                  onValueChange={(value) => handleOperatorChange('status', value as 'AND' | 'OR')}
                >
                  <SelectTrigger className="w-20 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OR">O</SelectItem>
                    <SelectItem value="AND">Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            {/* Prioridades con operador */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Prioridades</Label>
                <Select
                  value={filters.operators.priority.type}
                  onValueChange={(value) => handleOperatorChange('priority', value as 'AND' | 'OR')}
                >
                  <SelectTrigger className="w-20 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OR">O</SelectItem>
                    <SelectItem value="AND">Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            {/* Proyectos con operador */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Proyectos</Label>
                  <Select
                    value={filters.operators.projects.type}
                    onValueChange={(value) => handleOperatorChange('projects', value as 'AND' | 'OR')}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OR">O</SelectItem>
                      <SelectItem value="AND">Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

            {/* Personas asignadas con operador */}
            {profiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Personas Asignadas</Label>
                  <Select
                    value={filters.operators.assignedTo.type}
                    onValueChange={(value) => handleOperatorChange('assignedTo', value as 'AND' | 'OR')}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OR">O</SelectItem>
                      <SelectItem value="AND">Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

            {/* Etiquetas con operador */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Etiquetas</Label>
                  <Select
                    value={filters.operators.tags.type}
                    onValueChange={(value) => handleOperatorChange('tags', value as 'AND' | 'OR')}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OR">O</SelectItem>
                      <SelectItem value="AND">Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            {getActiveFiltersCount() > 0 && (
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
                  <div className="space-y-2">
                    <Input
                      placeholder="Nombre del filtro..."
                      value={saveFilterName}
                      onChange={(e) => setSaveFilterName(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Descripción (opcional)..."
                      value={saveFilterDescription}
                      onChange={(e) => setSaveFilterDescription(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveFilter}>
                        Guardar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setShowSaveInput(false);
                          setSaveFilterName('');
                          setSaveFilterDescription('');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
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
