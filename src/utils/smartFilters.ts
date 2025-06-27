
import { Task } from '@/hooks/useTasks';
import { SmartFilter } from '@/types/filters';
import { Clock, AlertTriangle, Calendar, Zap, Archive, Users } from 'lucide-react';

export const getSmartFilters = (): SmartFilter[] => [
  {
    id: 'overdue',
    name: 'Tareas Vencidas',
    description: 'Tareas que han pasado su fecha límite',
    icon: 'AlertTriangle',
    filterFunction: (tasks: Task[]) => {
      const now = new Date();
      return tasks.filter(task => 
        task.due_date && 
        new Date(task.due_date) < now && 
        task.status !== 'completed'
      );
    }
  },
  {
    id: 'due_today',
    name: 'Vencen Hoy',
    description: 'Tareas que vencen hoy',
    icon: 'Calendar',
    filterFunction: (tasks: Task[]) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return tasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate < tomorrow;
      });
    }
  },
  {
    id: 'inactive',
    name: 'Sin Actividad',
    description: 'Tareas sin actividad reciente (7+ días)',
    icon: 'Clock',
    filterFunction: (tasks: Task[]) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return tasks.filter(task => {
        const lastActivity = task.last_worked_at || task.updated_at;
        return new Date(lastActivity) < sevenDaysAgo && task.status !== 'completed';
      });
    }
  },
  {
    id: 'high_priority_pending',
    name: 'Alta Prioridad Pendientes',
    description: 'Tareas de alta prioridad o urgentes pendientes',
    icon: 'Zap',
    filterFunction: (tasks: Task[]) => {
      return tasks.filter(task => 
        (task.priority === 'high' || task.priority === 'urgent') &&
        task.status === 'pending'
      );
    }
  },
  {
    id: 'unassigned',
    name: 'Sin Asignar',
    description: 'Tareas que no están asignadas a nadie',
    icon: 'Users',
    filterFunction: (tasks: Task[]) => {
      // Aquí necesitaríamos acceso a la información de asignaciones
      // Por ahora lo dejamos como placeholder
      return tasks.filter(task => task.status !== 'completed');
    }
  },
  {
    id: 'recently_completed',
    name: 'Completadas Recientemente',
    description: 'Tareas completadas en los últimos 7 días',
    icon: 'Archive',
    filterFunction: (tasks: Task[]) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return tasks.filter(task => 
        task.status === 'completed' &&
        task.completed_at &&
        new Date(task.completed_at) >= sevenDaysAgo
      );
    }
  }
];

export const applySmartFilter = (tasks: Task[], filterId: string): Task[] => {
  const smartFilter = getSmartFilters().find(filter => filter.id === filterId);
  return smartFilter ? smartFilter.filterFunction(tasks) : tasks;
};
