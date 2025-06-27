
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
  Trash2,
} from 'lucide-react';
import { FilterState } from '@/types/filters';
import { useSavedFilters } from '@/hooks/useSavedFilters';

interface FilterPresetsProps {
  currentFilters: FilterState;
  onLoadFilter: (filters: FilterState) => void;
  onSaveFilter: (name: string, description: string) => void;
  getActiveFiltersCount: () => number;
}

const FilterPresets = ({ 
  currentFilters, 
  onLoadFilter, 
  onSaveFilter, 
  getActiveFiltersCount 
}: FilterPresetsProps) => {
  const { savedFilters, loading, deleteFilter } = useSavedFilters();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: '', description: '' });

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

  // Este componente ahora solo maneja filtros guardados personalizados
  // Los filtros inteligentes se manejan directamente en AdvancedFilters
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Filtros Personalizados
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
        {/* Solo filtros guardados personalizados */}
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

        {!loading && savedFilters.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No tienes filtros guardados aún. 
            {getActiveFiltersCount() > 0 && " Puedes guardar el filtro actual usando el botón de arriba."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterPresets;
