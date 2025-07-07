import React, { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import SimplifiedSmartPlanner from '@/components/planner/SimplifiedSmartPlanner';
import OnboardingTour from '@/components/planner/OnboardingTour';
import { Task } from '@/hooks/useTasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Sparkles } from 'lucide-react';

const Planner = () => {
  const { mainTasks } = useTasks();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Verificar si es la primera vez del usuario
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('planner_onboarding_completed');
    if (!hasSeenOnboarding && mainTasks.length > 0) {
      setShowOnboarding(true);
    }
  }, [mainTasks]);

  const handleWorkOnTask = (task: Task) => {
    // Redirigir a la vista de tareas con la tarea seleccionada
    navigate(`/tasks`, { state: { selectedTask: task } });
  };

  const handleShowAllTasks = () => {
    navigate('/tasks');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
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
                <h1 className="text-2xl font-bold">Planificador IA</h1>
                <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 border-purple-300">
                  <Sparkles className="w-3 h-3" />
                  Simplificado
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Una tarea a la vez
            </h2>
            <p className="text-gray-600 text-lg">
              Te recomendamos la mejor tarea para este momento exacto
            </p>
          </div>
          
          <SimplifiedSmartPlanner 
            tasks={mainTasks}
            onWorkOnTask={handleWorkOnTask}
            onShowAllTasks={handleShowAllTasks}
          />
          
          {/* Onboarding Tour */}
          {showOnboarding && (
            <OnboardingTour 
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingSkip}
            />
          )}
          
          {/* Footer info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowOnboarding(true)}
                className="text-blue-600 hover:text-blue-700 h-auto p-0 underline"
              >
                ¿Cómo funciona?
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;