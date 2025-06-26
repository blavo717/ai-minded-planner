
import { useState, useCallback } from 'react';

export const useTestingMode = () => {
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [testPhase, setTestPhase] = useState<string>('');

  const enableTestingMode = useCallback((phase: string = 'FASE-14') => {
    console.log(`🧪 FASE 14: Activando modo testing - ${phase}`);
    setIsTestingMode(true);
    setTestPhase(phase);
  }, []);

  const disableTestingMode = useCallback(() => {
    console.log('🧪 FASE 14: Desactivando modo testing');
    setIsTestingMode(false);
    setTestPhase('');
  }, []);

  return {
    isTestingMode,
    testPhase,
    enableTestingMode,
    disableTestingMode
  };
};
