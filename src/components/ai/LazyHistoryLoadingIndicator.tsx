
import React from 'react';
import { Loader2, Database, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LazyHistoryLoadingIndicatorProps {
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  stats: {
    cacheSize: number;
    loadedBatches: number;
    currentOffset: number;
  };
  onLoadMore: () => void;
  onRetry: () => void;
  className?: string;
}

export const LazyHistoryLoadingIndicator: React.FC<LazyHistoryLoadingIndicatorProps> = ({
  isLoading,
  hasMore,
  error,
  stats,
  onLoadMore,
  onRetry,
  className = ""
}) => {
  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              Error cargando historial: {error}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardContent className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-800">
              Cargando historial...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasMore) {
    return (
      <Card className={`border-gray-200 bg-gray-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                className="flex items-center gap-2"
              >
                <Clock className="h-3 w-3" />
                Cargar más mensajes
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  {stats.loadedBatches} lotes
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats.currentOffset} mensajes
                </Badge>
                {stats.cacheSize > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Cache: {stats.cacheSize}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No hay más mensajes
  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <CardContent className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800">
            Todo el historial cargado ({stats.currentOffset} mensajes)
          </span>
          {stats.cacheSize > 0 && (
            <Badge variant="outline" className="text-xs ml-2">
              Cache: {stats.cacheSize} lotes
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LazyHistoryLoadingIndicator;
