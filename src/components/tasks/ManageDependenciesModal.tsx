
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
import { useTasks } from '@/hooks/useTasks';
import { Search, X, Plus, Link2 } from 'lucide-react';

interface ManageDependenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

const ManageDependenciesModal = ({ isOpen, onClose, taskId, taskTitle }: ManageDependenciesModalProps) => {
  const { dependencies, createDependency, deleteDependency, isCreating, isDeleting } = useTaskDependencies(taskId);
  const { tasks } = useTasks();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [dependencyType, setDependencyType] = useState<'blocks' | 'requires' | 'follows'>('requires');

  // Filtrar tareas disponibles (excluir la tarea actual y las que ya tienen dependencias)
  const existingDependencyIds = dependencies.map(d => d.depends_on_task_id);
  const availableTasks = tasks.filter(task => 
    task.id !== taskId && 
    !existingDependencyIds.includes(task.id) &&
    (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     task.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddDependency = () => {
    if (selectedTaskId) {
      createDependency({
        task_id: taskId,
        depends_on_task_id: selectedTaskId,
        dependency_type: dependencyType
      });
      setSelectedTaskId('');
      setSearchTerm('');
    }
  };

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Tarea no encontrada';
  };

  const getDependencyTypeText = (type: string) => {
    switch (type) {
      case 'blocks':
        return 'Bloquea';
      case 'requires':
        return 'Requiere';
      case 'follows':
        return 'Sigue a';
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Gestionar Dependencias - {taskTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Dependencias existentes */}
          <div>
            <h3 className="text-sm font-medium mb-3">Dependencias Actuales</h3>
            {dependencies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay dependencias configuradas</p>
            ) : (
              <div className="space-y-2">
                {dependencies.map((dependency) => (
                  <div key={dependency.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getDependencyTypeText(dependency.dependency_type)}
                      </Badge>
                      <span className="font-medium">
                        {getTaskTitle(dependency.depends_on_task_id)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDependency(dependency.id)}
                      disabled={isDeleting}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agregar nueva dependencia */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Agregar Nueva Dependencia</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Dependencia</Label>
                <Select
                  value={dependencyType}
                  onValueChange={(value: 'blocks' | 'requires' | 'follows') => setDependencyType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requires">Requiere - Esta tarea necesita que se complete otra</SelectItem>
                    <SelectItem value="blocks">Bloquea - Esta tarea debe completarse antes que otra</SelectItem>
                    <SelectItem value="follows">Sigue - Esta tarea viene después de otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Buscar Tarea</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {searchTerm && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <Label>Tareas Disponibles</Label>
                  {availableTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No se encontraron tareas</p>
                  ) : (
                    <div className="space-y-1">
                      {availableTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                            selectedTaskId === task.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div className="font-medium text-sm">{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleAddDependency}
                disabled={!selectedTaskId || isCreating}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Agregando...' : 'Agregar Dependencia'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageDependenciesModal;
