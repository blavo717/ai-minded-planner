
import { ContextualData } from '@/types/contextual-data';
import { Task } from '@/hooks/useTasks';
import { TaskSession } from '@/hooks/useTaskSessions';
import { differenceInHours } from 'date-fns';

export class UserBehaviorCollector {
  static collectUserBehaviorData(
    tasks: Task[], 
    sessions: TaskSession[], 
    timestamp: Date
  ): ContextualData[] {
    const data: ContextualData[] = [];

    // Patrón de creación de tareas
    const recentTasks = tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      return differenceInHours(timestamp, taskDate) <= 24;
    });

    if (recentTasks.length > 0) {
      data.push({
        id: `user-behavior-tasks-${timestamp.getTime()}`,
        type: 'user_behavior',
        category: 'real_time',
        data: {
          tasksCreatedLast24h: recentTasks.length,
          avgTasksPerHour: recentTasks.length / 24,
          taskStatusDistribution: this.getTaskStatusDistribution(recentTasks),
          taskPriorityDistribution: this.getTaskPriorityDistribution(recentTasks),
        },
        timestamp,
        relevanceScore: Math.min(recentTasks.length / 10, 1),
        source: 'task_creation_patterns',
        metadata: {
          collectionMethod: 'automatic',
          confidence: 0.8,
          dataSources: ['tasks'],
        },
      });
    }

    // Patrones de sesiones de trabajo
    const recentSessions = sessions.filter(session => {
      const sessionDate = new Date(session.started_at);
      return differenceInHours(timestamp, sessionDate) <= 24;
    });

    if (recentSessions.length > 0) {
      data.push({
        id: `user-behavior-sessions-${timestamp.getTime()}`,
        type: 'user_behavior',
        category: 'real_time',
        data: {
          sessionsLast24h: recentSessions.length,
          avgSessionDuration: recentSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / recentSessions.length,
          avgProductivityScore: recentSessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / recentSessions.length,
        },
        timestamp,
        relevanceScore: Math.min(recentSessions.length / 5, 1),
        source: 'work_session_patterns',
        metadata: {
          collectionMethod: 'automatic',
          confidence: 0.9,
          dataSources: ['task_sessions'],
        },
      });
    }

    return data;
  }

  private static getTaskStatusDistribution(tasks: Task[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    tasks.forEach(task => {
      distribution[task.status] = (distribution[task.status] || 0) + 1;
    });
    return distribution;
  }

  private static getTaskPriorityDistribution(tasks: Task[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    tasks.forEach(task => {
      distribution[task.priority] = (distribution[task.priority] || 0) + 1;
    });
    return distribution;
  }
}
