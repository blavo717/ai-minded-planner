import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock, ArrowRight } from 'lucide-react';

interface NextStepsProps {
  taskProgress: number;
  elapsedTime: number;
}

const NextSteps: React.FC<NextStepsProps> = ({ taskProgress, elapsedTime }) => {
  const [customSteps, setCustomSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');

  const addCustomStep = () => {
    if (newStep.trim()) {
      setCustomSteps(prev => [...prev, newStep.trim()]);
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setCustomSteps(prev => prev.filter((_, i) => i !== index));
  };

  const getSuggestedSteps = () => {
    const timeInMinutes = elapsedTime / 60;
    const steps = [];

    if (taskProgress < 25) {
      steps.push('📋 Revisar los objetivos de la tarea');
      steps.push('🎯 Definir el primer paso concreto');
      steps.push('⏰ Establecer micro-metas de 15 min');
    } else if (taskProgress < 50) {
      steps.push('✅ Validar el progreso actual');
      steps.push('🔍 Identificar posibles obstáculos');
      steps.push('📝 Documentar decisiones importantes');
    } else if (taskProgress < 75) {
      steps.push('🚀 Acelerar hacia la meta final');
      steps.push('🔍 Revisar la calidad del trabajo');
      steps.push('📋 Preparar entrega/siguiente fase');
    } else if (taskProgress < 100) {
      steps.push('✨ Completar los detalles finales');
      steps.push('🔍 Hacer revisión final');
      steps.push('📦 Preparar para entrega');
    } else {
      steps.push('🎉 ¡Tarea completada!');
      steps.push('📝 Documentar lecciones aprendidas');
      steps.push('🎯 Planificar siguiente tarea');
    }

    // Agregar sugerencias basadas en tiempo
    if (timeInMinutes > 45) {
      steps.push('☕ Considerar un descanso');
    }

    return steps;
  };

  const suggestedSteps = getSuggestedSteps();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Próximos Pasos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pasos sugeridos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              Sugeridos
            </Badge>
            <span className="text-xs text-muted-foreground">
              Basado en tu progreso ({taskProgress}%)
            </span>
          </div>
          
          {suggestedSteps.map((step, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group"
            >
              <div className="flex-1">
                <p className="text-sm">{step}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCustomSteps(prev => [...prev, step.replace(/[📋🎯⏰✅🔍📝🚀✨📦🎉☕]/g, '').trim()])}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Pasos personalizados */}
        {customSteps.length > 0 && (
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              Mis Pasos
            </Badge>
            
            {customSteps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20 group"
              >
                <div className="flex-1">
                  <p className="text-sm">{step}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeStep(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-destructive"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Agregar paso personalizado */}
        <div className="space-y-2 pt-2 border-t">
          <Textarea
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="Añadir paso personalizado..."
            className="min-h-[60px] text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addCustomStep();
              }
            }}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Enter para agregar, Shift+Enter para nueva línea
            </span>
            <Button 
              size="sm" 
              onClick={addCustomStep}
              disabled={!newStep.trim()}
              className="h-7"
            >
              Agregar
            </Button>
          </div>
        </div>

        {/* Tiempo recomendado */}
        {elapsedTime > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {elapsedTime < 1800 ? 'Mantén el ritmo' : 
                 elapsedTime < 3600 ? 'Considera un descanso pronto' :
                 'Es momento de tomar un descanso'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NextSteps;