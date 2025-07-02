import { Task } from '@/hooks/useTasks';

export interface EnhancedFactor {
  id: string;
  label: string;
  description: string;
  icon: string;
  weight: number;
  type: 'positive' | 'negative' | 'neutral';
}

export interface ContextualInfo {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  userEnergyLevel: 'high' | 'medium' | 'low';
  completedTasksToday: number;
  workPattern: 'productive' | 'normal' | 'low';
}

export interface SmartRecommendation {
  task: Task;
  confidence: number;
  successProbability: number;
  factors: EnhancedFactor[];
  context: ContextualInfo;
  reasoning: string;
  estimatedDuration: number;
  energyMatch: 'high' | 'medium' | 'low';
}

export class EnhancedFactorsService {
  generateCurrentContext(): ContextualInfo {
    const now = new Date();
    const hour = now.getHours();
    const day = now.toLocaleDateString('es-ES', { weekday: 'long' });
    
    // Determinar momento del día
    const timeOfDay = this.getTimeOfDay(hour);
    
    // Calcular energía del usuario basado en la hora
    const userEnergyLevel = this.calculateUserEnergyLevel(hour);
    
    // Simular tareas completadas hoy (en el futuro vendrá de datos reales)
    const completedTasksToday = this.getCompletedTasksToday();
    
    // Determinar patrón de trabajo
    const workPattern = this.getWorkPattern(completedTasksToday, hour);

    return {
      timeOfDay,
      dayOfWeek: day,
      userEnergyLevel,
      completedTasksToday,
      workPattern
    };
  }

  generateEnhancedFactors(task: Task, context: ContextualInfo): EnhancedFactor[] {
    const factors: EnhancedFactor[] = [];
    
    // Factores de urgencia
    factors.push(...this.generateUrgencyFactors(task));
    
    // Factores de contexto temporal
    factors.push(...this.generateTimeContextFactors(task, context));
    
    // Factores de energía
    factors.push(...this.generateEnergyFactors(task, context));
    
    // Factores de momentum
    factors.push(...this.generateMomentumFactors(task, context));
    
    // Ordenar por peso (mayor a menor)
    return factors.sort((a, b) => b.weight - a.weight);
  }

  generateUrgencyFactors(task: Task): EnhancedFactor[] {
    const factors: EnhancedFactor[] = [];
    const now = new Date();
    
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        factors.push({
          id: 'overdue',
          label: 'Tarea Vencida',
          description: `Vencida hace ${Math.abs(diffDays)} días`,
          icon: '🚨',
          weight: 100,
          type: 'negative'
        });
      } else if (diffDays === 0) {
        factors.push({
          id: 'due_today',
          label: 'Vence Hoy',
          description: 'La fecha límite es hoy',
          icon: '⏰',
          weight: 95,
          type: 'positive'
        });
      } else if (diffDays === 1) {
        factors.push({
          id: 'due_tomorrow',
          label: 'Vence Mañana',
          description: 'La fecha límite es mañana',
          icon: '📅',
          weight: 80,
          type: 'positive'
        });
      }
    }
    
    if (task.priority === 'urgent' || task.priority === 'high') {
      factors.push({
        id: 'high_priority',
        label: 'Alta Prioridad',
        description: `Prioridad ${task.priority}`,
        icon: '🔥',
        weight: 70,
        type: 'positive'
      });
    }
    
    return factors;
  }

  generateTimeContextFactors(task: Task, context: ContextualInfo): EnhancedFactor[] {
    const factors: EnhancedFactor[] = [];
    
    if (context.timeOfDay === 'morning' && context.userEnergyLevel === 'high') {
      factors.push({
        id: 'morning_energy',
        label: 'Energía Matutina',
        description: 'Mañana productiva con alta energía',
        icon: '🌅',
        weight: 75,
        type: 'positive'
      });
    }
    
    if (context.workPattern === 'productive') {
      factors.push({
        id: 'productive_day',
        label: 'Día Productivo',
        description: 'Ya has completado varias tareas hoy',
        icon: '📈',
        weight: 60,
        type: 'positive'
      });
    }
    
    if (context.userEnergyLevel === 'high') {
      factors.push({
        id: 'high_energy',
        label: 'Alta Energía',
        description: 'Tu nivel de energía está en su punto más alto',
        icon: '⚡',
        weight: 65,
        type: 'positive'
      });
    }
    
    return factors;
  }

  generateEnergyFactors(task: Task, context: ContextualInfo): EnhancedFactor[] {
    const factors: EnhancedFactor[] = [];
    const taskEnergyRequired = this.estimateTaskEnergyRequirement(task);
    
    if (context.userEnergyLevel === 'high' && taskEnergyRequired === 'high') {
      factors.push({
        id: 'energy_match',
        label: 'Coincidencia de Energía',
        description: 'Tu energía alta coincide con los requisitos de la tarea',
        icon: '🎯',
        weight: 55,
        type: 'positive'
      });
    } else if (context.userEnergyLevel === 'low' && taskEnergyRequired === 'high') {
      factors.push({
        id: 'energy_mismatch',
        label: 'Energía Insuficiente',
        description: 'Esta tarea requiere más energía de la que tienes ahora',
        icon: '🔋',
        weight: 40,
        type: 'negative'
      });
    }
    
    return factors;
  }

  generateMomentumFactors(task: Task, context: ContextualInfo): EnhancedFactor[] {
    const factors: EnhancedFactor[] = [];
    
    if (task.status === 'in_progress') {
      factors.push({
        id: 'in_progress',
        label: 'En Progreso',
        description: 'Ya has comenzado a trabajar en esta tarea',
        icon: '🚀',
        weight: 90,
        type: 'positive'
      });
    }
    
    if (context.completedTasksToday > 2) {
      factors.push({
        id: 'momentum',
        label: 'Buen Momentum',
        description: 'Llevas un buen ritmo de trabajo hoy',
        icon: '🎯',
        weight: 55,
        type: 'positive'
      });
    }
    
    return factors;
  }

  calculateConfidenceScore(factors: EnhancedFactor[]): number {
    const positiveWeights = factors
      .filter(f => f.type === 'positive')
      .reduce((sum, f) => sum + f.weight, 0);
    
    const negativeWeights = factors
      .filter(f => f.type === 'negative')
      .reduce((sum, f) => sum + f.weight, 0);
    
    const score = positiveWeights - (negativeWeights * 0.5);
    return Math.max(0, Math.min(100, score));
  }

  calculateSuccessProbability(task: Task, context: ContextualInfo, factors: EnhancedFactor[]): number {
    let probability = 50; // Base 50%
    
    // Ajustes por contexto
    if (context.userEnergyLevel === 'high') probability += 15;
    if (context.workPattern === 'productive') probability += 10;
    if (task.status === 'in_progress') probability += 20;
    if (task.priority === 'high' || task.priority === 'urgent') probability += 10;
    
    // Ajustes por factores negativos
    const negativeFactors = factors.filter(f => f.type === 'negative');
    probability -= negativeFactors.length * 5;
    
    return Math.max(10, Math.min(95, probability));
  }

  estimateTaskDuration(task: Task): number {
    if (task.estimated_duration) {
      return task.estimated_duration;
    }
    
    // Estimación básica basada en prioridad y complejidad
    if (task.priority === 'urgent') return 30;
    if (task.priority === 'high') return 45;
    if (task.priority === 'medium') return 60;
    return 90;
  }

  private getTimeOfDay(hour: number): ContextualInfo['timeOfDay'] {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private calculateUserEnergyLevel(hour: number): ContextualInfo['userEnergyLevel'] {
    if (hour >= 6 && hour < 12) return 'high';    // Mañana
    if (hour >= 12 && hour < 18) return 'medium'; // Tarde
    if (hour >= 18 && hour < 22) return 'medium'; // Noche
    return 'low'; // Madrugada
  }

  private getCompletedTasksToday(): number {
    // Simulación - en el futuro vendrá de datos reales
    const hour = new Date().getHours();
    if (hour < 10) return 0;
    if (hour < 14) return Math.floor(Math.random() * 3);
    if (hour < 18) return Math.floor(Math.random() * 5) + 2;
    return Math.floor(Math.random() * 7) + 3;
  }

  private getWorkPattern(completedTasks: number, hour: number): ContextualInfo['workPattern'] {
    const expectedTasks = Math.max(1, Math.floor(hour / 4));
    if (completedTasks > expectedTasks + 2) return 'productive';
    if (completedTasks < expectedTasks - 1) return 'low';
    return 'normal';
  }

  private estimateTaskEnergyRequirement(task: Task): 'high' | 'medium' | 'low' {
    if (task.priority === 'urgent' || task.priority === 'high') return 'high';
    if (task.estimated_duration && task.estimated_duration > 60) return 'medium';
    return 'low';
  }
}

export const enhancedFactorsService = new EnhancedFactorsService();