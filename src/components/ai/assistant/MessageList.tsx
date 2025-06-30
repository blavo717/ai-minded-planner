
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedMessage } from '@/hooks/ai/types/enhancedAITypes';
import MessageDisplay from './MessageDisplay';
import LoadingIndicator from './LoadingIndicator';
import EmptyState from './EmptyState';

interface MessageListProps {
  messages: EnhancedMessage[];
  isLoading: boolean;
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <MessageDisplay
                key={`${message.id}-${message.timestamp.getTime()}`}
                message={message}
              />
            ))
          )}
          
          {isLoading && <LoadingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
