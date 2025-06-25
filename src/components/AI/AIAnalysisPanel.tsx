
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, RefreshCw, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  insight_data: any;
  priority: number;
  created_at: string;
  is_read: boolean;
  is_dismissed: boolean;
}

const AIAnalysisPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Obtener insights del usuario
  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .neq('insight_type', 'api_usage_log') // Excluir logs de uso
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as AIInsight[];
    },
    enabled: !!user,
  });

  // Ejecutar análisis AI manual
  const runAnalysisMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-analysis');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast({
        title: "Análisis completado",
        description: `Se generaron ${data.insights_generated} nuevos insights`,
      });
      setIsAnalyzing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error en el análisis",
        description: error.message || "No se pudo ejecutar el análisis AI",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  // Marcar insight como leído
  const markAsReadMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', insightId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
  });

  // Descartar insight
  const dismissInsightMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_dismissed: true })
        .eq('id', insightId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
  });

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    runAnalysisMutation.mutate();
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'destructive';
      case 2: return 'default';
      case 3: return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Alta';
      case 2: return 'Media';
      case 3: return 'Baja';
      default: return 'Media';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity_trend': return <TrendingUp className="h-4 w-4" />;
      case 'task_suggestion': return <Zap className="h-4 w-4" />;
      case 'pattern_analysis': return <Brain className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Inicia sesión para ver análisis de IA</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Análisis de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeInsights = insights?.filter(insight => !insight.is_dismissed) || [];
  const unreadCount = activeInsights.filter(insight => !insight.is_read).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Análisis de IA
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} nuevos
                </Badge>
              )}
            </CardTitle>
            <Button 
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || runAnalysisMutation.isPending}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analizando...' : 'Ejecutar Análisis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeInsights.length === 0 ? (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                No hay insights disponibles. Ejecuta un análisis para generar recomendaciones personalizadas.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {activeInsights.map((insight) => (
                <Card 
                  key={insight.id} 
                  className={`transition-all ${!insight.is_read ? 'border-blue-200 bg-blue-50' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-blue-600 mt-0.5">
                          {getInsightIcon(insight.insight_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant={getPriorityColor(insight.priority)}>
                              {getPriorityLabel(insight.priority)}
                            </Badge>
                            {!insight.is_read && (
                              <Badge variant="outline">Nuevo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(insight.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        {!insight.is_read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsReadMutation.mutate(insight.id)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissInsightMutation.mutate(insight.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisPanel;
