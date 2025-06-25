
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { validateModelId } from '@/services/openRouterService';

interface ModelValidationAlertProps {
  modelId: string;
  className?: string;
}

const ModelValidationAlert = ({ modelId, className }: ModelValidationAlertProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!modelId) {
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    validateModelId(modelId)
      .then(setIsValid)
      .catch(() => setIsValid(null))
      .finally(() => setIsValidating(false));
  }, [modelId]);

  if (isValidating) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Validando modelo en OpenRouter...
        </AlertDescription>
      </Alert>
    );
  }

  if (isValid === false) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          El modelo "{modelId}" no está disponible en OpenRouter. 
          Por favor, selecciona un modelo válido de la lista.
        </AlertDescription>
      </Alert>
    );
  }

  if (isValid === true) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Modelo verificado y disponible en OpenRouter
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default ModelValidationAlert;
