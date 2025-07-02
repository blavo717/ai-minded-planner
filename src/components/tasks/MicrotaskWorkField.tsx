import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Loader2, MessageCircle, Send } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useMicrotaskWorkField } from '@/hooks/useMicrotaskWorkField';

interface MicrotaskWorkFieldProps {
  microtask: Task;
  showByDefault?: boolean;
}

const MicrotaskWorkField: React.FC<MicrotaskWorkFieldProps> = ({ 
  microtask, 
  showByDefault = false 
}) => {
  const {
    workContent,
    isExpanded,
    isSaving,
    handleContentChange,
    handleToggleExpanded,
    handleSubmit,
    getContextualPlaceholder,
  } = useMicrotaskWorkField({ microtask });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(workContent);
    }
  };

  const shouldShow = showByDefault || isExpanded || workContent.trim() !== '';

  return (
    <div className="ml-6 mt-2">
      {/* Botón para expandir/contraer */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleExpanded}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 mr-1" />
        ) : (
          <ChevronRight className="w-3 h-3 mr-1" />
        )}
        <MessageCircle className="w-3 h-3 mr-1" />
        Trabajo específico
        {workContent.trim() && (
          <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
            {workContent.length}
          </Badge>
        )}
      </Button>

      {/* Campo de trabajo específico */}
      {shouldShow && (
        <div className="mt-2 space-y-2">
          <div className="relative">
            <Textarea
              placeholder={getContextualPlaceholder()}
              value={workContent}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-16 text-xs border-primary/20 focus:border-primary/40 bg-background/50 pr-10"
              rows={2}
              disabled={isSaving}
            />
            
            {/* Botón de envío */}
            <div className="absolute bottom-2 right-2">
              {isSaving ? (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  <Loader2 className="w-2 h-2 mr-1 animate-spin" />
                  Guardando...
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleSubmit(workContent)}
                  disabled={!workContent.trim()}
                  className="h-5 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="w-2 h-2" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Información contextual */}
          <div className="text-xs text-muted-foreground">
            Presiona Enter para guardar el avance • Específico para esta microtarea
          </div>
        </div>
      )}
    </div>
  );
};

export default MicrotaskWorkField;