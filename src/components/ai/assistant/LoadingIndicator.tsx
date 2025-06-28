
import React from 'react';
import { Brain } from 'lucide-react';

const LoadingIndicator = () => {
  return (
    <div className="flex gap-3">
      <div className="bg-purple-100 text-purple-600 rounded-full p-2">
        <Brain className="h-4 w-4" />
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-sm text-purple-600">Generando respuesta...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
