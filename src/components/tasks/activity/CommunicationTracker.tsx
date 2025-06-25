
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Users, 
  Video, 
  Calendar
} from 'lucide-react';
import { useTaskActivity } from '@/hooks/useTaskActivity';

interface CommunicationTrackerProps {
  taskId: string;
}

const CommunicationTracker = ({ taskId }: CommunicationTrackerProps) => {
  const [communicationType, setCommunicationType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const { recordCommunication, isUpdating } = useTaskActivity();

  const communicationTypes = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Teléfono', icon: Phone },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { value: 'meeting', label: 'Reunión', icon: Users },
    { value: 'video_call', label: 'Videollamada', icon: Video },
    { value: 'chat', label: 'Chat', icon: MessageCircle },
    { value: 'in_person', label: 'En persona', icon: Users },
    { value: 'other', label: 'Otro', icon: Calendar },
  ];

  const handleRecordCommunication = () => {
    if (!communicationType) return;
    
    recordCommunication(
      taskId,
      communicationType as any,
      notes,
      true
    );
    setCommunicationType('');
    setNotes('');
  };

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select value={communicationType} onValueChange={setCommunicationType}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de comunicación" />
          </SelectTrigger>
          <SelectContent>
            {communicationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleRecordCommunication}
          disabled={!communicationType || isUpdating}
          size="sm"
        >
          Registrar
        </Button>
      </div>
      
      <Textarea
        placeholder="Notas de la comunicación (opcional)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
    </div>
  );
};

export default CommunicationTracker;
