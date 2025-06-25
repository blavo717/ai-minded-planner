
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, DollarSign, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface UsageData {
  model_name: string;
  total_calls: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost: number;
  last_used: string;
}

interface DailyUsage {
  date: string;
  calls: number;
  tokens: number;
  cost: number;
}

const LLMUsageDashboard = () => {
  const { user } = useAuth();

  const { data: usageData, isLoading, refetch } = useQuery({
    queryKey: ['llm-usage-dashboard', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Obtener datos de uso de los últimos 30 días
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data: insights, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('insight_type', 'api_usage_log')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Procesar datos para el dashboard
      const modelUsage: Record<string, UsageData> = {};
      const dailyUsage: Record<string, DailyUsage> = {};

      insights?.forEach(insight => {
        const data = insight.insight_data as any;
        const model = data.model_name;
        const date = format(new Date(insight.created_at), 'yyyy-MM-dd');

        // Agregar por modelo
        if (!modelUsage[model]) {
          modelUsage[model] = {
            model_name: model,
            total_calls: 0,
            total_tokens: 0,
            prompt_tokens: 0,
            completion_tokens: 0,
            estimated_cost: 0,
            last_used: insight.created_at,
          };
        }

        modelUsage[model].total_calls += 1;
        modelUsage[model].total_tokens += data.total_tokens || 0;
        modelUsage[model].prompt_tokens += data.prompt_tokens || 0;
        modelUsage[model].completion_tokens += data.completion_tokens || 0;
        modelUsage[model].estimated_cost += estimateCost(model, data.total_tokens || 0);

        // Agregar por día
        if (!dailyUsage[date]) {
          dailyUsage[date] = {
            date,
            calls: 0,
            tokens: 0,
            cost: 0,
          };
        }

        dailyUsage[date].calls += 1;
        dailyUsage[date].tokens += data.total_tokens || 0;
        dailyUsage[date].cost += estimateCost(model, data.total_tokens || 0);
      });

      return {
        modelUsage: Object.values(modelUsage),
        dailyUsage: Object.values(dailyUsage).sort((a, b) => a.date.localeCompare(b.date)),
        totalCalls: Object.values(modelUsage).reduce((sum, model) => sum + model.total_calls, 0),
        totalTokens: Object.values(modelUsage).reduce((sum, model) => sum + model.total_tokens, 0),
        totalCost: Object.values(modelUsage).reduce((sum, model) => sum + model.estimated_cost, 0),
      };
    },
    enabled: !!user,
  });

  const estimateCost = (model: string, tokens: number): number => {
    // Precios aproximados por 1K tokens (actualizar según OpenRouter)
    const pricing: Record<string, number> = {
      'openai/gpt-4o': 0.005,
      'openai/gpt-4o-mini': 0.0002,
      'anthropic/claude-3.5-sonnet': 0.003,
      'google/gemini-pro-1.5': 0.001,
      'google/gemini-flash-1.5': 0.0001,
    };

    const rate = pricing[model] || 0.001; // Default rate
    return (tokens / 1000) * rate;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Debes iniciar sesión para ver el dashboard de uso</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="h-32 bg-gray-100 animate-pulse rounded" />
          </Card>
        ))}
      </div>
    );
  }

  const data = usageData || { modelUsage: [], dailyUsage: [], totalCalls: 0, totalTokens: 0, totalCost: 0 };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Llamadas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCalls}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total procesados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Aproximado USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.modelUsage.length}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-xs p-0 h-auto"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualizar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Por Modelo</TabsTrigger>
          <TabsTrigger value="daily">Uso Diario</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          {data.modelUsage.length > 0 ? (
            <div className="grid gap-4">
              {data.modelUsage
                .sort((a, b) => b.total_calls - a.total_calls)
                .map((model) => (
                  <Card key={model.model_name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{model.model_name}</CardTitle>
                        <Badge variant="secondary">
                          {model.total_calls} llamadas
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tokens Totales</p>
                          <p className="font-medium">{model.total_tokens.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prompt / Respuesta</p>
                          <p className="font-medium">
                            {model.prompt_tokens.toLocaleString()} / {model.completion_tokens.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Costo Estimado</p>
                          <p className="font-medium">${model.estimated_cost.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Último Uso</p>
                          <p className="font-medium">
                            {format(new Date(model.last_used), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Usage Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Uso relativo</span>
                          <span>{((model.total_calls / data.totalCalls) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={(model.total_calls / data.totalCalls) * 100} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No hay datos de uso disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          {data.dailyUsage.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Uso por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.dailyUsage
                    .slice(-14) // Últimos 14 días
                    .map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{format(new Date(day.date), 'dd/MM/yyyy')}</p>
                          <p className="text-sm text-muted-foreground">
                            {day.calls} llamadas • {day.tokens.toLocaleString()} tokens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${day.cost.toFixed(4)}</p>
                          <Progress 
                            value={(day.calls / Math.max(...data.dailyUsage.map(d => d.calls))) * 100} 
                            className="h-2 w-20"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No hay datos diarios disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMUsageDashboard;
