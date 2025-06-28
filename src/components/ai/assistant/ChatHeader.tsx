
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Database, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';
import { ConnectionStatus } from '@/hooks/ai/types/enhancedAITypes';

interface ChatHeaderProps {
  connectionStatus: ConnectionStatus;
  contextAvailable: boolean;
  messageCount: number;
  onClearChat: () => void;
  onExportConversation: () => void;
  isLoading: boolean;
  hasMessages: boolean;
  activeModel?: string;
}

const ChatHeader = ({
  connectionStatus,
  contextAvailable,
  messageCount,
  onClearChat,
  onExportConversation,
  isLoading,
  hasMessages,
  activeModel
}: ChatHeaderProps) => {
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Error';
      default:
        return 'Desconectado';
    }
  };

  const formatModelName = (model?: string) => {
    if (!model) return '';
    // Extraer solo el nombre del modelo sin el proveedor
    const parts = model.split('/');
    return parts[parts.length - 1] || model;
  };

  return (
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-purple-500" />
        Asistente IA
        {contextAvailable && (
          <Badge variant="outline" className="ml-2">
            <Database className="h-3 w-3 mr-1" />
            Contexto Activo
          </Badge>
        )}
        {activeModel && (
          <Badge variant="secondary" className="ml-2">
            <Brain className="h-3 w-3 mr-1" />
            {formatModelName(activeModel)}
          </Badge>
        )}
      </CardTitle>
      
      <div className="flex items-center gap-2">
        <Badge className={`${getConnectionColor()} border`}>
          {getConnectionIcon()}
          <span className="ml-1">{getConnectionText()}</span>
        </Badge>
        
        {messageCount > 0 && (
          <Badge variant="secondary">
            {messageCount} mensajes
          </Badge>
        )}
        
        {hasMessages && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportConversation}
              disabled={isLoading}
              className="h-8"
              title="Exportar conversación"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearChat}
              disabled={isLoading}
              className="h-8"
              title="Limpiar chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
