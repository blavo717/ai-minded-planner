
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  Trash2,
  Bot,
  Wifi,
  WifiOff,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAIAssistantSimple } from '@/hooks/useAIAssistantSimple';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';

const AIAssistantPanelSimple = () => {
  const {
    isOpen,
    setIsOpen,
    messages,
    isTyping,
    isLoading,
    connectionStatus,
    sendMessage,
    clearChat
  } = useAIAssistantSimple();

  const { activeConfiguration } = useLLMConfigurations();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />;
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="relative h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          size="sm"
          data-testid="ai-assistant-button-simple"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="ai-assistant-panel-simple">
      <Card className="w-96 h-[500px] shadow-2xl border-2 border-gray-200 bg-white">
        <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <div className="flex flex-col">
                <span className="font-semibold">Asistente IA Simple</span>
                <span className="text-xs text-blue-100">
                  Chat básico | {messages.length} mensajes
                </span>
                {!activeConfiguration && (
                  <span className="text-xs text-blue-100">⚙️ Config LLM requerida</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[440px]">
            {!activeConfiguration && (
              <Alert className="m-4 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Configuración requerida:</strong> Ve a Configuración → LLM para configurar tu API key de OpenRouter.
                </AlertDescription>
              </Alert>
            )}
            
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">¡Hola! Soy tu asistente de productividad.</p>
                  <p className="text-xs mt-2">Pregúntame sobre tus tareas, planificación o cualquier cosa que necesites.</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`inline-block max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center gap-2 text-gray-500 mb-4" data-testid="typing-indicator">
                      <Bot className="h-4 w-4" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </ScrollArea>

            <div className="border-t p-4 bg-gray-50">
              {messages.length > 0 && (
                <div className="flex justify-end mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-xs h-6 text-red-600 hover:text-red-700"
                    data-testid="clear-chat-button"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Limpiar chat
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={activeConfiguration ? "Escribe tu mensaje..." : "Configura LLM primero..."}
                  disabled={isLoading || !activeConfiguration}
                  className="flex-1"
                  data-testid="message-input-simple"
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || !activeConfiguration}
                  size="sm"
                  className="px-3"
                  data-testid="send-button-simple"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {connectionStatus === 'error' && (
                <p className="text-xs text-red-600 mt-2" data-testid="connection-error">
                  ❌ Error de conexión. Verifica tu configuración LLM.
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIAssistantPanelSimple;
