
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';

export interface GanttTestData {
  tasks: Task[];
  projects: Project[];
}

export class GanttTestUtils {
  static generateTestTasks(count: number = 10): Task[] {
    const now = new Date();
    const tasks: Task[] = [];

    for (let i = 0; i < count; i++) {
      const startDate = new Date(now.getTime() + (i - 5) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + (Math.random() * 14 + 1) * 24 * 60 * 60 * 1000);
      
      tasks.push({
        id: `test-task-${i}`,
        title: `Test Task ${i + 1}`,
        description: `Description for test task ${i + 1}`,
        status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as any,
        priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
        user_id: 'test-user',
        project_id: `test-project-${Math.floor(i / 3)}`,
        created_at: startDate.toISOString(),
        updated_at: startDate.toISOString(),
        due_date: endDate.toISOString(),
        task_level: 1 as const,
        is_archived: false
      });
    }

    return tasks;
  }

  static generateTestProjects(count: number = 3): Project[] {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    const priorities = ['low', 'medium', 'high', 'urgent'] as const;
    const projects: Project[] = [];

    for (let i = 0; i < count; i++) {
      projects.push({
        id: `test-project-${i}`,
        name: `Test Project ${i + 1}`,
        description: `Description for test project ${i + 1}`,
        color: colors[i % colors.length],
        status: 'active',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add all required new fields with default values
        priority: priorities[i % priorities.length],
        progress: Math.floor(Math.random() * 100),
        budget_used: 0,
        actual_hours: 0,
        custom_fields: {},
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: Math.floor(Math.random() * 10000) + 1000,
        tags: [`tag-${i}`, `category-${i % 2}`],
        category: `Category ${i + 1}`,
        estimated_hours: Math.floor(Math.random() * 100) + 10,
        completion_notes: undefined,
        completed_at: undefined,
        archived_at: undefined,
        change_reason: undefined,
        last_status_change: undefined,
        template_name: undefined
      });
    }

    return projects;
  }

  static validateGanttData(tasks: Task[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    tasks.forEach((task, index) => {
      if (!task.due_date) {
        errors.push(`Task ${index} missing due_date`);
      }
      if (!task.created_at) {
        errors.push(`Task ${index} missing created_at`);
      }
      if (task.due_date && task.created_at) {
        const start = new Date(task.created_at);
        const end = new Date(task.due_date);
        if (end <= start) {
          errors.push(`Task ${index} has invalid date range`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static calculateExpectedProgress(status: string): number {
    switch (status) {
      case 'completed': return 100;
      case 'in_progress': return 50;
      case 'pending': return 0;
      case 'cancelled': return 0;
      default: return 0;
    }
  }

  static generatePerformanceTestData(taskCount: number): GanttTestData {
    return {
      tasks: this.generateTestTasks(taskCount),
      projects: this.generateTestProjects(Math.ceil(taskCount / 5))
    };
  }
}
