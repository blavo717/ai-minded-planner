
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TaskLogEntryFormProps {
  taskId: string;
  onSubmit: (description: string) => void;
  onCancel: () => void;
}

const TaskLogEntryForm: React.FC<TaskLogEntryFormProps> = ({ 
  taskId, 
  onSubmit, 
  onCancel 
}) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description.trim());
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Añadir nota..."
        className="w-full p-2 border rounded"
        rows={3}
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!description.trim()}>
          Añadir
        </Button>
      </div>
    </form>
  );
};

export default TaskLogEntryForm;
