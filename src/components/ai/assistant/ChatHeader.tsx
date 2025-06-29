
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
  Cpu,
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
  hasMessages,
  activeModel
}: ChatHeaderProps) => {
  const formatModelName = (model?: string) => {
    if (!model) return 'No configurado';
    
    // Extraer solo el nombre del modelo sin el proveedor
    const parts = model.split('/');
    const modelName = parts[parts.length - 1] || model;
    
    // Formatear nombres comunes de modelos
    if (modelName.includes('gpt-4o')) return 'GPT-4o';
    if (modelName.includes('gpt-4')) return 'GPT-4';
    if (modelName.includes('gpt-3.5')) return 'GPT-3.5';
    if (modelName.includes('claude-3-5-sonnet')) return 'Claude 3.5';
    if (modelName.includes('claude-3-haiku')) return 'Claude 3 Haiku';
    if (modelName.includes('claude')) return 'Claude';
    if (modelName.includes('llama')) return 'Llama';
    if (modelName.includes('gemini')) return 'Gemini';
    
    // Formatear nombre genérico
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  };

  const getConnectionDisplay = () => {
    // Determinar el estado real basado en configuración y carga
    let realStatus: ConnectionStatus;
    
    if (!activeModel) {
      realStatus = 'disconnected';
    } else if (isLoading) {
      realStatus = 'connecting';
    } else if (connectionStatus === 'error') {
      realStatus = 'error';
    } else {
      realStatus = 'connected';
    }

    switch (realStatus) {
      case 'connected':
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: 'Conectado',
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        };
      case 'connecting':
        return {
          icon: <Clock className="h-3 w-3 animate-pulse" />,
          text: 'Procesando...',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Error',
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        };
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: 'Sin configurar',
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        };
    }
  };

  const connectionDisplay = getConnectionDisplay();
  const formattedModelName = formatModelName(activeModel);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 p-1">
      {/* Título y badges principales */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-500 flex-shrink-0" />
          <span className="hidden sm:inline">Asistente IA</span>
          <span className="sm:hidden">IA</span>
        </CardTitle>
        
        {/* Modelo activo - Badge principal */}
        <Badge 
          variant="secondary" 
          className={`flex items-center gap-1 ${
            activeModel 
              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
              : 'bg-gray-50 text-gray-600 border-gray-200'
          } transition-colors`}
        >
          <Cpu className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline font-medium">{formattedModelName}</span>
          <span className="sm:hidden font-medium">{formattedModelName.split(' ')[0]}</span>
        </Badge>

        {/* Contexto disponible */}
        {contextAvailable && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
          >
            <Database className="h-3 w-3 flex-shrink-0" />
            <span className="hidden sm:inline">Contexto Activo</span>
            <span className="sm:hidden">Ctx</span>
          </Badge>
        )}
      </div>
      
      {/* Estado y acciones */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Estado de conexión - Sincronizado con estado real */}
        <Badge 
          className={`${connectionDisplay.className} border flex items-center gap-1 transition-colors cursor-default`}
          title={`Estado: ${connectionDisplay.text}${activeModel ? ` - Modelo: ${formattedModelName}` : ''}`}
        >
          {connectionDisplay.icon}
          <span className="hidden sm:inline font-medium">{connectionDisplay.text}</span>
        </Badge>
        
        {/* Contador de mensajes */}
        {messageCount > 0 && (
          <Badge 
            variant="outline" 
            className="hidden sm:flex items-center hover:bg-muted/50 transition-colors"
            title={`${messageCount} mensajes en la conversación`}
          >
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
              className="h-8 hover:bg-muted/50 transition-colors"
              title="Exportar conversación completa"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:ml-1 sm:inline">Exportar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearChat}
              disabled={isLoading}
              className="h-8 hover:bg-muted/50 transition-colors"
              title="Limpiar chat (mantiene historial)"
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
