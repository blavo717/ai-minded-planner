
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Clock,
  Zap,
  Settings,
  Play,
  Coffee,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDailyPlanner } from '@/hooks/useDailyPlanner';

const DailyPlannerPreview = () => {
  const { 
    todaysPlan, 
    isLoadingTodaysPlan, 
    isGeneratingPlan, 
    generatePlan 
  } = useDailyPlanner();
  
  const [showSettings, setShowSettings] = useState(false);

  const handleGeneratePlan = () => {
    const today = new Date().toISOString().split('T')[0];
    generatePlan({
      planDate: today,
      preferences: {
        workingHours: { start: '09:00', end: '18:00' },
        includeBreaks: true,
        prioritizeHighPriority: true,
        maxTasksPerBlock: 3
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'task': return <Play className="h-3 w-3" />;
      case 'break': return <Coffee className="h-3 w-3" />;
      case 'buffer': return <Clock className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  if (isLoadingTodaysPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Plan Diario IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Plan Diario IA
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isGeneratingPlan ? 'Generando...' : 'Generar Plan'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!todaysPlan ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay plan para hoy
            </h3>
            <p className="text-gray-600 mb-4">
              Genera un plan diario optimizado con IA para organizar tu día
            </p>
            <Button onClick={handleGeneratePlan} disabled={isGeneratingPlan}>
              <Zap className="h-4 w-4 mr-2" />
              {isGeneratingPlan ? 'Generando...' : 'Crear Plan del Día'}
            </Button>
          </div>
        ) : (
          <>
            {/* Métricas del plan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {todaysPlan.planned_tasks?.filter(t => t.type === 'task').length || 0}
                </div>
                <div className="text-sm text-gray-600">Tareas</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((todaysPlan.estimated_duration || 0) / 60)}h
                </div>
                <div className="text-sm text-gray-600">Duración</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((todaysPlan.ai_confidence || 0) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Confianza</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {todaysPlan.planned_tasks?.filter(t => t.type === 'break').length || 0}
                </div>
                <div className="text-sm text-gray-600">Descansos</div>
              </div>
            </div>

            <Separator />

            {/* Lista de bloques planificados */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Agenda del Día
              </h4>
              
              {todaysPlan.planned_tasks?.map((block, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getBlockIcon(block.type)}
                    <span className="font-medium text-sm truncate">
                      {block.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {block.startTime} - {block.endTime}
                    </Badge>
                    
                    {block.type === 'task' && (
                      <Badge className={`text-xs ${getPriorityColor(block.priority)}`}>
                        {block.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Estrategia de optimización */}
            {todaysPlan.optimization_strategy && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Estrategia:</span>
                  <span>{todaysPlan.optimization_strategy}</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyPlannerPreview;
