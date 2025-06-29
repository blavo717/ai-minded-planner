
import { useState, useEffect } from 'react';
import { ConnectionStatus } from './types/enhancedAITypes';

interface UseConnectionManagerProps {
  hasActiveConfiguration: boolean;
  isLoading: boolean;
}

export const useConnectionManager = ({ hasActiveConfiguration, isLoading }: UseConnectionManagerProps) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Set initial connection status
  useEffect(() => {
    if (hasActiveConfiguration) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [hasActiveConfiguration]);

  const setConnecting = () => setConnectionStatus('connecting');
  const setConnected = () => setConnectionStatus('connected');
  const setError = () => setConnectionStatus('error');
  const setDisconnected = () => setConnectionStatus('disconnected');

  return {
    connectionStatus,
    setConnecting,
    setConnected,
    setError,
    setDisconnected,
  };
};
