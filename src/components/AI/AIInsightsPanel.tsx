
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';
import AIInsightCard from './AIInsightCard';

interface AIInsightsPanelProps {
  maxItems?: number;
}

const AIInsightsPanel = ({ maxItems = 3 }: AIInsightsPanelProps) => {
  const { 
    insights, 
    unreadInsights, 
    markAsRead, 
    dismissInsight, 
    isLoading 
  } = useAIInsights();

  const displayInsights = insights.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
            {unreadInsights.length > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600">
                {unreadInsights.length} nuevo{unreadInsights.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          
          {insights.length > maxItems && (
            <Button variant="ghost" size="sm">
              Ver todos
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {displayInsights.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No hay insights disponibles aún
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Sigue usando la app para generar insights personalizados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayInsights.map((insight) => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={markAsRead}
                onDismiss={dismissInsight}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
