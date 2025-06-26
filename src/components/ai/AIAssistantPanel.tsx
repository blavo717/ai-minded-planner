import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Loader2,
  Clock
} from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useSmartMessaging } from '@/hooks/useSmartMessaging';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import ChatMessage from './ChatMessage';
import NotificationBadge from './NotificationBadge';

const AIAssistantPanel = () => {
  const {
    isOpen,
    setIsOpen,
    messages,
    isTyping,
    isLoading,
    connectionStatus,
    isInitialized,
    sendMessage,
    markAsRead,
    markAllAsRead,
    clearChat,
    getBadgeInfo,
    currentStrategy,
    badgeUpdateTrigger
  } = useAIAssistant();

  const { triggerTaskAnalysis } = useSmartMessaging();
  const { activeConfiguration } = useLLMConfigurations();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // FIX: FORZAR RE-RENDER DEL BADGE CON ESTADO LOCAL MEJORADO
  const [badgeRenderKey, setBadgeRenderKey] = useState(0);
  const [lastBadgeInfo, setLastBadgeInfo] = useState({ count: 0, hasUrgent: false, hasHigh: false });

  // DEBUGGING MASIVO del componente
  console.log('🎯 AIAssistantPanel render:', {
    isOpen,
    messagesCount: messages.length,
    isInitialized,
    connectionStatus,
    isMinimized,
    badgeRenderKey,
    strategy: currentStrategy,
    badgeUpdateTrigger
  });

  // FIX: ACTUALIZAR BADGE CUANDO CAMBIEN LOS MENSAJES O EL TRIGGER
  useEffect(() => {
    console.log('📊 Messages or badge trigger changed, updating badge render key');
    
    const currentBadgeInfo = getBadgeInfo();
    const hasChanged = 
      lastBadgeInfo.count !== currentBadgeInfo.count ||
      lastBadgeInfo.hasUrgent !== currentBadgeInfo.hasUrgent ||
      lastBadgeInfo.hasHigh !== currentBadgeInfo.hasHigh;
    
    if (hasChanged) {
      console.log('🏷️ Badge info changed:', {
        old: lastBadgeInfo,
        new: currentBadgeInfo
      });
      
      setLastBadgeInfo(currentBadgeInfo);
      setBadgeRenderKey(prev => prev + 1);
      
      // FORZAR ACTUALIZACIÓN ADICIONAL
      setTimeout(() => {
        setBadgeRenderKey(prev => prev + 1);
      }, 100);
    }
  }, [messages.length, badgeUpdateTrigger, getBadgeInfo]);

  const badgeInfo = getBadgeInfo();
  console.log('🏷️ Current badge info from AIAssistantPanel:', {
    ...badgeInfo,
    strategy: currentStrategy,
    renderKey: badgeRenderKey
  });

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      console.log('📜 Auto-scrolling to end of messages');
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus en input cuando se abre el chat
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      console.log('🎯 Focusing input field');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) {
      console.log('⚠️ Cannot send message:', { 
        isEmpty: !inputMessage.trim(), 
        isLoading 
      });
      return;
    }
    
    const message = inputMessage.trim();
    console.log(`🚀 Sending message from panel: "${message.substring(0, 50)}..." via ${currentStrategy}`);
    setInputMessage('');
    
    // Añadir contexto de página actual
    const contextData = {
      currentPage: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      hasActiveConfig: !!activeConfiguration,
      strategy: currentStrategy
    };
    
    await sendMessage(message, contextData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenChat = () => {
    console.log(`🎯 Opening chat panel (strategy: ${currentStrategy})`);
    setIsOpen(true);
    setIsMinimized(false);
    
    // Marcar todos los mensajes como leídos cuando se abre el chat
    if (badgeInfo.count > 0) {
      console.log(`👁️ Marking ${badgeInfo.count} messages as read on chat open`);
      setTimeout(() => markAllAsRead(), 500);
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

  const getConnectionStatus = () => {
    if (!isInitialized) return 'Inicializando...';
    
    switch (connectionStatus) {
      case 'connecting':
        return 'Conectando...';
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Error de conexión';
      default:
        return 'Asistente IA';
    }
  };

  // FIX: BOTÓN FLOTANTE CON BADGE MEJORADO Y FORZADO
  if (!isOpen) {
    console.log('🎯 Rendering floating button with badge:', {
      ...badgeInfo,
      renderKey: badgeRenderKey,
      strategy: currentStrategy
    });
    
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleOpenChat}
          className="relative h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in"
          size="sm"
          data-testid="ai-assistant-button"
          data-strategy={currentStrategy}
          data-badge-count={badgeInfo.count}
          data-badge-urgent={badgeInfo.hasUrgent}
          data-badge-high={badgeInfo.hasHigh}
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <NotificationBadge 
            key={`badge-${badgeRenderKey}-${badgeInfo.count}-${badgeInfo.hasUrgent}-${badgeInfo.hasHigh}-${currentStrategy}-${Date.now()}`}
            count={badgeInfo.count}
            hasUrgent={badgeInfo.hasUrgent}
            hasHigh={badgeInfo.hasHigh}
          />
        </Button>
      </div>
    );
  }

  console.log('🎯 Rendering full chat panel');

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in" data-testid="ai-assistant-panel">
      <Card className="w-96 h-[500px] shadow-2xl border-2 border-gray-200 bg-white">
        {/* Header con información de debugging */}
        <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <div className="flex flex-col">
                <span className="font-semibold">Asistente IA</span>
                <span className="text-xs text-blue-100">
                  {currentStrategy === 'localStorage' ? '🧪 Modo Test' : '🔄 Producción'} | {messages.length} msgs
                </span>
                {!activeConfiguration && (
                  <span className="text-xs text-blue-100">⚙️ Config LLM requerida</span>
                )}
                {!isInitialized && (
                  <span className="text-xs text-blue-100 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Cargando mensajes...
                  </span>
                )}
              </div>
              {badgeInfo.count > 0 && (
                <Badge className="bg-white text-blue-600 text-xs" data-testid="header-badge">
                  {badgeInfo.count} nuevos
                </Badge>
              )}
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

        {/* Content */}
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[440px]">
            {/* Configuration Alert */}
            {!activeConfiguration && (
              <Alert className="m-4 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Configuración requerida:</strong> Ve a Configuración → LLM para configurar tu API key de OpenRouter.
                  {currentStrategy === 'localStorage' && (
                    <div className="mt-1 text-xs text-blue-600">
                      🧪 Modo Test: Los mensajes se guardan en localStorage
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {!isInitialized ? (
                <div className="text-center py-8 text-gray-500">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 text-gray-300 animate-spin" />
                  <p className="text-sm">Cargando mensajes...</p>
                  <p className="text-xs mt-1 text-blue-600">Estrategia: {currentStrategy}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">¡Hola! Soy tu asistente de productividad.</p>
                  <p className="text-xs mt-2">Pregúntame sobre tus tareas, necesidades de planificación o cualquier cosa relacionada con tu productividad.</p>
                  
                  {currentStrategy === 'localStorage' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      🧪 Modo Test: Los mensajes se guardan localmente
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerTaskAnalysis}
                      className="text-xs"
                      disabled={!activeConfiguration && currentStrategy !== 'localStorage'}
                      data-testid="analyze-tasks-button"
                    >
                      Analizar mis tareas
                    </Button>
                    
                    {!activeConfiguration && currentStrategy !== 'localStorage' && (
                      <p className="text-xs text-red-600">
                        Configura LLM primero para usar funciones IA
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onMarkAsRead={markAsRead}
                    />
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

            {/* Input Area con información de debugging */}
            <div className="border-t p-4 bg-gray-50">
              {messages.length > 0 && (
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-6"
                      disabled={badgeInfo.count === 0}
                      data-testid="mark-all-read-button"
                    >
                      Marcar todo como leído
                    </Button>
                    {currentStrategy === 'localStorage' && (
                      <span className="text-xs text-blue-600">🧪 Test</span>
                    )}
                  </div>
                  
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    currentStrategy === 'localStorage' 
                      ? "Escribe tu mensaje (modo test)..." 
                      : activeConfiguration 
                        ? "Escribe tu mensaje..." 
                        : "Configura LLM primero..."
                  }
                  disabled={isLoading || (!activeConfiguration && currentStrategy !== 'localStorage') || !isInitialized}
                  className="flex-1"
                  data-testid="message-input"
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || (!activeConfiguration && currentStrategy !== 'localStorage') || !isInitialized}
                  size="sm"
                  className="px-3"
                  data-testid="send-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {connectionStatus === 'error' && (
                <p className="text-xs text-red-600 mt-2" data-testid="connection-error">
                  ❌ Error de conexión. Verifica tu configuración LLM.
                </p>
              )}
              
              {currentStrategy === 'localStorage' && (
                <p className="text-xs text-blue-600 mt-1" data-testid="test-mode-indicator">
                  🧪 Modo Test: Mensajes guardados localmente | Badge: {badgeInfo.count} | Render: {badgeRenderKey}
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIAssistantPanel;
