import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EnhancedFactor } from '@/services/enhancedFactorsService';

interface FactorsBadgesProps {
  factors: EnhancedFactor[];
  maxVisible?: number;
}

export const FactorsBadges: React.FC<FactorsBadgesProps> = ({ factors, maxVisible = 3 }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {factors.slice(0, maxVisible).map((factor) => (
        <Badge 
          key={factor.id} 
          variant={factor.type === 'positive' ? 'default' : factor.type === 'negative' ? 'destructive' : 'secondary'}
          className="text-xs"
        >
          {factor.icon} {factor.label}
        </Badge>
      ))}
    </div>
  );
};