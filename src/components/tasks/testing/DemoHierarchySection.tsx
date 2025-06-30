
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface DemoHierarchySectionProps {
  mainTasks: Task[];
  getSubtasksForTask: (taskId: string) => Task[];
  getMicrotasksForSubtask: (subtaskId: string) => Task[];
}

const DemoHierarchySection: React.FC<DemoHierarchySectionProps> = ({
  mainTasks,
  getSubtasksForTask,
  getMicrotasksForSubtask
}) => {
  const totalSubtasks = mainTasks.reduce((acc, task) => acc + getSubtasksForTask(task.id).length, 0);
  const totalMicrotasks = mainTasks.reduce((acc, task) => 
    acc + getSubtasksForTask(task.id).reduce((subAcc, subtask) => 
      subAcc + getMicrotasksForSubtask(subtask.id).length, 0
    ), 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Jerarquía de Tareas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">{mainTasks.length}</span>
            </div>
            <h4 className="font-medium">Tareas Principales</h4>
            <p className="text-sm text-muted-foreground">Nivel 1</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">{totalSubtasks}</span>
            </div>
            <h4 className="font-medium">Subtareas</h4>
            <p className="text-sm text-muted-foreground">Nivel 2</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-purple-600">{totalMicrotasks}</span>
            </div>
            <h4 className="font-medium">Microtareas</h4>
            <p className="text-sm text-muted-foreground">Nivel 3</p>
          </div>
        </div>
        
        {mainTasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Ejemplo de Jerarquía:</h4>
            {mainTasks.slice(0, 2).map((task) => {
              const subtasks = getSubtasksForTask(task.id);
              return (
                <div key={task.id} className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">Tarea</Badge>
                    <span className="font-medium">{task.title}</span>
                  </div>
                  
                  {subtasks.length > 0 && (
                    <div className="ml-4 space-y-2">
                      {subtasks.slice(0, 2).map((subtask) => {
                        const microtasks = getMicrotasksForSubtask(subtask.id);
                        return (
                          <div key={subtask.id}>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-green-100 text-green-800">Subtarea</Badge>
                              <span className="text-sm">{subtask.title}</span>
                            </div>
                            
                            {microtasks.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {microtasks.slice(0, 2).map((microtask) => (
                                  <div key={microtask.id} className="flex items-center gap-2">
                                    <Badge className="bg-purple-100 text-purple-800">Microtarea</Badge>
                                    <span className="text-xs">{microtask.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DemoHierarchySection;
