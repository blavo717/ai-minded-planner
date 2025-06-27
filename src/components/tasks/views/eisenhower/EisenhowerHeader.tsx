
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, RotateCcw } from 'lucide-react';

interface EisenhowerHeaderProps {
  autoClassified: number;
  onAutoClassify: () => void;
}

const EisenhowerHeader = ({ autoClassified, onAutoClassify }: EisenhowerHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Matriz de Eisenhower</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {autoClassified > 0 && (
            <Badge variant="secondary" className="text-xs">
              {autoClassified} auto-clasificadas
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onAutoClassify}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Auto-clasificar
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Arrastra las tareas entre cuadrantes para reclasificarlas según urgencia e importancia</p>
      </div>
    </div>
  );
};

export default EisenhowerHeader;
