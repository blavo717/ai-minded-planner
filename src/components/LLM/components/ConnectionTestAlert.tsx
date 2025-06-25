
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, AlertCircle } from 'lucide-react';

interface ConnectionTestAlertProps {
  testStatus: 'idle' | 'testing' | 'success' | 'error';
  testMessage: string;
}

const ConnectionTestAlert = ({ testStatus, testMessage }: ConnectionTestAlertProps) => {
  if (testStatus === 'idle') return null;

  return (
    <Alert className={
      testStatus === 'success' 
        ? 'border-green-200 bg-green-50' 
        : testStatus === 'error' 
        ? 'border-red-200 bg-red-50' 
        : ''
    }>
      <div className="flex items-center gap-2">
        {testStatus === 'testing' && <Zap className="h-4 w-4 animate-spin" />}
        {testStatus === 'success' && <Zap className="h-4 w-4 text-green-600" />}
        {testStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
        <AlertDescription className={
          testStatus === 'success' 
            ? 'text-green-800' 
            : testStatus === 'error' 
            ? 'text-red-800' 
            : ''
        }>
          {testMessage}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default ConnectionTestAlert;
