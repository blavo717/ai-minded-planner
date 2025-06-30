
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Database, 
  Trash2, 
  Download,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle
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
  hasMessages
}: ChatHeaderProps) => {
  const getConnectionDisplay = () => {
    if (isLoading) {
      return {
        icon: <Clock className="h-3 w-3 animate-pulse" />,
        text: 'Procesando...',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    }
    
    if (connectionStatus === 'error') {
      return {
        icon: <AlertCircle className="h-3 w-3" />,
        text: 'Error',
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    }
    
    if (connectionStatus === 'connected') {
      return {
        icon: <Wifi className="h-3 w-3" />,
        text: 'Conectado',
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    }
    
    return {
      icon: <WifiOff className="h-3 w-3" />,
      text: 'Desconectado',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    };
  };

  const connectionDisplay = getConnectionDisplay();

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 p-1">
      {/* Título y badges principales */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-500 flex-shrink-0" />
          <span className="hidden sm:inline">Asistente IA</span>
          <span className="sm:hidden">IA</span>
        </CardTitle>

        {/* Contexto disponible */}
        {contextAvailable && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
          >
            <Database className="h-3 w-3 flex-shrink-0" />
            <span className="hidden sm:inline">Contexto Activo</span>
            <span className="sm:hidden">Ctx</span>
          </Badge>
        )}
      </div>
      
      {/* Estado y acciones */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Estado de conexión simplificado */}
        <Badge 
          className={`${connectionDisplay.className} border flex items-center gap-1`}
        >
          {connectionDisplay.icon}
          <span className="hidden sm:inline font-medium">{connectionDisplay.text}</span>
        </Badge>
        
        {/* Contador de mensajes */}
        {messageCount > 0 && (
          <Badge variant="outline" className="hidden sm:flex items-center">
            {messageCount} mensajes
          </Badge>
        )}
        
        {/* Acciones */}
        {hasMessages && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportConversation}
              disabled={isLoading}
              className="h-8"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:ml-1 sm:inline">Exportar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearChat}
              disabled={isLoading}
              className="h-8"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:ml-1 sm:inline">Limpiar</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
