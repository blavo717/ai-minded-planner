
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEnhancedAIAssistant } from '@/hooks/ai/useEnhancedAIAssistant';
import ConfigurationAlert from './assistant/ConfigurationAlert';
import ChatHeader from './assistant/ChatHeader';
import MessageList from './assistant/MessageList';
import ChatInput from './assistant/ChatInput';

const EnhancedAIAssistantPanel = () => {
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

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      await sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  if (!hasConfiguration) {
    return <ConfigurationAlert />;
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <ChatHeader
          connectionStatus={connectionStatus}
          contextAvailable={contextAvailable}
          messageCount={messageCount}
          onClearChat={clearChat}
          onExportConversation={exportConversation}
          isLoading={isLoading}
          hasMessages={messages.length > 0}
          activeModel={activeModel}
        />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          contextAvailable={contextAvailable}
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedAIAssistantPanel;
