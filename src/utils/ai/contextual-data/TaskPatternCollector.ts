
import { ContextualData } from '@/types/contextual-data';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { differenceInHours } from 'date-fns';

export class TaskPatternCollector {
  static collectTaskPatternData(
    tasks: Task[], 
    projects: Project[], 
    timestamp: Date
  ): ContextualData[] {
    const data: ContextualData[] = [];

    // Análisis de distribución de tareas por proyecto
    const projectDistribution = this.getProjectTaskDistribution(tasks, projects);
    
    data.push({
      id: `task-patterns-projects-${timestamp.getTime()}`,
      type: 'task_patterns',
      category: 'historical',
      data: {
        projectDistribution,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        tasksPerProject: projectDistribution,
      },
      timestamp,
      relevanceScore: projects.length > 0 ? 0.8 : 0.3,
      source: 'project_task_analysis',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 0.85,
        dataSources: ['tasks', 'projects'],
      },
    });

    // Análisis de patrones de deadline
    const deadlinePatterns = this.analyzeDeadlinePatterns(tasks, timestamp);
    
    data.push({
      id: `task-patterns-deadlines-${timestamp.getTime()}`,
      type: 'task_patterns',
      category: 'predictive',
      data: deadlinePatterns,
      timestamp,
      relevanceScore: deadlinePatterns.tasksWithDeadlines > 0 ? 0.9 : 0.2,
      source: 'deadline_pattern_analysis',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 0.7,
        dataSources: ['tasks'],
      },
    });

    return data;
  }

  private static getProjectTaskDistribution(tasks: Task[], projects: Project[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    projects.forEach(project => {
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      distribution[project.name] = projectTasks.length;
    });
    
    // Tareas sin proyecto
    const tasksWithoutProject = tasks.filter(task => !task.project_id);
    if (tasksWithoutProject.length > 0) {
      distribution['Sin proyecto'] = tasksWithoutProject.length;
    }
    
    return distribution;
  }

  private static analyzeDeadlinePatterns(tasks: Task[], currentTime: Date): Record<string, any> {
    const tasksWithDeadlines = tasks.filter(task => task.due_date);
    
    if (tasksWithDeadlines.length === 0) {
      return { tasksWithDeadlines: 0 };
    }

    const now = currentTime.getTime();
    const overdue = tasksWithDeadlines.filter(task => new Date(task.due_date!).getTime() < now);
    const dueSoon = tasksWithDeadlines.filter(task => {
      const deadline = new Date(task.due_date!).getTime();
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
      return hoursUntilDeadline > 0 && hoursUntilDeadline <= 48;
    });

    return {
      tasksWithDeadlines: tasksWithDeadlines.length,
      overdueTasks: overdue.length,
      dueSoonTasks: dueSoon.length,
      overduePercentage: (overdue.length / tasksWithDeadlines.length) * 100,
      avgDaysToDeadline: tasksWithDeadlines.reduce((sum, task) => {
        const days = (new Date(task.due_date!).getTime() - now) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, days);
      }, 0) / tasksWithDeadlines.length,
    };
  }
}
