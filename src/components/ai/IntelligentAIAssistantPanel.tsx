import React, { useState, useRef, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Trash2, 
  Bot, 
  User, 
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Brain,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  Download,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Keyboard,
  Bell,
  CalendarClock
} from 'lucide-react';
import { useIntelligentAIAssistant } from '@/hooks/ai/useIntelligentAIAssistant';
import ProactiveAlert from '@/components/ai/assistant/ProactiveAlert';
import { useReminderBadge } from '@/hooks/useReminderBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ✅ CHECKPOINT 1.2.1: Eliminación completa de información de debug
// Ya no mostramos contexto al usuario - solo funcionalidad interna

// Memoized message component - OPTIMIZED WITH DESIGN SYSTEM + PROACTIVE ALERTS
const MessageComponent = memo(({ 
  message, 
  onProactiveAction, 
  onProactiveDismiss 
}: { 
  message: any;
  onProactiveAction?: (alert: any) => void;
  onProactiveDismiss?: (alertId: string) => void;
}) => {
  // ✅ SPRINT 2: Renderizar alertas proactivas
  if (message.type === 'proactive_alert' && message.proactiveAlert) {
    return (
      <ProactiveAlert
        alert={message.proactiveAlert}
        onActionClick={onProactiveAction!}
        onDismiss={onProactiveDismiss!}
      />
    );
  }

  // Renderizado normal de mensajes
  return (
    <div className={`flex gap-2 transition-ai animate-fade-in ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 transition-ai ${
        message.type === 'user' 
          ? 'bg-ai-primary text-white shadow-ai-sm' 
          : 'bg-ai-primary-light text-ai-primary shadow-ai-sm'
      } rounded-full p-1 hover:scale-105`}>
        {message.type === 'user' ? (
          <User className="h-3 w-3" />
        ) : (
          <Brain className="h-3 w-3" />
        )}
      </div>
      
      <div className={`flex-1 max-w-[85%] ${message.type === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block px-2 py-1.5 rounded-lg transition-ai shadow-ai-sm hover:shadow-ai-md ${
          message.type === 'user'
            ? 'bg-ai-primary text-white'
            : 'bg-ai-surface border border-ai-border hover:bg-ai-surface-hover'
        }`}>
          <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
        </div>
        
        {/* ✅ CHECKPOINT 1.2.1: Sin información de debug visible al usuario */}
        
        <p className="text-xs text-ai-text-muted mt-0.5 transition-ai">
          {format(message.timestamp, 'HH:mm', { locale: es })}
        </p>
      </div>
    </div>
  );
});

MessageComponent.displayName = 'MessageComponent';

const IntelligentAIAssistantPanel = memo(() => {
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Hook para manejar recordatorios pendientes
  const { 
    reminderCount, 
    hasReminders, 
    lastReminder,
    markRemindersAsRead 
  } = useReminderBadge();

  // ✅ CHECKPOINT 3.3: Sugerencias de preguntas comunes
  const suggestions = [
    "¿Qué tareas tengo urgentes hoy?",
    "¿En qué proyecto debería trabajar ahora?",
    "¿Cuántas tareas completé esta semana?",
    "¿Qué tareas están vencidas?",
    "Ayúdame a priorizar mis tareas",
    "¿Cómo va mi productividad?",
    "¿Qué microtareas puedo hacer rápido?",
    "Recuérdame trabajar en 15 minutos"
  ];
  
  const {
    messages,
    isLoading,
    connectionStatus,
    sendMessage,
    clearChat,
    exportConversation,
    hasConfiguration,
    userContext,
    activeModel,
    handleProactiveAction,
    handleProactiveDismiss,
  } = useIntelligentAIAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ CHECKPOINT 3.3: Shortcuts de teclado
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Ctrl+L: Limpiar chat
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearChat();
      }
      // Ctrl+Enter: Enviar mensaje (alternativo)
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
      }
      // Escape: Cerrar sugerencias
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [clearChat]);

  // Mostrar sugerencias cuando el input está vacío y enfocado
  const handleInputFocus = () => {
    if (!inputMessage.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => setShowSuggestions(false), 200);
  };

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

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
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
        return 'bg-green-100 text-green-800 border-green-300';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!hasConfiguration) {
    return (
      <Card className="w-full border-2 border-dashed border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Asistente IA Inteligente
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
              <Sparkles className="w-3 h-3 mr-1" />
              Avanzado
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-purple-200 bg-purple-50">
            <Settings className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="text-purple-800">
                  Para usar el asistente inteligente necesitas configurar tu API key de LLM.
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="border-purple-300 text-purple-700">
                    <a href="/llm-settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar LLM
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="border-blue-300 text-blue-700">
                    <a href="/ai-assistant-simple">
                      <Bot className="h-4 w-4 mr-2" />
                      Usar Versión Simple
                    </a>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[700px] flex flex-col shadow-ai-lg transition-ai border-ai-border">
      <CardHeader className="pb-1 px-2 py-1.5 bg-gradient-ai-surface border-b border-ai-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-ai-primary">
            <Brain className="h-4 w-4 text-ai-primary" />
            <span>Chat IA</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getConnectionColor()} border text-xs transition-ai`}>
              {getConnectionIcon()}
              <span className="ml-1 hidden sm:inline capitalize">{connectionStatus}</span>
            </Badge>
            
            {messages.length > 0 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportConversation}
                  className="h-6 px-1.5 transition-ai hover:bg-ai-surface-hover border-ai-border"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:ml-1 sm:inline text-xs">Exportar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={isLoading}
                  className="h-6 px-1.5 transition-ai hover:bg-ai-surface-hover border-ai-border"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="hidden sm:ml-1 sm:inline text-xs">Limpiar</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-3 py-2">
            {/* Mostrar recordatorios pendientes si los hay */}
            {hasReminders && (
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 animate-fade-in">
                <Bell className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-orange-800 dark:text-orange-200 font-medium">
                      ⏰ Tienes {reminderCount} recordatorio{reminderCount > 1 ? 's' : ''} pendiente{reminderCount > 1 ? 's' : ''}
                    </p>
                    {lastReminder && (
                      <div className="bg-white dark:bg-gray-800 rounded p-2 border">
                        <p className="text-sm font-medium">{lastReminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Programado para las {format(new Date(lastReminder.scheduled_for), 'HH:mm', { locale: es })}
                        </p>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      onClick={markRemindersAsRead}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar como visto
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {messages.length === 0 ? (
              <div className="text-center py-6 space-y-2 animate-fade-in">
                <div className="w-10 h-10 mx-auto bg-ai-primary-light rounded-full flex items-center justify-center transition-ai hover:scale-105 shadow-ai-sm">
                  <Brain className="h-5 w-5 text-ai-primary" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-ai-primary">
                    ¿En qué puedo ayudarte?
                  </h3>
                  <p className="text-ai-text-muted text-xs px-3">
                    Pregúntame sobre tus tareas y proyectos.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageComponent 
                  key={message.id} 
                  message={message}
                  onProactiveAction={handleProactiveAction}
                  onProactiveDismiss={handleProactiveDismiss}
                />
              ))
            )}
            
            {/* ✅ CHECKPOINT 3.3: Mejor estado visual de "escribiendo..." */}
            {isLoading && (
              <div className="flex gap-2 animate-fade-in">
                <div className="bg-ai-primary-light text-ai-primary rounded-full p-1 shadow-ai-sm">
                  <Brain className="h-3 w-3" />
                </div>
                <div className="bg-ai-surface border border-ai-border rounded-lg px-2 py-1.5 shadow-ai-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-ai-primary rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-ai-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-ai-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-ai-primary font-medium">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />
        
        <div className="relative p-1.5 bg-gradient-ai-surface border-t border-ai-border">
          {/* ✅ CHECKPOINT 3.3: Sugerencias inteligentes */}
          {showSuggestions && (
            <div className="absolute bottom-full left-1.5 right-1.5 mb-1 bg-ai-surface border border-ai-border rounded-lg shadow-ai-lg z-50 max-h-48 overflow-y-auto animate-fade-in">
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-3 w-3 text-ai-primary" />
                  <span className="text-xs font-medium text-ai-primary">Preguntas frecuentes</span>
                  <kbd className="text-xs text-ai-text-muted bg-ai-surface border border-ai-border rounded px-1">ESC</kbd>
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left text-xs p-2 rounded hover:bg-ai-surface-hover text-ai-text transition-ai"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-1.5">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Escribe tu pregunta... (Ctrl+L = limpiar, Ctrl+Enter = enviar)"
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  if (e.target.value.trim()) {
                    setShowSuggestions(false);
                  }
                }}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                disabled={isLoading}
                className="border-ai-border focus:border-ai-primary transition-ai pr-8"
              />
              {!inputMessage.trim() && !showSuggestions && (
                <button
                  onClick={() => setShowSuggestions(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ai-text-muted hover:text-ai-primary transition-ai"
                >
                  <Lightbulb className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-ai-primary hover:bg-ai-primary/90 transition-ai shadow-ai-sm hover:shadow-ai-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* ✅ CHECKPOINT 3.3: Indicador de shortcuts */}
          <div className="flex items-center gap-2 mt-1 text-xs text-ai-text-muted">
            <Keyboard className="h-3 w-3" />
            <span>Shortcuts:</span>
            <kbd className="bg-ai-surface border border-ai-border rounded px-1">Ctrl+L</kbd>
            <span>limpiar</span>
            <kbd className="bg-ai-surface border border-ai-border rounded px-1">Ctrl+↵</kbd>
            <span>enviar</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

IntelligentAIAssistantPanel.displayName = 'IntelligentAIAssistantPanel';

export default IntelligentAIAssistantPanel;