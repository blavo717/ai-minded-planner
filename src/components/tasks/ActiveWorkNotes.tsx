import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Edit3, Clock } from 'lucide-react';

interface ActiveWorkNotesProps {
  taskId: string;
}

const ActiveWorkNotes: React.FC<ActiveWorkNotesProps> = ({ taskId }) => {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save cada 30 segundos
  useEffect(() => {
    if (notes.trim() && !isEditing) {
      const interval = setInterval(() => {
        handleSaveNotes();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [notes, isEditing]);

  // Cargar notas guardadas al inicializar
  useEffect(() => {
    const savedNotes = localStorage.getItem(`work_notes_${taskId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [taskId]);

  const handleSaveNotes = () => {
    if (notes.trim()) {
      localStorage.setItem(`work_notes_${taskId}`, notes);
      setLastSaved(new Date());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSaveNotes();
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Notas de Trabajo
          </CardTitle>
          {lastSaved && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Guardado {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setIsEditing(true);
          }}
          placeholder="Escribe tus notas de trabajo aquí... 

• ¿Qué estás haciendo?
• ¿Qué problemas has encontrado?
• ¿Qué has completado?
• ¿Próximos pasos?"
          className="min-h-[200px] resize-none"
          onKeyDown={handleKeyDown}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {isEditing ? (
              <span className="text-orange-600">• Sin guardar - Ctrl+S para guardar</span>
            ) : notes.trim() ? (
              <span className="text-green-600">• Guardado automáticamente</span>
            ) : (
              <span>Escribe para comenzar...</span>
            )}
          </div>
          
          {isEditing && (
            <Button 
              size="sm" 
              onClick={handleSaveNotes}
              className="h-7"
            >
              <Save className="w-3 h-3 mr-1" />
              Guardar
            </Button>
          )}
        </div>
        
        {notes.trim() && (
          <div className="mt-4 p-3 bg-muted/20 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Estadísticas</div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-medium">{notes.length}</span>
                <span className="text-muted-foreground"> caracteres</span>
              </div>
              <div>
                <span className="font-medium">{notes.split(/\s+/).filter(w => w.length > 0).length}</span>
                <span className="text-muted-foreground"> palabras</span>
              </div>
              <div>
                <span className="font-medium">{notes.split('\n').filter(l => l.trim().length > 0).length}</span>
                <span className="text-muted-foreground"> líneas</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveWorkNotes;