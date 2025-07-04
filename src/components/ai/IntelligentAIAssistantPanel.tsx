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

// Memoized context display component
const ContextDisplay = memo(({ context }: { context: any }) => {
  if (!context) return null;

  return (
    <div className="space-y-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-800">Contexto Inteligente</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-medium text-gray-700">📊 Tareas</div>
          <div className="text-gray-600">
            Total: {context.user?.tasksCount || 0}
          </div>
          <div className="text-gray-600">
            Completadas hoy: {context.user?.completedTasksToday || 0}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="font-medium text-gray-700">🎯 Recomendación</div>
          {context.currentRecommendation ? (
            <>
              <div className="text-gray-600 truncate">
                {context.currentRecommendation.task.title}
              </div>
              <div className="text-green-600">
                Confianza: {Math.round(context.currentRecommendation.confidence)}%
              </div>
            </>
          ) : (
            <div className="text-gray-500">Sin recomendación</div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="font-medium text-gray-700">⚡ Rendimiento</div>
          <div className="text-gray-600">
            Métricas: {context.performanceMetrics?.totalMetrics || 0}
          </div>
          <div className="text-gray-600">
            Tiempo prom: {Math.round(context.performanceMetrics?.averageRecommendationTime || 0)}ms
          </div>
        </div>
      </div>
      
      {context.actionSuggestions && context.actionSuggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">Sugerencias</span>
          </div>
          <div className="space-y-1">
            {context.actionSuggestions.slice(0, 2).map((suggestion: string, index: number) => (
              <div key={index} className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                • {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ContextDisplay.displayName = 'ContextDisplay';

// Memoized message component
const MessageComponent = memo(({ message }: { message: any }) => (
  <div className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
    <div className={`flex-shrink-0 ${
      message.type === 'user' 
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
        : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700'
    } rounded-full p-2 shadow-sm`}>
      {message.type === 'user' ? (
        <User className="h-4 w-4" />
      ) : (
        <Brain className="h-4 w-4" />
      )}
    </div>
    
    <div className={`flex-1 max-w-[85%] ${message.type === 'user' ? 'text-right' : ''}`}>
      <div className={`inline-block p-4 rounded-lg shadow-sm ${
        message.type === 'user'
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
          : 'bg-white border border-gray-200'
      }`}>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
      
      {message.context && message.type === 'assistant' && (
        <div className="mt-3">
          <ContextDisplay context={message.context} />
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-2">
        <p className="text-xs text-muted-foreground">
          {format(message.timestamp, 'HH:mm', { locale: es })}
        </p>
        {message.type === 'assistant' && (
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            IA Inteligente
          </Badge>
        )}
      </div>
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
    <Card className="w-full min-h-[600px] max-h-[80vh] flex flex-col shadow-lg border-2 border-purple-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <div className="flex flex-col">
              <span>Asistente <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">IA Inteligente</span></span>
              <span className="text-xs text-muted-foreground font-normal">
                Contexto completo • Análisis de patrones • Recomendaciones personalizadas
              </span>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getConnectionColor()} border text-xs`}>
              {getConnectionIcon()}
              <span className="ml-1 capitalize">{connectionStatus}</span>
            </Badge>
            
            {userContext && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                <BarChart3 className="w-3 h-3 mr-1" />
                T:{userContext.tasksCount} P:{userContext.projectsCount}
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 border-gray-300"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            {messages.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportConversation}
                  className="h-8 border-blue-300 text-blue-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={isLoading}
                  className="h-8 border-red-300 text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Brain className="h-10 w-10 text-purple-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ¡Hola! Soy tu asistente IA inteligente
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Tengo acceso completo a tus tareas, proyectos y patrones de trabajo. 
                    Puedo ayudarte con análisis, recomendaciones y planificación.
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                    <Target className="h-3 w-3 mr-1" />
                    Recomendaciones inteligentes
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Análisis de patrones
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Contexto completo
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Ejemplos de preguntas:</p>
                  <div className="mt-2 space-y-1">
                    <p>• "¿Qué debería hacer ahora?"</p>
                    <p>• "Analiza mis patrones de productividad"</p>
                    <p>• "¿Cómo van mis proyectos?"</p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageComponent key={message.id} message={message} />
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full p-2">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-purple-700">Analizando contexto y generando respuesta...</span>
                  </div>
                  <Progress value={45} className="mt-2 h-1" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />
        
        <div className="p-4 bg-gradient-to-r from-purple-25 to-blue-25">
          <div className="flex gap-2">
            <Input
              placeholder="Pregúntame sobre tus tareas, productividad o patrones de trabajo..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 border-purple-200 focus:border-purple-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {activeModel && (
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Modelo: {activeModel}</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Sistema inteligente activo
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

IntelligentAIAssistantPanel.displayName = 'IntelligentAIAssistantPanel';

export default IntelligentAIAssistantPanel;