
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Brain, Clock, Zap, Cpu } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EnhancedMessage } from '@/hooks/ai/types/enhancedAITypes';

interface MessageDisplayProps {
  message: EnhancedMessage;
}

const MessageDisplay = ({ message }: MessageDisplayProps) => {
  const formatTokens = (tokens?: number) => {
    if (!tokens || tokens === 0) return null;
    return tokens > 1000 ? `${(tokens / 1000).toFixed(1)}k` : tokens.toString();
  };

  const formatResponseTime = (time?: number) => {
    if (!time || time === 0) return null;
    return time > 1000 ? `${(time / 1000).toFixed(1)}s` : `${time}ms`;
  };

  const formatModelName = (modelName?: string) => {
    if (!modelName) return null;
    // Extraer solo el nombre del modelo sin el prefijo del proveedor
    const parts = modelName.split('/');
    return parts[parts.length - 1] || modelName;
  };

  const isAssistant = message.type === 'assistant';
  const hasMetadata = isAssistant && message.metadata;

  return (
    <div className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 rounded-full p-2 ${
        message.type === 'user' 
          ? 'bg-blue-100 text-blue-600' 
          : 'bg-purple-100 text-purple-600'
      }`}>
        {message.type === 'user' ? (
          <User className="h-4 w-4" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
      </div>
      
      {/* Mensaje y Metadatos */}
      <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
        {/* Contenido del mensaje */}
        <div className={`inline-block p-3 rounded-lg ${
          message.type === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-purple-50 text-purple-900 border border-purple-200'
        }`}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        
        {/* Timestamp y Metadatos */}
        <div className={`flex items-center gap-2 mt-2 flex-wrap ${
          message.type === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          {/* Timestamp */}
          <span className="text-xs text-muted-foreground">
            {format(message.timestamp, 'HH:mm', { locale: es })}
          </span>
          
          {/* Metadatos solo para mensajes del asistente */}
          {hasMetadata && (
            <>
              {/* Modelo usado */}
              {message.metadata?.model_used && (
                <Badge variant="outline" className="text-xs py-0.5 px-2 h-6">
                  <Cpu className="h-3 w-3 mr-1" />
                  {formatModelName(message.metadata.model_used)}
                </Badge>
              )}
              
              {/* Tokens usados */}
              {formatTokens(message.metadata?.tokens_used) && (
                <Badge variant="outline" className="text-xs py-0.5 px-2 h-6 bg-green-50 text-green-700 border-green-200">
                  <Zap className="h-3 w-3 mr-1" />
                  {formatTokens(message.metadata?.tokens_used)} tokens
                </Badge>
              )}
              
              {/* Tiempo de respuesta */}
              {formatResponseTime(message.metadata?.response_time) && (
                <Badge variant="outline" className="text-xs py-0.5 px-2 h-6 bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatResponseTime(message.metadata?.response_time)}
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
