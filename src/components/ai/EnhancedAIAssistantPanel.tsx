
import React, { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEnhancedAIAssistant } from '@/hooks/ai/useEnhancedAIAssistant';
import ConfigurationAlert from './assistant/ConfigurationAlert';
import ChatHeader from './assistant/ChatHeader';
import MessageList from './assistant/MessageList';
import ChatInput from './assistant/ChatInput';
import DataIndicator from './assistant/DataIndicator';

// Memoizar el panel completo para evitar renders innecesarios
const EnhancedAIAssistantPanel = memo(() => {
  const [inputMessage, setInputMessage] = useState('');
  
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
    activeModel,
  } = useEnhancedAIAssistant();

  // Memoizar el handler para evitar recreación en cada render
  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() && !isLoading) {
      console.log('📤 Enviando mensaje desde panel:', inputMessage.substring(0, 30) + '...');
      await sendMessage(inputMessage);
      setInputMessage('');
    }
  }, [inputMessage, isLoading, sendMessage]);

  // Memoizar el handler de limpieza
  const handleClearChat = useCallback(() => {
    console.log('🧹 Limpiando chat desde panel');
    clearChat();
    setInputMessage(''); // Limpiar también el input
  }, [clearChat]);

  // Memoizar el handler de exportación
  const handleExportConversation = useCallback(() => {
    console.log('💾 Exportando conversación desde panel');
    exportConversation();
  }, [exportConversation]);

  // Memoizar el handler de cambio de input
  const handleInputChange = useCallback((value: string) => {
    setInputMessage(value);
  }, []);

  // Early return para configuración faltante
  if (!hasConfiguration) {
    return <ConfigurationAlert />;
  }

  const hasMessages = messages.length > 0;

  return (
    <Card className="w-full h-[calc(100vh-200px)] min-h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 flex-shrink-0">
        <ChatHeader
          connectionStatus={connectionStatus}
          contextAvailable={contextAvailable}
          messageCount={messageCount}
          onClearChat={handleClearChat}
          onExportConversation={handleExportConversation}
          isLoading={isLoading}
          hasMessages={hasMessages}
          activeModel={activeModel}
        />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 min-h-0">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>
        <div className="flex-shrink-0">
          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={handleInputChange}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            contextAvailable={contextAvailable}
          />
          <DataIndicator contextAvailable={contextAvailable} />
        </div>
      </CardContent>
    </Card>
  );
});

// Agregar displayName para mejor debugging
EnhancedAIAssistantPanel.displayName = 'EnhancedAIAssistantPanel';

export default EnhancedAIAssistantPanel;
