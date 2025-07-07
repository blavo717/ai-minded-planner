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
  Sparkles
} from 'lucide-react';
import { useIntelligentAIAssistant } from '@/hooks/ai/useIntelligentAIAssistant';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Memoized context display component - SIMPLIFIED
const ContextDisplay = memo(({ context }: { context: any }) => {
  // Context info hidden in basic mode - only show in debug mode
  if (!context || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
      Debug: Context loaded
    </div>
  );
});

ContextDisplay.displayName = 'ContextDisplay';

// Memoized message component - OPTIMIZED SPACING
const MessageComponent = memo(({ message }: { message: any }) => (
  <div className={`flex gap-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
    <div className={`flex-shrink-0 ${
      message.type === 'user' 
        ? 'bg-purple-600 text-white' 
        : 'bg-purple-100 text-purple-700'
    } rounded-full p-1.5`}>
      {message.type === 'user' ? (
        <User className="h-3 w-3" />
      ) : (
        <Brain className="h-3 w-3" />
      )}
    </div>
    
    <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
      <div className={`inline-block p-3 rounded-lg ${
        message.type === 'user'
          ? 'bg-purple-600 text-white'
          : 'bg-gray-50 border'
      }`}>
        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
      </div>
      
      {message.context && message.type === 'assistant' && (
        <div className="mt-3">
          <ContextDisplay context={message.context} />
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">
        {format(message.timestamp, 'HH:mm', { locale: es })}
      </p>
    </div>
  </div>
));

MessageComponent.displayName = 'MessageComponent';

const IntelligentAIAssistantPanel = memo(() => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
  } = useIntelligentAIAssistant();

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
    <Card className="w-full h-[650px] flex flex-col shadow-lg">
      <CardHeader className="pb-2 px-3 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Chat IA</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getConnectionColor()} border text-xs`}>
              {getConnectionIcon()}
              <span className="ml-1 hidden sm:inline capitalize">{connectionStatus}</span>
            </Badge>
            
            {messages.length > 0 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportConversation}
                  className="h-7 px-2"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:ml-1 sm:inline text-xs">Exportar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={isLoading}
                  className="h-7 px-2"
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
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-4 py-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-purple-600">
                    ¿En qué puedo ayudarte?
                  </h3>
                  <p className="text-muted-foreground text-sm px-4">
                    Pregúntame sobre tus tareas y proyectos.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageComponent key={message.id} message={message} />
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-2">
                <div className="bg-purple-100 text-purple-700 rounded-full p-1.5">
                  <Brain className="h-3 w-3" />
                </div>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-purple-700">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />
        
        <div className="p-2">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu pregunta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

IntelligentAIAssistantPanel.displayName = 'IntelligentAIAssistantPanel';

export default IntelligentAIAssistantPanel;