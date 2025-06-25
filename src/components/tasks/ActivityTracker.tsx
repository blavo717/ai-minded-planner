
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Mail, 
  Phone, 
  MessageCircle, 
  Users, 
  Video, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Flag
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskActivity } from '@/hooks/useTaskActivity';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityTrackerProps {
  task: Task;
}

const ActivityTracker = ({ task }: ActivityTrackerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [communicationType, setCommunicationType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const { markAsWorked, recordCommunication, toggleFollowup, isUpdating } = useTaskActivity();

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

  const handleMarkAsWorked = () => {
    markAsWorked(task.id, notes);
    setNotes('');
  };

  const handleRecordCommunication = () => {
    if (!communicationType) return;
    
    recordCommunication(
      task.id,
      communicationType as any,
      notes,
      true // Marcar como necesita seguimiento por defecto
    );
    setCommunicationType('');
    setNotes('');
  };

  const handleToggleFollowup = () => {
    toggleFollowup(task.id, !task.needs_followup);
  };

  const getActivityIcon = (type?: string) => {
    const typeConfig = communicationTypes.find(t => t.value === type);
    if (!typeConfig) return <Clock className="h-3 w-3" />;
    const Icon = typeConfig.icon;
    return <Icon className="h-3 w-3" />;
  };

  const getLastActivityText = () => {
    const lastWorked = task.last_worked_at ? new Date(task.last_worked_at) : null;
    const lastCommunication = task.last_communication_at ? new Date(task.last_communication_at) : null;
    
    if (!lastWorked && !lastCommunication) {
      return <span className="text-gray-500">Sin actividad registrada</span>;
    }

    const mostRecent = lastWorked && lastCommunication 
      ? (lastWorked > lastCommunication ? lastWorked : lastCommunication)
      : (lastWorked || lastCommunication);

    if (!mostRecent) return null;

    const isRecent = mostRecent > new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return (
      <span className={isRecent ? "text-green-600" : "text-yellow-600"}>
        {formatDistanceToNow(mostRecent, { addSuffix: true, locale: es })}
      </span>
    );
  };

  const showFollowupWarning = () => {
    if (!task.last_communication_at) return false;
    const daysSince = (Date.now() - new Date(task.last_communication_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 3 && !task.needs_followup;
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Actividad
            {task.needs_followup && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                <Flag className="h-3 w-3 mr-1" />
                Seguimiento
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Contraer' : 'Expandir'}
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getLastActivityText()}
          </div>
          
          {showFollowupWarning() && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Requiere seguimiento
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Información de última actividad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {task.last_worked_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Trabajado:</span>
                <span>{format(new Date(task.last_worked_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
              </div>
            )}
            
            {task.last_communication_at && (
              <div className="flex items-center gap-2">
                {getActivityIcon(task.communication_type)}
                <span className="text-gray-600">Comunicación:</span>
                <span>{format(new Date(task.last_communication_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
              </div>
            )}
          </div>

          {task.communication_notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <Label className="text-sm font-medium">Notas de comunicación:</Label>
              <p className="text-sm text-gray-700 mt-1">{task.communication_notes}</p>
            </div>
          )}

          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsWorked}
              disabled={isUpdating}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Trabajado hoy
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFollowup}
              disabled={isUpdating}
              className={`flex items-center gap-1 ${task.needs_followup ? 'bg-orange-50 text-orange-700' : ''}`}
            >
              <Flag className="h-3 w-3" />
              {task.needs_followup ? 'Quitar seguimiento' : 'Necesita seguimiento'}
            </Button>
          </div>

          {/* Registrar comunicación */}
          <div className="border-t pt-4 space-y-3">
            <Label className="text-sm font-medium">Registrar comunicación</Label>
            
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
        </CardContent>
      )}
    </Card>
  );
};

export default ActivityTracker;
