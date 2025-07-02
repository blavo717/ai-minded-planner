import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskSessions } from './useTaskSessions';
import { useTaskMutations } from './useTaskMutations';
import { Task } from './useTasks';

export const useActiveWorkSession = (task: Task | undefined, taskId: string) => {
  const navigate = useNavigate();
  const { activeSession, startSession, endSession, isStarting, isEnding } = useTaskSessions();
  const { completeTask, markInProgress } = useTaskMutations();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [taskProgress, setTaskProgress] = useState(0);

  // Inicializar progreso basado en estado de la tarea
  useEffect(() => {
    if (task) {
      if (task.status === 'completed') {
        setTaskProgress(100);
      } else if (task.status === 'in_progress') {
        const estimated = task.estimated_duration || 60;
        const worked = task.actual_duration || 0;
        const estimatedProgress = Math.min(90, Math.round((worked / estimated) * 100));
        setTaskProgress(estimatedProgress);
      } else {
        setTaskProgress(0);
      }
    }
  }, [task]);

  // Auto-iniciar sesión al entrar
  useEffect(() => {
    if (task && !activeSession) {
      startSession(taskId);
      if (task.status === 'pending') {
        markInProgress(taskId);
      }
    }
  }, [task, taskId, activeSession, startSession, markInProgress]);

  // Timer para calcular tiempo transcurrido
  useEffect(() => {
    if (!activeSession) return;
    
    const startTime = new Date(activeSession.started_at).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeSession]);

  const handlePauseWork = () => {
    if (activeSession) {
      endSession({ 
        sessionId: activeSession.id,
        productivityScore: Math.min(5, Math.max(1, Math.round(taskProgress / 20)))
      });
      navigate('/planner');
    }
  };

  const handleCompleteTask = async () => {
    if (activeSession) {
      await endSession({ 
        sessionId: activeSession.id,
        productivityScore: 5,
        notes: 'Tarea completada desde modo trabajo activo'
      });
    }
    
    await completeTask({
      taskId: taskId!,
      completionNotes: `Completada en modo trabajo activo. Progreso: ${taskProgress}%`
    });
    
    navigate('/planner');
  };

  const handleMarkInProgress = () => {
    if (task && task.status !== 'in_progress') {
      markInProgress(taskId!);
    }
  };

  return {
    elapsedTime,
    taskProgress,
    setTaskProgress,
    activeSession,
    isStarting,
    isEnding,
    handlePauseWork,
    handleCompleteTask,
    handleMarkInProgress
  };
};