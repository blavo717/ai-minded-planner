
export interface EnhancedMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model_used?: string;
    tokens_used?: number;
    response_time?: number;
    context_data?: any;
    contextUsed?: boolean;
    prefetchUsed?: boolean;
    userId?: string;
  };
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
