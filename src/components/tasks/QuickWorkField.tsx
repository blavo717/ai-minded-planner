import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Zap, TrendingUp } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useQuickWorkField } from '@/hooks/useQuickWorkField';

interface QuickWorkFieldProps {
  task: Task;
  currentProgress: number;
}

const QuickWorkField: React.FC<QuickWorkFieldProps> = ({ task, currentProgress }) => {
  const {
    workContent,
    progress,
    isSaving,
    lastSaved,
    handleContentChange,
    handleProgressUpdate,
    getProgressDiff,
  } = useQuickWorkField({ task, currentProgress });

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diffSeconds < 60) return 'Guardado ahora';
    if (diffSeconds < 3600) return `Guardado hace ${Math.floor(diffSeconds / 60)}m`;
    return `Guardado hace ${Math.floor(diffSeconds / 3600)}h`;
  };

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-base">Actualización Rápida</h3>
            {isSaving && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Guardando...
              </Badge>
            )}
            {lastSaved && !isSaving && (
              <Badge variant="outline" className="text-xs">
                <Save className="w-3 h-3 mr-1" />
                {formatLastSaved()}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentProgress}% → {progress}%
            </Badge>
            {progress !== currentProgress && (
              <Badge 
                variant={progress > currentProgress ? "default" : "destructive"} 
                className="text-xs"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {getProgressDiff()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Campo de texto principal */}
        <div>
          <Textarea
            placeholder="¿En qué estás trabajando ahora? Describe tu progreso, obstáculos o logros..."
            value={workContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-20 resize-none border-primary/20 focus:border-primary/40"
            rows={3}
          />
        </div>

        {/* Botones de progreso */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Progreso:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleProgressUpdate(10)}
            className="h-7 px-3 text-xs hover:bg-green-50 hover:border-green-300 hover:text-green-700"
          >
            +10%
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleProgressUpdate(25)}
            className="h-7 px-3 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
          >
            +25%
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleProgressUpdate(50)}
            className="h-7 px-3 text-xs hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
          >
            +50%
          </Button>
          {progress > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleProgressUpdate(-10)}
              className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              -10%
            </Button>
          )}
        </div>

        {/* Indicador de estado */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Auto-guardado cada 3 segundos</span>
          {isSaving && (
            <span className="text-primary animate-pulse">Guardando cambios...</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickWorkField;