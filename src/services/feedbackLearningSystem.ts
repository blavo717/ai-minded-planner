import { supabase } from '@/integrations/supabase/client';

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
  type: 'rule_created' | 'rule_updated' | 'weight_adjusted' | 'pattern_detected';
  title: string;
  description: string;
  actionable: boolean;
  confidence: number;
}

export interface AdaptiveWeight {
  id?: string;
  user_id: string;
  factor_name: string;
  weight: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  sample_size: number;
}

export interface FeedbackData {
  user_id: string;
  task_id: string;
  action: 'accepted' | 'skipped' | 'completed' | 'feedback_positive' | 'feedback_negative';
  satisfaction?: number;
  context_data?: any;
}

export class FeedbackLearningSystem {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async processFeedback(feedback: FeedbackData): Promise<LearningInsight[]> {
    try {
      // Guardar feedback
      await this.saveFeedback(feedback);
      
      // Analizar patrones y generar insights
      const insights = await this.analyzePatterns();
      
      // Actualizar reglas de aprendizaje
      await this.updateLearningRules(feedback);
      
      // Ajustar pesos adaptativos
      await this.adjustAdaptiveWeights(feedback);
      
      return insights;
    } catch (error) {
      console.error('Error processing feedback:', error);
      return [];
    }
  }

  async analyzePatterns(): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];
    
    try {
      // Obtener feedback reciente
      const { data: recentFeedback } = await supabase
        .from('recommendation_feedback')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!recentFeedback || recentFeedback.length < 10) {
        return insights;
      }

      // Analizar tasa de aceptación
      const acceptanceRate = this.calculateAcceptanceRate(recentFeedback);
      if (acceptanceRate < 0.5) {
        insights.push({
          type: 'pattern_detected',
          title: 'Baja tasa de aceptación',
          description: `Solo aceptas el ${Math.round(acceptanceRate * 100)}% de las recomendaciones`,
          actionable: true,
          confidence: 0.8
        });
      } else if (acceptanceRate > 0.8) {
        insights.push({
          type: 'pattern_detected',
          title: 'Alta tasa de aceptación',
          description: `Aceptas el ${Math.round(acceptanceRate * 100)}% de las recomendaciones`,
          actionable: false,
          confidence: 0.9
        });
      }

      // Analizar patrones de horarios
      const timePatterns = this.analyzeTimePatterns(recentFeedback);
      if (timePatterns.bestHour) {
        insights.push({
          type: 'pattern_detected',
          title: 'Horario óptimo identificado',
          description: `Tu mejor hora para recomendaciones es las ${timePatterns.bestHour}:00`,
          actionable: true,
          confidence: timePatterns.confidence
        });
      }

      // Analizar feedback positivo vs negativo
      const satisfactionPattern = this.analyzeSatisfactionPattern(recentFeedback);
      if (satisfactionPattern.trend === 'improving') {
        insights.push({
          type: 'pattern_detected',
          title: 'Mejora en satisfacción',
          description: 'Las recomendaciones han mejorado en las últimas semanas',
          actionable: false,
          confidence: 0.7
        });
      }

      return insights;
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return insights;
    }
  }

  async updateLearningRules(feedback: FeedbackData): Promise<void> {
    try {
      const context = feedback.context_data || {};
      
      if (feedback.action === 'accepted' || feedback.action === 'completed') {
        // Crear/actualizar regla de preferencia
        await this.upsertRule({
          user_id: this.userId,
          rule_type: 'preference',
          condition: {
            hour: new Date().getHours(),
            priority: context.priority,
            tags: context.tags
          },
          action: { boost_score: 20 },
          confidence: 0.7,
          usage_count: 1,
          success_rate: 1.0
        });
      } else if (feedback.action === 'skipped' || feedback.action === 'feedback_negative') {
        // Crear/actualizar regla de evitación
        await this.upsertRule({
          user_id: this.userId,
          rule_type: 'avoidance',
          condition: {
            hour: new Date().getHours(),
            priority: context.priority,
            tags: context.tags
          },
          action: { reduce_score: 15 },
          confidence: 0.6,
          usage_count: 1,
          success_rate: 0.0
        });
      }
    } catch (error) {
      console.error('Error updating learning rules:', error);
    }
  }

  async adjustAdaptiveWeights(feedback: FeedbackData): Promise<void> {
    try {
      const factors = ['urgency', 'context', 'pattern', 'momentum', 'learning'];
      
      for (const factor of factors) {
        const currentWeight = await this.getAdaptiveWeight(factor);
        let newWeight = currentWeight.weight;
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

        // Ajustar peso basado en feedback
        if (feedback.action === 'accepted' || feedback.action === 'completed') {
          newWeight = Math.min(1.5, newWeight + 0.05);
          trend = 'increasing';
        } else if (feedback.action === 'skipped') {
          newWeight = Math.max(0.5, newWeight - 0.03);
          trend = 'decreasing';
        }

        await this.updateAdaptiveWeight(factor, newWeight, trend, currentWeight.sample_size + 1);
      }
    } catch (error) {
      console.error('Error adjusting adaptive weights:', error);
    }
  }

  private async saveFeedback(feedback: FeedbackData): Promise<void> {
    const { error } = await supabase
      .from('recommendation_feedback')
      .insert({
        user_id: feedback.user_id,
        task_id: feedback.task_id,
        action: feedback.action,
        satisfaction: feedback.satisfaction,
        context_data: feedback.context_data || {},
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
  }

  private async upsertRule(rule: Omit<LearningRule, 'id'>): Promise<void> {
    // Buscar regla existente
    const { data: existingRule } = await supabase
      .from('learning_rules')
      .select('*')
      .eq('user_id', rule.user_id)
      .eq('rule_type', rule.rule_type)
      .eq('condition', JSON.stringify(rule.condition))
      .maybeSingle();

    if (existingRule) {
      // Actualizar regla existente
      const newUsageCount = existingRule.usage_count + 1;
      const newSuccessRate = (existingRule.success_rate * existingRule.usage_count + rule.success_rate) / newUsageCount;
      
      await supabase
        .from('learning_rules')
        .update({
          confidence: Math.min(1.0, existingRule.confidence + 0.1),
          usage_count: newUsageCount,
          success_rate: newSuccessRate
        })
        .eq('id', existingRule.id);
    } else {
      // Crear nueva regla
      await supabase
        .from('learning_rules')
        .insert(rule);
    }
  }

  private async getAdaptiveWeight(factorName: string): Promise<AdaptiveWeight> {
    const { data } = await supabase
      .from('adaptive_weights')
      .select('*')
      .eq('user_id', this.userId)
      .eq('factor_name', factorName)
      .maybeSingle();

    return (data as AdaptiveWeight) || {
      user_id: this.userId,
      factor_name: factorName,
      weight: 1.0,
      confidence: 0.5,
      trend: 'stable',
      sample_size: 0
    };
  }

  private async updateAdaptiveWeight(
    factorName: string, 
    weight: number, 
    trend: 'increasing' | 'decreasing' | 'stable',
    sampleSize: number
  ): Promise<void> {
    const { error } = await supabase
      .from('adaptive_weights')
      .upsert({
        user_id: this.userId,
        factor_name: factorName,
        weight,
        confidence: Math.min(1.0, 0.5 + (sampleSize * 0.02)),
        trend,
        sample_size: sampleSize
      });

    if (error) throw error;
  }

  private calculateAcceptanceRate(feedback: any[]): number {
    const acceptedActions = feedback.filter(f => 
      f.action === 'accepted' || f.action === 'completed'
    ).length;
    
    return acceptedActions / feedback.length;
  }

  private analyzeTimePatterns(feedback: any[]): { bestHour?: number; confidence: number } {
    const hourCounts: { [hour: number]: { accepted: number; total: number } } = {};
    
    feedback.forEach(f => {
      const hour = new Date(f.timestamp).getHours();
      if (!hourCounts[hour]) {
        hourCounts[hour] = { accepted: 0, total: 0 };
      }
      hourCounts[hour].total++;
      if (f.action === 'accepted' || f.action === 'completed') {
        hourCounts[hour].accepted++;
      }
    });

    let bestHour: number | undefined;
    let bestRate = 0;
    
    Object.entries(hourCounts).forEach(([hour, counts]) => {
      const rate = counts.accepted / counts.total;
      if (rate > bestRate && counts.total >= 3) {
        bestRate = rate;
        bestHour = parseInt(hour);
      }
    });

    return {
      bestHour,
      confidence: bestRate > 0.7 ? 0.8 : 0.5
    };
  }

  private analyzeSatisfactionPattern(feedback: any[]): { trend: 'improving' | 'declining' | 'stable' } {
    const recentFeedback = feedback.slice(0, 10);
    const olderFeedback = feedback.slice(10, 20);
    
    if (recentFeedback.length < 5 || olderFeedback.length < 5) {
      return { trend: 'stable' };
    }

    const recentPositive = recentFeedback.filter(f => 
      f.action === 'accepted' || f.action === 'feedback_positive'
    ).length / recentFeedback.length;
    
    const olderPositive = olderFeedback.filter(f => 
      f.action === 'accepted' || f.action === 'feedback_positive'
    ).length / olderFeedback.length;

    if (recentPositive > olderPositive + 0.1) return { trend: 'improving' };
    if (recentPositive < olderPositive - 0.1) return { trend: 'declining' };
    return { trend: 'stable' };
  }

  async getLearningRules(): Promise<LearningRule[]> {
    const { data, error } = await supabase
      .from('learning_rules')
      .select('*')
      .eq('user_id', this.userId)
      .order('confidence', { ascending: false });

    if (error) throw error;
    return (data as LearningRule[]) || [];
  }

  async getAdaptiveWeights(): Promise<AdaptiveWeight[]> {
    const { data, error } = await supabase
      .from('adaptive_weights')
      .select('*')
      .eq('user_id', this.userId);

    if (error) throw error;
    return (data as AdaptiveWeight[]) || [];
  }
}