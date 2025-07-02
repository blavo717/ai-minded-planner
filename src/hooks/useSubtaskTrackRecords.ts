import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTaskLogMutations } from './useTaskLogMutations';
import { TaskLog } from '@/types/taskLogs';

interface UseSubtaskTrackRecordsProps {
  subtaskId: string;
}

export const useSubtaskTrackRecords = ({ subtaskId }: UseSubtaskTrackRecordsProps) => {
  const { user } = useAuth();
  const { updateLog, deleteLog } = useTaskLogMutations();
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Obtener track records de la subtarea
  const { data: trackRecords = [], refetch } = useQuery({
    queryKey: ['subtask-track-records', subtaskId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('task_logs')
        .select('*')
        .eq('task_id', subtaskId)
        .eq('user_id', user.id)
        .eq('log_type', 'quick_update')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subtask track records:', error);
        throw error;
      }

      return data as TaskLog[];
    },
    enabled: !!user && !!subtaskId,
  });

  const handleStartEdit = (record: TaskLog) => {
    setEditingRecord(record.id);
    setEditContent(record.content || '');
  };

  const handleSaveEdit = (recordId: string) => {
    if (!editContent.trim()) return;

    updateLog({
      id: recordId,
      content: editContent,
      metadata: {
        edited_at: new Date().toISOString(),
        edited: true
      }
    });

    setEditingRecord(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditContent('');
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('¿Eliminar este registro de avance?')) {
      deleteLog(recordId);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffMinutes < 1 ? 'Ahora' : `Hace ${diffMinutes}m`;
    }
    
    if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `Hace ${diffDays}d`;
    }
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    trackRecords,
    editingRecord,
    editContent,
    setEditContent,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteRecord,
    formatTimestamp,
    refetch
  };
};