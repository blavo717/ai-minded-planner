import React from 'react';
import { Task } from '@/hooks/useTasks';
import ActiveWorkSubtasks from './ActiveWorkSubtasks';
import ActiveWorkMicrotasks from './ActiveWorkMicrotasks';

interface WorkLevelRouterProps {
  task: Task;
  hierarchyData: {
    parentTask?: Task;
    children: Task[];
    siblings: Task[];
    totalHierarchy: Task[];
  };
}

const WorkLevelRouter: React.FC<WorkLevelRouterProps> = ({ task, hierarchyData }) => {
  const { children, siblings } = hierarchyData;

  // Función para renderizar contenido específico por nivel
  const renderLevelSpecificContent = () => {
    switch (task.task_level) {
      case 1: // Tarea principal
        return (
          <div className="space-y-4">
            {/* Mostrar subtareas */}
            <ActiveWorkSubtasks taskId={task.id} />
            
            {/* Si hay subtareas, mostrar sus microtareas */}
            {children.filter(c => c.task_level === 2).length > 0 && (
              <div className="space-y-3">
                {children
                  .filter(c => c.task_level === 2)
                  .slice(0, 2) // Mostrar solo las primeras 2 subtareas
                  .map(subtask => (
                  <div key={subtask.id} className="border-l-2 border-primary/20 pl-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Microtareas de: {subtask.title}
                    </h4>
                    <ActiveWorkMicrotasks taskId={subtask.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 2: // Subtarea
        return (
          <div className="space-y-4">
            {/* Mostrar subtareas hermanas */}
            {siblings.length > 1 && (
              <div className="bg-muted/20 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Subtareas relacionadas</h4>
                <div className="flex flex-wrap gap-2">
                  {siblings
                    .filter(s => s.id !== task.id)
                    .slice(0, 3)
                    .map(sibling => (
                    <span 
                      key={sibling.id} 
                      className="text-xs bg-background px-2 py-1 rounded border"
                    >
                      {sibling.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mostrar microtareas de esta subtarea */}
            <ActiveWorkMicrotasks taskId={task.id} />
          </div>
        );
        
      case 3: // Microtarea
        return (
          <div className="space-y-4">
            {/* Mostrar microtareas hermanas */}
            {siblings.length > 1 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Microtareas relacionadas</h4>
                <div className="space-y-1">
                  {siblings
                    .filter(s => s.id !== task.id)
                    .slice(0, 4)
                    .map(sibling => (
                    <div key={sibling.id} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        sibling.status === 'completed' ? 'bg-green-500' : 'bg-muted-foreground'
                      }`} />
                      <span className="text-xs">{sibling.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Enfoque ultra-específico para microtarea */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🎯 Modo Ultra-Enfocado
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Estás trabajando en la unidad más pequeña. Concéntrate completamente en esta acción específica.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="work-level-router">
      {renderLevelSpecificContent()}
    </div>
  );
};

export default WorkLevelRouter;