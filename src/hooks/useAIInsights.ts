
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  description: string | null;
  insight_data: any;
  priority: number;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at: string | null;
}

export const useAIInsights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['ai-insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIInsight[];
    },
    enabled: !!user,
  });

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
      toast({
        title: "Insight descartado",
        description: "El insight ha sido marcado como descartado.",
      });
    },
  });

  const unreadInsights = insights.filter(insight => !insight.is_read);
  const highPriorityInsights = insights.filter(insight => insight.priority === 1);

  return {
    insights,
    unreadInsights,
    highPriorityInsights,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    dismissInsight: dismissInsightMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDismissing: dismissInsightMutation.isPending,
  };
};
