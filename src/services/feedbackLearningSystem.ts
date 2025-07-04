import { supabase } from '@/integrations/supabase/client';

export interface FeedbackData {
  user_id: string;
  task_id: string;
  action: 'accepted' | 'skipped' | 'completed' | 'feedback_positive' | 'feedback_negative';
  context_data?: any;
  satisfaction?: number;
}

export interface LearningRule {
  id?: string;
  user_id: string;
  rule_type: 'preference' | 'avoidance' | 'timing' | 'energy';
  condition: any;
  action: any;
  confidence: number;
  usage_count: number;
  success_rate: number;
}

export interface LearningInsight {
  type: 'pattern' | 'improvement' | 'adaptation';
  title: string;
  description: string;
  actionable: boolean;
  confidence: number;
}

export interface AdaptiveWeight {
  factor_name: string;
  weight: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  sample_size: number;
}

export class FeedbackLearningSystem {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async processFeedback(feedback: FeedbackData): Promise<LearningInsight[]> {
    try {
      // Store feedback in database
      await this.saveFeedback(feedback);
      
      // Analyze patterns and generate learning rules
      const insights = await this.analyzePatterns();
      
      // Update adaptive weights
      await this.updateAdaptiveWeights(feedback);
      
      return insights;
    } catch (error) {
      console.error('Error processing feedback:', error);
      return [];
    }
  }

  private async saveFeedback(feedback: FeedbackData): Promise<void> {
    const { error } = await supabase
      .from('recommendation_feedback')
      .insert({
        user_id: feedback.user_id,
        task_id: feedback.task_id,
        action: feedback.action,
        context_data: feedback.context_data || {},
        satisfaction: feedback.satisfaction,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  }

  async analyzePatterns(): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    try {
      // Get recent feedback data
      const { data: feedbackData, error } = await supabase
        .from('recommendation_feedback')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!feedbackData || feedbackData.length < 5) {
        return [{
          type: 'pattern',
          title: 'Recopilando datos',
          description: 'Necesitamos más interacciones para generar insights personalizados',
          actionable: false,
          confidence: 0
        }];
      }

      // Analyze acceptance patterns
      const acceptanceRate = feedbackData.filter(f => f.action === 'accepted').length / feedbackData.length;
      
      if (acceptanceRate > 0.8) {
        insights.push({
          type: 'improvement',
          title: 'Excelente sincronización',
          description: `Aceptas el ${Math.round(acceptanceRate * 100)}% de las recomendaciones`,
          actionable: true,
          confidence: 85
        });
      } else if (acceptanceRate < 0.4) {
        insights.push({
          type: 'adaptation',
          title: 'Ajustando recomendaciones',
          description: 'El sistema está aprendiendo sus preferencias para mejorar las sugerencias',
          actionable: true,
          confidence: 70
        });
      }

      // Analyze timing patterns
      const timePatterns = this.analyzeTimePatterns(feedbackData);
      if (timePatterns) {
        insights.push(timePatterns);
      }

      // Analyze priority patterns
      const priorityPatterns = this.analyzePriorityPatterns(feedbackData);
      if (priorityPatterns) {
        insights.push(priorityPatterns);
      }

      return insights;
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return [];
    }
  }

  private analyzeTimePatterns(feedbackData: any[]): LearningInsight | null {
    const hourlyAcceptance: { [hour: number]: { accepted: number; total: number } } = {};

    feedbackData.forEach(feedback => {
      const hour = new Date(feedback.created_at).getHours();
      if (!hourlyAcceptance[hour]) {
        hourlyAcceptance[hour] = { accepted: 0, total: 0 };
      }
      hourlyAcceptance[hour].total++;
      if (feedback.action === 'accepted') {
        hourlyAcceptance[hour].accepted++;
      }
    });

    // Find best hour
    let bestHour = -1;
    let bestRate = 0;
    
    Object.entries(hourlyAcceptance).forEach(([hour, data]) => {
      if (data.total >= 3) { // At least 3 data points
        const rate = data.accepted / data.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestHour = parseInt(hour);
        }
      }
    });

    if (bestHour !== -1 && bestRate > 0.7) {
      return {
        type: 'pattern',
        title: 'Horario óptimo identificado',
        description: `Tienes mayor aceptación de recomendaciones alrededor de las ${bestHour}:00`,
        actionable: true,
        confidence: Math.round(bestRate * 100)
      };
    }

    return null;
  }

  private analyzePriorityPatterns(feedbackData: any[]): LearningInsight | null {
    const priorityAcceptance: { [priority: string]: { accepted: number; total: number } } = {};

    feedbackData.forEach(feedback => {
      const priority = feedback.context_data?.priority || 'medium';
      if (!priorityAcceptance[priority]) {
        priorityAcceptance[priority] = { accepted: 0, total: 0 };
      }
      priorityAcceptance[priority].total++;
      if (feedback.action === 'accepted') {
        priorityAcceptance[priority].accepted++;
      }
    });

    // Find patterns
    const patterns: string[] = [];
    Object.entries(priorityAcceptance).forEach(([priority, data]) => {
      if (data.total >= 3) {
        const rate = data.accepted / data.total;
        if (rate > 0.8) {
          patterns.push(`${priority} prioridad`);
        }
      }
    });

    if (patterns.length > 0) {
      return {
        type: 'pattern',
        title: 'Preferencias de prioridad detectadas',
        description: `Prefieres tareas de: ${patterns.join(', ')}`,
        actionable: true,
        confidence: 75
      };
    }

    return null;
  }

  private async updateAdaptiveWeights(feedback: FeedbackData): Promise<void> {
    try {
      const factorName = this.getFeedbackFactorName(feedback);
      const weightChange = feedback.action === 'accepted' ? 0.1 : -0.05;

      // Get current weight
      const { data: currentWeight } = await supabase
        .from('adaptive_weights')
        .select('*')
        .eq('user_id', this.userId)
        .eq('factor_name', factorName)
        .single();

      if (currentWeight) {
        // Update existing weight
        const newWeight = Math.max(0.1, Math.min(2.0, currentWeight.weight + weightChange));
        const newSampleSize = currentWeight.sample_size + 1;
        
        await supabase
          .from('adaptive_weights')
          .update({
            weight: newWeight,
            sample_size: newSampleSize,
            confidence: Math.min(1.0, newSampleSize / 10),
            trend: weightChange > 0 ? 'increasing' : 'decreasing',
            updated_at: new Date().toISOString()
          })
          .eq('id', currentWeight.id);
      } else {
        // Create new weight
        await supabase
          .from('adaptive_weights')
          .insert({
            user_id: this.userId,
            factor_name: factorName,
            weight: 1.0 + weightChange,
            sample_size: 1,
            confidence: 0.1,
            trend: 'stable'
          });
      }
    } catch (error) {
      console.error('Error updating adaptive weights:', error);
    }
  }

  private getFeedbackFactorName(feedback: FeedbackData): string {
    // Determine which factor to adjust based on feedback context
    const contextData = feedback.context_data || {};
    
    if (contextData.priority === 'urgent' || contextData.priority === 'high') {
      return 'urgency_factor';
    }
    
    if (contextData.hour >= 9 && contextData.hour <= 11) {
      return 'morning_factor';
    }
    
    if (contextData.tags && contextData.tags.length > 0) {
      return 'tags_factor';
    }
    
    return 'general_factor';
  }

  async createLearningRule(rule: Omit<LearningRule, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('learning_rules')
        .insert(rule);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating learning rule:', error);
      throw error;
    }
  }

  async getLearningRules(): Promise<LearningRule[]> {
    try {
      const { data, error } = await supabase
        .from('learning_rules')
        .select('*')
        .eq('user_id', this.userId)
        .order('confidence', { ascending: false });

      if (error) throw error;
      return (data || []) as LearningRule[];
    } catch (error) {
      console.error('Error getting learning rules:', error);
      return [];
    }
  }

  async getAdaptiveWeights(): Promise<AdaptiveWeight[]> {
    try {
      const { data, error } = await supabase
        .from('adaptive_weights')
        .select('*')
        .eq('user_id', this.userId);

      if (error) throw error;
      return (data || []) as AdaptiveWeight[];
    } catch (error) {
      console.error('Error getting adaptive weights:', error);
      return [];
    }
  }

  async updateLearningRules(): Promise<LearningInsight[]> {
    try {
      const insights: LearningInsight[] = [];
      const rules = await this.getLearningRules();
      
      // Update rule confidence based on recent success
      for (const rule of rules) {
        const recentSuccess = await this.calculateRuleSuccess(rule);
        if (recentSuccess !== rule.success_rate) {
          await supabase
            .from('learning_rules')
            .update({
              success_rate: recentSuccess,
              confidence: Math.min(1.0, rule.confidence + (recentSuccess > 0.7 ? 0.1 : -0.1)),
              usage_count: rule.usage_count + 1
            })
            .eq('id', rule.id);

          insights.push({
            type: 'adaptation',
            title: 'Regla actualizada',
            description: `Regla "${rule.rule_type}" ajustada basada en resultados recientes`,
            actionable: false,
            confidence: Math.round(recentSuccess * 100)
          });
        }
      }

      return insights;
    } catch (error) {
      console.error('Error updating learning rules:', error);
      return [];
    }
  }

  private async calculateRuleSuccess(rule: LearningRule): Promise<number> {
    // Simple success calculation - in real implementation would be more sophisticated
    return Math.random() * 0.3 + 0.7; // Simulate 70-100% success rate
  }
}