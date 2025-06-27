
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Bookmark, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Zap, 
  Users, 
  Archive 
} from 'lucide-react';
import { FilterState } from '@/types/filters';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { getSmartFilters } from '@/utils/smartFilters';

interface FilterPresetsProps {
  currentFilters: FilterState;
  onLoadFilter: (filters: FilterState) => void;
  onSaveFilter: (name: string, description: string) => void;
  getActiveFiltersCount: () => number;
}

const getIconForSmartFilter = (filterId: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    overdue: AlertTriangle,
    due_today: Calendar,
    inactive: Clock,
    high_priority_pending: Zap,
    unassigned: Users,
    recently_completed: Archive,
  };
  return icons[filterId] || Bookmark;
};

const FilterPresets = ({ 
  currentFilters, 
  onLoadFilter, 
  onSaveFilter, 
  getActiveFiltersCount 
}: FilterPresetsProps) => {
  const { savedFilters, loading, deleteFilter } = useSavedFilters();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: '', description: '' });
  const smartFilters = getSmartFilters();

  const handleSaveFilter = () => {
    if (saveForm.name.trim()) {
      onSaveFilter(saveForm.name.trim(), saveForm.description.trim());
      setSaveForm({ name: '', description: '' });
      setShowSaveDialog(false);
    }
  };

  const handleDeleteFilter = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este filtro?')) {
      await deleteFilter(id);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Filtros y Presets
          </span>
          {getActiveFiltersCount() > 0 && (
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Guardar Filtro Actual
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Guardar Filtro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="filter-name">Nombre del Filtro</Label>
                    <Input
                      id="filter-name"
                      value={saveForm.name}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Tareas Urgentes del Proyecto X"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-description">Descripción (opcional)</Label>
                    <Textarea
                      id="filter-description"
                      value={saveForm.description}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe brevemente este filtro..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveFilter} disabled={!saveForm.name.trim()}>
                      Guardar Filtro
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros Inteligentes */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Filtros Inteligentes</h4>
          <div className="flex flex-wrap gap-2">
            {smartFilters.map((filter) => {
              const Icon = getIconForSmartFilter(filter.id);
              const isActive = currentFilters.smartFilters.includes(filter.id);
              
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newSmartFilters = isActive
                      ? currentFilters.smartFilters.filter(id => id !== filter.id)
                      : [...currentFilters.smartFilters, filter.id];
                    
                    onLoadFilter({
                      ...currentFilters,
                      smartFilters: newSmartFilters
                    });
                  }}
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

        {/* Filtros Guardados */}
        {savedFilters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Filtros Guardados</h4>
            <div className="space-y-2">
              {savedFilters.map((filter) => (
                <div 
                  key={filter.id} 
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onLoadFilter(filter.filter_data)}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{filter.name}</span>
                      {filter.is_default && (
                        <Badge variant="secondary" className="text-xs">Por defecto</Badge>
                      )}
                    </div>
                    {filter.description && (
                      <p className="text-xs text-muted-foreground mt-1">{filter.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLoadFilter(filter.filter_data)}
                      className="h-8 w-8 p-0"
                    >
                      <Bookmark className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Cargando filtros guardados...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterPresets;
