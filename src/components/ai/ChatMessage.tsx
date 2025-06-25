
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Bot, 
  Bell, 
  Lightbulb,
  Clock,
  CheckCircle
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/hooks/useAIAssistant';

interface ChatMessageProps {
  message: ChatMessageType;
  onMarkAsRead?: (messageId: string) => void;
}

const ChatMessage = ({ message, onMarkAsRead }: ChatMessageProps) => {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getMessageStyle = () => {
    switch (message.type) {
      case 'user':
        return 'bg-blue-500 text-white ml-8';
      case 'notification':
        return message.priority === 'urgent' ? 'bg-red-50 border-red-200' : 
               message.priority === 'high' ? 'bg-orange-50 border-orange-200' :
               'bg-blue-50 border-blue-200';
      case 'suggestion':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200 mr-8';
    }
  };

  const getPriorityBadge = () => {
    if (!message.priority || message.type === 'user') return null;
    
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-blue-100 text-blue-800',
      low: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={`text-xs ${colors[message.priority]}`}>
        {message.priority}
      </Badge>
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex gap-3 mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.type !== 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
          {getMessageIcon()}
        </div>
      )}
      
      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
        <Card className={`p-3 ${getMessageStyle()}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {getPriorityBadge()}
              {!message.isRead && message.type !== 'user' && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {formatTime(message.timestamp)}
            </div>
          </div>
          
          <div className="text-sm whitespace-pre-wrap">
            {message.content}
          </div>
          
          {!message.isRead && message.type !== 'user' && onMarkAsRead && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(message.id)}
                className="text-xs h-6 px-2"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Marcar como leído
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {message.type === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
