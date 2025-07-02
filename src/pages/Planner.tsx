import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import SmartWhatToDoNow from '@/components/planner/SmartWhatToDoNow';
import { Task } from '@/hooks/useTasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';

const Planner = () => {
  const { mainTasks } = useTasks();
  const navigate = useNavigate();

  const handleWorkOnTask = (task: Task) => {
    // Redirigir a la vista de tareas con la tarea seleccionada
    navigate(`/tasks`, { state: { selectedTask: task } });
  };

  const handleShowAllTasks = () => {
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/tasks')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Planificador Inteligente</h1>
                <Badge variant="secondary" className="text-xs">
                  MVP
                </Badge>
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {mainTasks.length} tareas disponibles
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl text-muted-foreground mb-2">
              Enfócate en una tarea a la vez
            </h2>
            <p className="text-sm text-muted-foreground">
              El planificador IA selecciona la tarea más importante para ti en este momento
            </p>
          </div>
          
          <SmartWhatToDoNow 
            tasks={mainTasks}
            onWorkOnTask={handleWorkOnTask}
            onShowAllTasks={handleShowAllTasks}
          />
          
          {/* Info del MVP */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Versión MVP - Tu feedback nos ayuda a mejorar la experiencia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;