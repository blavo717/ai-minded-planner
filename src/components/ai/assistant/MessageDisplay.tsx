
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EnhancedMessage } from '@/hooks/ai/types/enhancedAITypes';

interface MessageDisplayProps {
  message: EnhancedMessage;
}

const MessageDisplay = ({ message }: MessageDisplayProps) => {
  return (
    <div
      className={`flex gap-3 ${
        message.type === 'user' ? 'flex-row-reverse' : ''
      }`}
    >
      <div className={`flex-shrink-0 ${
        message.type === 'user' 
          ? 'bg-blue-100 text-blue-600' 
          : 'bg-purple-100 text-purple-600'
      } rounded-full p-2`}>
        {message.type === 'user' ? (
          <User className="h-4 w-4" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
      </div>
      
      <div className={`flex-1 max-w-[80%] ${
        message.type === 'user' ? 'text-right' : ''
      }`}>
        <div className={`inline-block p-3 rounded-lg ${
          message.type === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-purple-50 text-purple-900 border border-purple-200'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">
            {format(message.timestamp, 'HH:mm', { locale: es })}
          </p>
          {message.metadata?.model_used && (
            <Badge variant="outline" className="text-xs py-0">
              {message.metadata.model_used}
            </Badge>
          )}
          {message.metadata?.tokens_used && (
            <Badge variant="outline" className="text-xs py-0">
              {message.metadata.tokens_used} tokens
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
