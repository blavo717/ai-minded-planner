import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, 
  Moon, 
  Coffee, 
  Zap, 
  Brain, 
  Clock,
  Lightbulb,
  Target,
  Calendar
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useProductivityPreferences } from '@/hooks/useProductivityPreferences';

interface ContextualRecommendationsProps {
  task: Task;
  confidence: number;
  onReasonChange?: (newReason: string) => void;
}

interface ContextualInfo {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  energyLevel: 'high' | 'medium' | 'low';
  workSession: 'start' | 'middle' | 'end';
}

const ContextualRecommendations: React.FC<ContextualRecommendationsProps> = ({
  task,
  confidence,
  onReasonChange
}) => {
  const { preferences, isCurrentlyWorkingTime, getCurrentEnergyLevel } = useProductivityPreferences();
  // Generar contexto actual
  const context = useMemo((): ContextualInfo => {
    const now = new Date();
    const hour = now.getHours();
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    
    // Determinar momento del día
    let timeOfDay: ContextualInfo['timeOfDay'];
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Usar nivel de energía de las preferencias del usuario
    const energyLevel = getCurrentEnergyLevel();

    // Determinar sesión de trabajo basado en preferencias del usuario
    let workSession: ContextualInfo['workSession'] = 'middle';
    if (preferences && hour === preferences.work_hours_start) workSession = 'start';
    else if (preferences && hour >= preferences.work_hours_end - 1) workSession = 'end';

    return {
      timeOfDay,
      dayOfWeek: dayNames[now.getDay()],
      energyLevel,
      workSession
    };
  }, []);

  // Generar recomendación contextual
  const contextualReason = useMemo(() => {
    const reasons = [];

    // Razones basadas en urgencia y prioridad
    if (task.priority === 'urgent') {
      reasons.push("Es urgente y requiere atención inmediata");
    } else if (task.priority === 'high') {
      reasons.push("Tiene alta prioridad en tu lista");
    }

    // Razones basadas en fecha límite
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue === 0) {
        reasons.push("vence hoy");
      } else if (daysUntilDue === 1) {
        reasons.push("vence mañana");
      } else if (daysUntilDue <= 3) {
        reasons.push(`vence en ${daysUntilDue} días`);
      }
    }

    // Verificar si estamos en horario de trabajo
    if (isCurrentlyWorkingTime()) {
      reasons.push("estás en tu horario de trabajo configurado");
    } else {
      reasons.push("puedes trabajar en tareas personales fuera del horario laboral");
    }

    // Razones contextuales basadas en hora del día y preferencias
    switch (context.timeOfDay) {
      case 'morning':
        if (context.energyLevel === 'high') {
          reasons.push("es tu momento de mayor energía según tu configuración");
        } else {
          reasons.push("es un buen momento para tareas de planificación");
        }
        break;
      case 'afternoon':
        if (task.priority === 'high' || task.priority === 'urgent') {
          reasons.push("es el momento ideal para tareas importantes");
        } else {
          reasons.push("perfecto para tareas que requieren concentración");
        }
        break;
      case 'evening':
        reasons.push("ideal para cerrar tareas pendientes del día");
        break;
      case 'night':
        if (task.estimated_duration && task.estimated_duration <= 30) {
          reasons.push("es una tarea rápida para antes de descansar");
        } else {
          reasons.push("puedes preparar el terreno para mañana");
        }
        break;
    }

    // Razones basadas en nivel de energía
    if (context.energyLevel === 'high' && (task.priority === 'high' || task.priority === 'urgent')) {
      reasons.push("tu energía alta coincide con la importancia de la tarea");
    } else if (context.energyLevel === 'low' && task.estimated_duration && task.estimated_duration <= 30) {
      reasons.push("es una tarea ligera que puedes manejar fácilmente");
    }

    // Razones basadas en duración estimada
    if (task.estimated_duration) {
      if (task.estimated_duration <= 15) {
        reasons.push("es muy rápida de completar");
      } else if (task.estimated_duration <= 30) {
        reasons.push("puedes completarla en poco tiempo");
      } else if (context.energyLevel === 'high') {
        reasons.push("tienes la energía necesaria para esta tarea más larga");
      }
    }

    // Construir la razón final
    if (reasons.length === 0) {
      return "Es un buen momento para trabajar en esta tarea";
    }

    const mainReason = reasons[0];
    const additionalReasons = reasons.slice(1, 3); // Máximo 2 razones adicionales

    if (additionalReasons.length === 0) {
      return mainReason.charAt(0).toUpperCase() + mainReason.slice(1);
    } else if (additionalReasons.length === 1) {
      return `${mainReason.charAt(0).toUpperCase() + mainReason.slice(1)} y ${additionalReasons[0]}`;
    } else {
      return `${mainReason.charAt(0).toUpperCase() + mainReason.slice(1)}, ${additionalReasons.join(' y ')}`;
    }
  }, [task, context]);

  // Generar badges contextuales
  const contextualBadges = useMemo(() => {
    const badges = [];

    // Badge de momento del día
    switch (context.timeOfDay) {
      case 'morning':
        badges.push({
          icon: Sun,
          label: 'Mañana productiva',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
        });
        break;
      case 'afternoon':
        badges.push({
          icon: Zap,
          label: 'Energía alta',
          color: 'bg-blue-100 text-blue-700 border-blue-300'
        });
        break;
      case 'evening':
        badges.push({
          icon: Target,
          label: 'Cierre del día',
          color: 'bg-orange-100 text-orange-700 border-orange-300'
        });
        break;
      case 'night':
        badges.push({
          icon: Moon,
          label: 'Reflexión nocturna',
          color: 'bg-purple-100 text-purple-700 border-purple-300'
        });
        break;
    }

    // Badge de energía basado en configuración personal
    if (context.energyLevel === 'high') {
      badges.push({
        icon: Brain,
        label: 'Alta energía personal',
        color: 'bg-green-100 text-green-700 border-green-300'
      });
    } else if (context.energyLevel === 'low') {
      badges.push({
        icon: Coffee,
        label: 'Energía baja personal',
        color: 'bg-gray-100 text-gray-700 border-gray-300'
      });
    }

    // Badge de horario de trabajo
    if (isCurrentlyWorkingTime()) {
      badges.push({
        icon: Target,
        label: 'Horario laboral',
        color: 'bg-blue-100 text-blue-700 border-blue-300'
      });
    }

    // Badge de duración si la tarea es corta
    if (task.estimated_duration && task.estimated_duration <= 20) {
      badges.push({
        icon: Clock,
        label: 'Tarea rápida',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-300'
      });
    }

    // Badge de momento del día laboral
    if (context.workSession === 'start') {
      badges.push({
        icon: Lightbulb,
        label: 'Inicio del día',
        color: 'bg-cyan-100 text-cyan-700 border-cyan-300'
      });
    }

    return badges.slice(0, 3); // Máximo 3 badges
  }, [context, task]);

  // Aplicar cambio de razón si es necesario
  React.useEffect(() => {
    if (onReasonChange) {
      onReasonChange(contextualReason);
    }
  }, [contextualReason, onReasonChange]);

  // Calcular confianza contextual
  const contextualConfidence = useMemo(() => {
    let boost = 0;

    // Boost por momento del día
    if (context.timeOfDay === 'morning' && context.energyLevel === 'high') boost += 15;
    if (context.timeOfDay === 'afternoon' && task.priority === 'high') boost += 10;

    // Boost por energía vs dificultad
    if (context.energyLevel === 'high' && (task.priority === 'high' || task.priority === 'urgent')) boost += 10;
    if (context.energyLevel === 'low' && task.estimated_duration && task.estimated_duration <= 20) boost += 8;

    // Boost por urgencia
    if (task.priority === 'urgent') boost += 12;
    if (task.due_date) {
      const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) boost += 15;
      else if (daysUntilDue <= 3) boost += 8;
    }

    return Math.min(95, confidence + boost);
  }, [confidence, context, task]);

  return (
    <div className="space-y-3">
      {/* Razón contextual */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">¿Por qué ahora?</h4>
            <p className="text-blue-800 text-sm leading-relaxed">{contextualReason}</p>
          </div>
        </div>
      </div>

      {/* Badges contextuales */}
      {contextualBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {contextualBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            return (
              <Badge
                key={index}
                variant="outline"
                className={`flex items-center gap-1 ${badge.color} text-xs`}
              >
                <IconComponent className="w-3 h-3" />
                {badge.label}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Información de contexto */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {context.dayOfWeek}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {context.timeOfDay === 'morning' && 'Mañana'}
          {context.timeOfDay === 'afternoon' && 'Tarde'}
          {context.timeOfDay === 'evening' && 'Noche'}
          {context.timeOfDay === 'night' && 'Madrugada'}
        </div>
        <div className="flex items-center gap-1">
          <Brain className="w-3 h-3" />
          Energía {context.energyLevel === 'high' ? 'alta' : context.energyLevel === 'medium' ? 'media' : 'baja'}
        </div>
      </div>
    </div>
  );
};

export default ContextualRecommendations;