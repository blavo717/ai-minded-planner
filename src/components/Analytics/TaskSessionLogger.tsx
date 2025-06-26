
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, Plus, CheckCircle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const TaskSessionLogger = () => {
  const { user } = useAuth();
  const { data: tasks } = useTasks();
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);
  
  const [sessionData, setSessionData] = useState({
    taskId: '',
    date: new Date(),
    duration: '',
    productivityScore: '',
    notes: ''
  });

  const activeTasks = tasks?.filter(task => task.status !== 'completed') || [];
  const completedTasks = tasks?.filter(task => task.status === 'completed') || [];

  const handleLogSession = async () => {
    if (!user || !sessionData.taskId || !sessionData.duration) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsLogging(true);

    try {
      const durationMinutes = parseInt(sessionData.duration);
      const startTime = new Date(sessionData.date);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      const { error } = await supabase
        .from('task_sessions')
        .insert({
          user_id: user.id,
          task_id: sessionData.taskId,
          started_at: startTime.toISOString(),
          ended_at: endTime.toISOString(),
          duration_minutes: durationMinutes,
          productivity_score: sessionData.productivityScore ? parseInt(sessionData.productivityScore) : null,
          notes: sessionData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Sesión registrada",
        description: `Se registraron ${durationMinutes} minutos de trabajo`,
      });

      // Limpiar formulario
      setSessionData({
        taskId: '',
        date: new Date(),
        duration: '',
        productivityScore: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error logging session:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar la sesión",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  const selectedTask = tasks?.find(t => t.id === sessionData.taskId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Registrar Sesión de Trabajo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Registra tiempo trabajado en tus tareas para mejorar tus métricas de Analytics
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="task-select">Tarea *</Label>
            <Select value={sessionData.taskId} onValueChange={(value) => 
              setSessionData(prev => ({ ...prev, taskId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una tarea" />
              </SelectTrigger>
              <SelectContent>
                {activeTasks.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Tareas Activas
                    </div>
                    {activeTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                          <span className="truncate">{task.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {completedTasks.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Tareas Completadas
                    </div>
                    {completedTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="truncate">{task.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha de la sesión *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sessionData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sessionData.date ? format(sessionData.date, "PPP", { locale: es }) : "Selecciona fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={sessionData.date}
                  onSelect={(date) => date && setSessionData(prev => ({ ...prev, date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (minutos) *</Label>
            <Input
              id="duration"
              type="number"
              placeholder="60"
              value={sessionData.duration}
              onChange={(e) => setSessionData(prev => ({ ...prev, duration: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productivity">Productividad (1-5)</Label>
            <Select value={sessionData.productivityScore} onValueChange={(value) => 
              setSessionData(prev => ({ ...prev, productivityScore: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Califica tu productividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Muy baja</SelectItem>
                <SelectItem value="2">2 - Baja</SelectItem>
                <SelectItem value="3">3 - Media</SelectItem>
                <SelectItem value="4">4 - Alta</SelectItem>
                <SelectItem value="5">5 - Muy alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedTask && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{selectedTask.priority}</Badge>
              <Badge variant={selectedTask.status === 'completed' ? 'default' : 'secondary'}>
                {selectedTask.status}
              </Badge>
            </div>
            <h4 className="font-medium">{selectedTask.title}</h4>
            {selectedTask.description && (
              <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="¿Qué trabajaste en esta sesión? ¿Hubo obstáculos?"
            value={sessionData.notes}
            onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleLogSession}
          disabled={isLogging || !sessionData.taskId || !sessionData.duration}
          className="w-full"
        >
          {isLogging ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Registrando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Sesión
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskSessionLogger;
