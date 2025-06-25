
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Target, 
  X, 
  Eye 
} from 'lucide-react';
import { AIInsight } from '@/hooks/useAIInsights';

interface AIInsightCardProps {
  insight: AIInsight;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const AIInsightCard = ({ insight, onMarkAsRead, onDismiss }: AIInsightCardProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity_trend':
        return TrendingUp;
      case 'time_optimization':
        return Clock;
      case 'task_suggestion':
        return Target;
      default:
        return Lightbulb;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Alta';
      case 2:
        return 'Media';
      default:
        return 'Baja';
    }
  };

  const Icon = getInsightIcon(insight.insight_type);

  return (
    <Card className={`relative ${!insight.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {insight.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(insight.priority)} text-white border-0`}
                >
                  {getPriorityLabel(insight.priority)}
                </Badge>
                {!insight.is_read && (
                  <Badge variant="outline" className="text-xs">
                    Nuevo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {!insight.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(insight.id)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(insight.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {insight.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            {insight.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default AIInsightCard;
