
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Trash2, 
  Bot, 
  User, 
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Download,
  Database,
  Brain,
  Zap
} from 'lucide-react';
import { useEnhancedAIAssistant } from '@/hooks/useEnhancedAIAssistant';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EnhancedAIAssistantPanel = () => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    connectionStatus,
    sendMessage,
    clearChat,
    exportConversation,
    hasConfiguration,
    contextAvailable,
    messageCount,
  } = useEnhancedAIAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      await sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasConfiguration) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Asistente IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Para usar el asistente IA necesitas configurar tu API key.</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Ir a Configuración
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
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
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getConnectionColor()}>
              {getConnectionIcon()}
              <span className="ml-1 capitalize">{connectionStatus}</span>
            </Badge>
            {messageCount > 0 && (
              <Badge variant="secondary">
                {messageCount} mensajes
              </Badge>
            )}
            {messages.length > 0 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportConversation}
                  disabled={isLoading}
                  className="h-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={isLoading}
                  className="h-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-purple-300" />
                <p className="text-lg font-medium mb-2">¡Hola! Soy tu asistente IA</p>
                <p className="text-sm mb-2">Tengo acceso completo a tus datos y contexto personal.</p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    Memoria persistente
                  </Badge>
                  <Badge variant="outline">
                    <Database className="h-3 w-3 mr-1" />
                    Contexto inteligente
                  </Badge>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={`${message.id}-${message.timestamp.getTime()}`}
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
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="bg-purple-100 text-purple-600 rounded-full p-2">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-purple-600">Generando respuesta...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Pregúntame cualquier cosa sobre tu trabajo..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {contextAvailable && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tengo acceso a tus tareas, proyectos y contexto personal para respuestas más precisas
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAIAssistantPanel;
