import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  X,
  Play,
  SkipForward
} from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  const steps = [
    {
      title: "¡Bienvenido al Planificador IA!",
      description: "Te ayudo a elegir la mejor tarea para trabajar en cada momento",
      icon: Brain,
      color: "bg-blue-500"
    },
    {
      title: "Recomendaciones inteligentes",
      description: "Analizo tus tareas, prioridades y patrones para sugerirte qué hacer",
      icon: Target,
      color: "bg-green-500"
    },
    {
      title: "El momento perfecto",
      description: "Considero tu energía, la hora del día y el contexto actual",
      icon: Zap,
      color: "bg-orange-500"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowDemo(true);
    }
  };

  const skipTour = () => {
    localStorage.setItem('planner_onboarding_completed', 'true');
    onSkip();
  };

  const completeTour = () => {
    localStorage.setItem('planner_onboarding_completed', 'true');
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData?.icon;

  if (showDemo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Ejemplo de recomendación</h3>
              <p className="text-gray-600 text-sm">
                Así es como se ve una recomendación del planificador:
              </p>
            </div>

            {/* Demo de tarjeta */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-lg">Revisar propuesta de cliente</h4>
                  <Badge className="bg-orange-500 text-white">high</Badge>
                </div>
                
                <div className="bg-blue-100 border border-blue-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900 text-sm">¿Por qué ahora?</div>
                      <div className="text-blue-800 text-sm">Es urgente y necesita atención inmediata</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold">85%</div>
                    <div className="text-xs text-gray-600">Recomendado</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-green-600">30min</div>
                    <div className="text-xs text-gray-600">Duración</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2">
                    <Play className="w-4 h-4 mr-1" />
                    Empezar
                  </Button>
                  <Button variant="outline" className="flex-1 text-sm py-2">
                    <SkipForward className="w-4 h-4 mr-1" />
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={completeTour} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                ¡Entendido! Empezar a usar
              </Button>
              <Button onClick={skipTour} variant="outline" className="w-full" size="sm">
                Saltar por ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="text-sm text-gray-500">
              Paso {currentStep + 1} de {steps.length}
            </div>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {Icon && (
            <div className="text-center space-y-4 mb-6">
              <div className={`w-16 h-16 mx-auto ${currentStepData.color} rounded-full flex items-center justify-center`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">{currentStepData.title}</h3>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={skipTour} variant="outline" className="flex-1">
              Saltar
            </Button>
            <Button onClick={nextStep} className="flex-1">
              {currentStep === steps.length - 1 ? 'Ver ejemplo' : 'Siguiente'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;