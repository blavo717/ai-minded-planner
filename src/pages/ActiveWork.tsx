import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useActiveWorkData } from '@/hooks/useActiveWorkData';
import { useActiveWorkSession } from '@/hooks/useActiveWorkSession';
import ActiveWorkHeader from '@/components/tasks/ActiveWorkHeader';
import ActiveWorkInfo from '@/components/tasks/ActiveWorkInfo';
import ActiveWorkProgress from '@/components/tasks/ActiveWorkProgress';
import ActiveWorkNotes from '@/components/tasks/ActiveWorkNotes';
import ActiveWorkActions from '@/components/tasks/ActiveWorkActions';
import WorkSessionSummary from '@/components/tasks/WorkSessionSummary';
import NextSteps from '@/components/tasks/NextSteps';
import HierarchicalWorkView from '@/components/tasks/HierarchicalWorkView';
import WorkBreadcrumb from '@/components/tasks/WorkBreadcrumb';

const ActiveWork = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  
  // Datos de la tarea y jerarquía
  const { task, hierarchyData } = useActiveWorkData(taskId!);
  
  // Estado y funciones de la sesión de trabajo
  const {
    elapsedTime,
    taskProgress,
    setTaskProgress,
    activeSession,
    isStarting,
    isEnding,
    handlePauseWork,
    handleCompleteTask,
    handleMarkInProgress
  } = useActiveWorkSession(task, taskId!);

  // Estado de tarea no encontrada
  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Tarea no encontrada</h2>
          <Button onClick={() => navigate('/planner')}>
            Volver al Planificador
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ActiveWorkHeader 
        elapsedTime={elapsedTime}
        isStarting={isStarting}
      />

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb jerárquico */}
          <WorkBreadcrumb 
            task={task}
            hierarchyData={hierarchyData}
            projectName={task.project_id ? 'Proyecto' : undefined}
          />

          {/* Resumen de sesión */}
          <WorkSessionSummary 
            elapsedTime={elapsedTime}
            taskProgress={taskProgress}
            taskTitle={task.title}
            isActive={!!activeSession && !activeSession.ended_at}
          />
          
          {/* Info de la tarea */}
          <ActiveWorkInfo task={task} />

          {/* Área principal jerárquica */}
          <HierarchicalWorkView 
            task={task}
            hierarchyData={hierarchyData}
          />

          {/* Botones de acción */}
          <ActiveWorkActions
            task={task}
            taskProgress={taskProgress}
            isEnding={isEnding}
            onCompleteTask={handleCompleteTask}
            onPauseWork={handlePauseWork}
            onMarkInProgress={handleMarkInProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default ActiveWork;