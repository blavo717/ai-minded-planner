/**
 * SPRINT 2 - MVP PROACTIVO 
 * Componente para mostrar alertas proactivas en el chat
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { DeadlineAlert } from '@/services/basicProactiveAlerts';

interface ProactiveAlertProps {
  alert: DeadlineAlert;
  onActionClick: (alert: DeadlineAlert) => void;
  onDismiss: (alertId: string) => void;
}

const ProactiveAlert: React.FC<ProactiveAlertProps> = ({
  alert,
  onActionClick,
  onDismiss
}) => {
  const getSeverityStyles = () => {
    switch (alert.severity) {
      case 'high':
        return {
          container: 'border-red-200 bg-red-50',
          badge: 'bg-red-100 text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'medium':
        return {
          container: 'border-yellow-200 bg-yellow-50',
          badge: 'bg-yellow-100 text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          container: 'border-blue-200 bg-blue-50',
          badge: 'bg-blue-100 text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getSeverityStyles();
  const timeText = alert.daysUntilDue === 0 ? 'Hoy' : 
                   alert.daysUntilDue === 1 ? 'Mañana' : 
                   `${alert.daysUntilDue} días`;

  return (
    <div className="my-4 animate-fade-in">
      <Alert className={`${styles.container} border transition-ai shadow-ai-sm`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-ai-primary" />
              <h4 className="font-semibold text-ai-primary">{alert.title}</h4>
              <Badge variant="outline" className={styles.badge}>
                {timeText}
              </Badge>
            </div>
            
            <AlertDescription className="text-ai-text mb-3">
              {alert.message}
            </AlertDescription>
            
            <div className="flex items-center gap-2 text-sm text-ai-text-muted mb-3">
              <Clock className="h-3 w-3" />
              <span>Prioridad: {alert.task.priority}</span>
              {alert.task.estimated_duration && (
                <>
                  <span>•</span>
                  <span>~{alert.task.estimated_duration} min</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className={`${styles.button} text-white transition-ai shadow-ai-sm hover:shadow-ai-md`}
                onClick={() => onActionClick(alert)}
              >
                {alert.actionLabel}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-ai-text-muted hover:text-ai-text transition-ai"
                onClick={() => onDismiss(alert.id)}
              >
                No ahora
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default ProactiveAlert;