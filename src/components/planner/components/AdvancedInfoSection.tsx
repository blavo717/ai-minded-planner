import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { EnhancedFactor, ContextualInfo } from '@/services/enhancedFactorsService';

interface AdvancedInfoSectionProps {
  showAdvanced: boolean;
  onToggle: (show: boolean) => void;
  context: ContextualInfo;
  factors: EnhancedFactor[];
}

export const AdvancedInfoSection: React.FC<AdvancedInfoSectionProps> = ({
  showAdvanced,
  onToggle,
  context,
  factors
}) => {
  return (
    <Collapsible open={showAdvanced} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between">
          <span className="text-sm">Información detallada</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-3 border-t">
        {/* Estado del usuario */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Tu estado actual
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Energía: <span className="font-medium">{context.userEnergyLevel}</span></div>
            <div>Momento: <span className="font-medium">{context.timeOfDay}</span></div>
            <div>Completadas hoy: <span className="font-medium">{context.completedTasksToday}</span></div>
            <div>Patrón: <span className="font-medium">{context.workPattern}</span></div>
          </div>
        </div>

        {/* Todos los factores */}
        <div className="space-y-2">
          <h4 className="font-medium">Todos los factores considerados:</h4>
          {factors.map((factor) => (
            <div key={factor.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
              <span className="flex items-center gap-2">
                <span>{factor.icon}</span>
                <span>{factor.label}</span>
              </span>
              <span className={`font-medium ${factor.type === 'positive' ? 'text-green-600' : factor.type === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                {factor.type === 'positive' ? '+' : factor.type === 'negative' ? '-' : ''}{factor.weight}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};