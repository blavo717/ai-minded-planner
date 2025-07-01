
/**
 * Parser inteligente para texto estructurado del LLM
 * Extrae información usando múltiples estrategias de parsing
 */

export interface ParsedLLMResponse {
  statusSummary: string;
  nextSteps: string;
  alerts?: string;
  insights?: string;
  riskLevel: 'low' | 'medium' | 'high';
  problems?: string[];
  recommendations?: string[];
}

export class StructuredTextParser {
  
  /**
   * Parser principal que combina múltiples estrategias
   */
  static parseStructuredText(rawText: string): ParsedLLMResponse {
    console.log('🔍 Parsing texto estructurado del LLM:', rawText.substring(0, 200) + '...');
    
    try {
      // Estrategia 1: Parser por marcadores específicos
      const markerParsed = this.parseByMarkers(rawText);
      if (this.isValidParsedResponse(markerParsed)) {
        console.log('✅ Parsing exitoso con marcadores');
        return markerParsed;
      }
      
      // Estrategia 2: Parser por secciones
      const sectionParsed = this.parseBySections(rawText);
      if (this.isValidParsedResponse(sectionParsed)) {
        console.log('✅ Parsing exitoso con secciones');
        return sectionParsed;
      }
      
      // Estrategia 3: Parser por patrones de texto
      const patternParsed = this.parseByPatterns(rawText);
      if (this.isValidParsedResponse(patternParsed)) {
        console.log('✅ Parsing exitoso con patrones');
        return patternParsed;
      }
      
      // Estrategia 4: Fallback inteligente
      console.log('⚡ Usando fallback inteligente');
      return this.createIntelligentFallback(rawText);
      
    } catch (error) {
      console.error('❌ Error en parsing:', error);
      return this.createBasicFallback(rawText);
    }
  }

  /**
   * Estrategia 1: Parser por marcadores específicos (ESTADO:, ACCIÓN:, etc.)
   */
  private static parseByMarkers(text: string): ParsedLLMResponse {
    const sections = {
      statusSummary: this.extractSection(text, ['ESTADO:', 'STATUS:', 'RESUMEN:']),
      nextSteps: this.extractSection(text, ['ACCIÓN:', 'PRÓXIMOS PASOS:', 'NEXT STEPS:', 'ACCIONES:']),
      alerts: this.extractSection(text, ['ALERTA:', 'PROBLEMA:', 'ALERT:', 'WARNING:']),
      insights: this.extractSection(text, ['INSIGHT:', 'ANÁLISIS:', 'PATRÓN:', 'RECOMENDACIÓN:']),
      problems: this.extractList(text, ['PROBLEMAS:', 'ISSUES:', 'BLOQUEOS:']),
      recommendations: this.extractList(text, ['SUGERENCIAS:', 'RECOMMENDATIONS:', 'MEJORAS:'])
    };
    
    return {
      statusSummary: sections.statusSummary || 'Análisis en proceso',
      nextSteps: sections.nextSteps || cache: process',
      alerts: sections.alerts,
      insights: sections.insights,
      riskLevel: this.detectRiskLevel(text),
      problems: sections.problems,
      recommendations: sections.recommendations
    };
  }

  /**
   * Estrategia 2: Parser por secciones de párrafos
   */
  private static parseBySections(text: string): ParsedLLMResponse {
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 10);
    
    return {
      statusSummary: paragraphs[0] || 'Análisis disponible',
      nextSteps: paragraphs[1] || 'Revisar progreso actual',
      insights: paragraphs.length > 2 ? paragraphs.slice(2).join('\n\n') : undefined,
      riskLevel: this.detectRiskLevel(text)
    };
  }

  /**
   * Estrategia 3: Parser por patrones de texto comunes
   */
  private static parseByPatterns(text: string): ParsedLLMResponse {
    const statusMatch = text.match(/(?:está|tiene|muestra|presenta).+?(?:\.|$)/i);
    const actionMatch = text.match(/(?:debe|debería|es necesario|recomiendo|sugiero).+?(?:\.|$)/gi);
    const problemMatch = text.match(/(?:problema|bloqueo|dificultad|retraso).+?(?:\.|$)/gi);
    
    return {
      statusSummary: statusMatch ? statusMatch[0] : 'Estado analizado',
      nextSteps: actionMatch ? actionMatch.slice(0, 2).join(' ') : 'Continuar con progreso',
      alerts: problemMatch && problemMatch.length > 0 ? problemMatch[0] : undefined,
      insights: text.length > 200 ? text.substring(0, 300) + '...' : text,
      riskLevel: this.detectRiskLevel(text)
    };
  }

  /**
   * Extrae sección basada en marcadores
   */
  private static extractSection(text: string, markers: string[]): string | undefined {
    for (const marker of markers) {
      const regex = new RegExp(`${marker}\\s*(.+?)(?=\\n[A-Z]+:|$)`, 'si');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  /**
   * Extrae listas de elementos
   */
  private static extractList(text: string, markers: string[]): string[] | undefined {
    for (const marker of markers) {
      const regex = new RegExp(`${marker}\\s*(.+?)(?=\\n[A-Z]+:|$)`, 'si');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1]
          .split(/[•\-\*\n]/)
          .map(item => item.trim())
          .filter(item => item.length > 5);
      }
    }
    return undefined;
  }

  /**
   * Detecta nivel de riesgo basado en palabras clave
   */
  private static detectRiskLevel(text: string): 'low' | 'medium' | 'high' {
    const lowerText = text.toLowerCase();
    
    const highRiskWords = ['crítico', 'urgente', 'bloqueado', 'vencido', 'critical', 'urgent'];
    const mediumRiskWords = ['retraso', 'problema', 'dificultad', 'delay', 'issue'];
    
    if (highRiskWords.some(word => lowerText.includes(word))) {
      return 'high';
    }
    if (mediumRiskWords.some(word => lowerText.includes(word))) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Valida si la respuesta parseada es útil
   */
  private static isValidParsedResponse(response: ParsedLLMResponse): boolean {
    return !!(response.statusSummary && 
             response.statusSummary.length > 20 && 
             response.nextSteps && 
             response.nextSteps.length > 15);
  }

  /**
   * Crea fallback inteligente usando el texto completo
   */
  private static createIntelligentFallback(text: string): ParsedLLMResponse {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    return {
      statusSummary: sentences[0] || 'Análisis de contexto generado',
      nextSteps: sentences[1] || 'Revisar información y continuar',
      insights: sentences.length > 2 ? sentences.slice(2, 4).join('. ') : text.substring(0, 200),
      riskLevel: this.detectRiskLevel(text)
    };
  }

  /**
   * Fallback básico cuando todo falla
   */
  private static createBasicFallback(text: string): ParsedLLMResponse {
    return {
      statusSummary: text.substring(0, 150) || 'Análisis generado por IA',
      nextSteps: 'Revisar el contexto actual y definir próximos pasos',
      insights: text.length > 150 ? text.substring(0, 300) : undefined,
      riskLevel: 'medium'
    };
  }
}
