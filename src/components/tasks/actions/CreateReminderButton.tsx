
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { IntelligentAction } from '@/types/intelligent-actions';
import { Task } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreateReminderButtonProps {
  task: Task;
  action: IntelligentAction;
  onComplete?: () => void;
}

export function CreateReminderButton({ task, action, onComplete }: CreateReminderButtonProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateReminder = async () => {
    if (!user) return;

    try {
      const scheduledFor = action.suggestedData.scheduledFor 
        ? new Date(action.suggestedData.scheduledFor)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas por defecto

      const { error } = await supabase
        .from('smart_reminders')
        .insert({
          user_id: user.id,
          task_id: task.id,
          title: action.suggestedData.title || `Recordatorio: ${task.title}`,
          message: action.suggestedData.content || `Revisar progreso de: ${task.title}`,
          reminder_type: 'task_followup',
          scheduled_for: scheduledFor.toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Recordatorio programado',
        description: `Se programó para ${scheduledFor.toLocaleDateString()}`,
      });
      
      onComplete?.();
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: 'Error al crear recordatorio',
        description: 'No se pudo programar el recordatorio',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCreateReminder}
      className="flex items-center gap-1 text-xs border-orange-200 hover:bg-orange-50 hover:border-orange-300"
    >
      <Clock className="h-3 w-3" />
      {action.label}
    </Button>
  );
}
