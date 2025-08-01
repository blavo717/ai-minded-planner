import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit2, Check, X, Trash2, Clock } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useSubtaskTrackRecords } from '@/hooks/useSubtaskTrackRecords';

interface SubtaskTrackRecordProps {
  subtask: Task;
}

const SubtaskTrackRecord: React.FC<SubtaskTrackRecordProps> = ({ subtask }) => {
  const {
    trackRecords,
    editingRecord,
    editContent,
    setEditContent,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteRecord,
    formatTimestamp
  } = useSubtaskTrackRecords({ subtaskId: subtask.id });

  if (trackRecords.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Clock className="w-3 h-3" />
        <span>Historial de avances ({trackRecords.length})</span>
      </div>
      
      <div className="space-y-2 border-l-2 border-primary/20 pl-3">
        {trackRecords.map((record) => (
          <div
            key={record.id}
            className="bg-muted/30 rounded-md p-2 border border-border/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {editingRecord === record.id ? (
                  // Modo edición
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-12 text-xs resize-none"
                      rows={2}
                    />
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(record.id)}
                        className="h-6 px-2 text-xs"
                        disabled={!editContent.trim()}
                      >
                        <Check className="w-2 h-2 mr-1" />
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="w-2 h-2 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo vista
                  <div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {record.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        {formatTimestamp(record.created_at)}
                      </Badge>
                      {record.metadata?.edited && (
                        <Badge variant="secondary" className="text-xs h-4 px-1">
                          Editado
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones */}
              {editingRecord !== record.id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(record)}
                    className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit2 className="w-2 h-2" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRecord(record.id)}
                    className="h-5 w-5 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-2 h-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubtaskTrackRecord;