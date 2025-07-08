import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeItem {
  id?: string;
  user_id: string;
  knowledge_type: 'personal' | 'professional' | 'preference' | 'fact';
  category: string;
  key_name: string;
  value_text?: string;
  value_json?: any;
  confidence_score?: number;
  source: 'conversation' | 'behavior_analysis' | 'explicit_input';
  learned_from?: string;
  last_confirmed_at?: Date;
}

/**
 * ✅ FASE 1: Hook para extraer y guardar conocimiento del usuario automáticamente
 * Analiza conversaciones y guarda información personal/profesional en la base de conocimiento
 */
export const useKnowledgeExtractor = () => {
  const { user } = useAuth();

  /**
   * Extrae información personal de un mensaje del usuario
   */
  const extractPersonalInfo = useCallback((message: string): KnowledgeItem[] => {
    if (!user?.id) return [];

    const knowledgeItems: KnowledgeItem[] = [];
    const messageLower = message.toLowerCase();

    // Patrones para extraer información personal
    const patterns = [
      // Edad
      {
        regex: /(?:tengo|soy de|mi edad es|tengo.*años?|años?).*?(\d{1,3})\s*años?/i,
        extract: (match: RegExpMatchArray) => ({
          knowledge_type: 'personal' as const,
          category: 'basic_info',
          key_name: 'age',
          value_text: match[1],
          confidence_score: 0.95
        })
      },
      // Cumpleaños
      {
        regex: /(?:cumpleaños|nací|nacimiento).*?(\d{1,2}).*?(?:de )?(\w+).*?(\d{4})/i,
        extract: (match: RegExpMatchArray) => ({
          knowledge_type: 'personal' as const,
          category: 'basic_info',
          key_name: 'birthday',
          value_json: { 
            day: parseInt(match[1]), 
            month: match[2], 
            year: parseInt(match[3]),
            full_date: `${match[1]} de ${match[2]} de ${match[3]}`
          },
          confidence_score: 0.95
        })
      },
      // Nombre
      {
        regex: /(?:me llamo|mi nombre es|soy)\s+([A-ZÁÉÍÓÚ][a-záéíóúñ]+)/i,
        extract: (match: RegExpMatchArray) => ({
          knowledge_type: 'personal' as const,
          category: 'basic_info',
          key_name: 'name',
          value_text: match[1],
          confidence_score: 0.9
        })
      },
      // Preferencias negativas (no me gusta)
      {
        regex: /(?:no me gusta|odio|detesto|no tolero)\s+(?:el |la |los |las )?([^.!?]+)/i,
        extract: (match: RegExpMatchArray) => ({
          knowledge_type: 'preference' as const,
          category: 'dislikes',
          key_name: match[1].trim().toLowerCase(),
          value_text: 'dislike',
          confidence_score: 0.8
        })
      },
      // Preferencias positivas (me gusta)
      {
        regex: /(?:me gusta|me encanta|amo|prefiero)\s+(?:el |la |los |las )?([^.!?]+)/i,
        extract: (match: RegExpMatchArray) => ({
          knowledge_type: 'preference' as const,
          category: 'likes',
          key_name: match[1].trim().toLowerCase(),
          value_text: 'like',
          confidence_score: 0.8
        })
      },
      // Trabajo/Rol profesional
      {
        regex: /(?:trabajo como|soy|mi trabajo es|me dedico a)\s+([^.!?]+)/i,
        extract: (match: RegExpMatchArray) => ({
          knowledge_type: 'professional' as const,
          category: 'role',
          key_name: 'job_title',
          value_text: match[1].trim(),
          confidence_score: 0.85
        })
      },
      // Horarios de trabajo
      {
        regex: /(?:trabajo|laburo|jornada).*?(?:de |desde )?(\d{1,2}):?(\d{0,2})?\s*(?:a |hasta )?(\d{1,2}):?(\d{0,2})?/i,
        extract: (match: RegExpMatchArray) => ({
          knowledge_type: 'professional' as const,
          category: 'schedule',
          key_name: 'work_hours',
          value_json: {
            start: `${match[1]}:${match[2] || '00'}`,
            end: `${match[3]}:${match[4] || '00'}`
          },
          confidence_score: 0.7
        })
      }
    ];

    // Aplicar patrones
    patterns.forEach(pattern => {
      const match = message.match(pattern.regex);
      if (match) {
        const extracted = pattern.extract(match);
        knowledgeItems.push({
          user_id: user.id,
          source: 'conversation',
          learned_from: `message_${Date.now()}`,
          ...extracted
        });
      }
    });

    return knowledgeItems;
  }, [user?.id]);

  /**
   * Guarda knowledge items en la base de datos
   */
  const saveKnowledge = useCallback(async (knowledgeItems: KnowledgeItem[]): Promise<boolean> => {
    if (!user?.id || knowledgeItems.length === 0) return false;

    try {
      // Preparar datos para inserción usando UPSERT para evitar duplicados
      for (const item of knowledgeItems) {
        const { error } = await supabase
          .from('user_knowledge_base')
          .upsert({
            user_id: item.user_id,
            knowledge_type: item.knowledge_type,
            category: item.category,
            key_name: item.key_name,
            value_text: item.value_text,
            value_json: item.value_json,
            confidence_score: item.confidence_score || 0.8,
            source: item.source,
            learned_from: item.learned_from,
            last_confirmed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,category,key_name'
          });

        if (error) {
          console.error('Error saving knowledge item:', error);
          return false;
        }
      }

      console.log(`✅ Guardados ${knowledgeItems.length} items de conocimiento`);
      return true;
    } catch (error) {
      console.error('Error in saveKnowledge:', error);
      return false;
    }
  }, [user?.id]);

  /**
   * Extrae y guarda conocimiento de un mensaje automáticamente
   */
  const processMessage = useCallback(async (message: string): Promise<void> => {
    const extractedItems = extractPersonalInfo(message);
    
    if (extractedItems.length > 0) {
      console.log(`🧠 Extrayendo ${extractedItems.length} items de conocimiento:`, extractedItems);
      await saveKnowledge(extractedItems);
    }
  }, [extractPersonalInfo, saveKnowledge]);

  /**
   * Obtiene todo el conocimiento del usuario
   */
  const getUserKnowledge = useCallback(async (): Promise<KnowledgeItem[]> => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('user_knowledge_base')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching user knowledge:', error);
        return [];
      }

      return (data || []).map(item => ({
        ...item,
        knowledge_type: item.knowledge_type as 'personal' | 'professional' | 'preference' | 'fact',
        source: item.source as 'conversation' | 'behavior_analysis' | 'explicit_input',
        last_confirmed_at: item.last_confirmed_at ? new Date(item.last_confirmed_at) : undefined
      }));
    } catch (error) {
      console.error('Error in getUserKnowledge:', error);
      return [];
    }
  }, [user?.id]);

  /**
   * Obtiene conocimiento por categoría
   */
  const getKnowledgeByCategory = useCallback(async (category: string): Promise<KnowledgeItem[]> => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('user_knowledge_base')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (error) {
        console.error('Error fetching knowledge by category:', error);
        return [];
      }

      return (data || []).map(item => ({
        ...item,
        knowledge_type: item.knowledge_type as 'personal' | 'professional' | 'preference' | 'fact',
        source: item.source as 'conversation' | 'behavior_analysis' | 'explicit_input',
        last_confirmed_at: item.last_confirmed_at ? new Date(item.last_confirmed_at) : undefined
      }));
    } catch (error) {
      console.error('Error in getKnowledgeByCategory:', error);
      return [];
    }
  }, [user?.id]);

  return {
    extractPersonalInfo,
    saveKnowledge,
    processMessage,
    getUserKnowledge,
    getKnowledgeByCategory
  };
};