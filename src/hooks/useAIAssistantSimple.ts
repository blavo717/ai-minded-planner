
import { useState, useCallback } from 'react';
import { useLLMService } from '@/hooks/useLLMService';
import { useToast } from '@/hooks/use-toast';

interface SimpleMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useAIAssistantSimple = () => {
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  
  const { makeLLMRequest, hasActiveConfiguration } = useLLMService();
  const { toast } = useToast();

  // Función para enviar mensaje
  const sendMessage = useCallback(async (content: string) => {
    if (!hasActiveConfiguration) {
      toast({
        title: 'Configuración requerida',
        description: 'Ve a Configuración > LLM para configurar tu API key.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) return;

    console.log('🤖 Enviando mensaje simple:', { content: content.substring(0, 50) + '...' });
    
    setConnectionStatus('connecting');
    setIsLoading(true);

    // Agregar mensaje del usuario
    const userMessage: SimpleMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Crear contexto simple
      const systemPrompt = `Eres un asistente de IA simple y útil. 
Responde de manera clara, concisa y amigable. 
Mantén tus respuestas enfocadas y prácticas.
Fecha actual: ${new Date().toLocaleDateString('es-ES')}`;

      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt: content,
        functionName: 'simple_assistant_chat',
        temperature: 0.7,
        maxTokens: 1000,
      });

      // Agregar respuesta del asistente
      const assistantMessage: SimpleMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConnectionStatus('connected');

      console.log('✅ Respuesta simple recibida:', { 
        responseLength: response.content.length,
        model: response.model_used,
      });

    } catch (error) {
      console.error('❌ Error en asistente simple:', error);
      
      setConnectionStatus('error');
      
      toast({
        title: 'Error en el asistente',
        description: 'No se pudo procesar tu mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });

      // Agregar mensaje de error
      const errorMessage: SimpleMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [makeLLMRequest, hasActiveConfiguration, toast]);

  // Función para limpiar chat
  const clearChat = useCallback(() => {
    console.log('🧹 Limpiando chat simple');
    setMessages([]);
    setConnectionStatus('disconnected');
  }, []);

  return {
    messages,
    isLoading,
    connectionStatus,
    sendMessage,
    clearChat,
    hasConfiguration: hasActiveConfiguration,
  };
};
