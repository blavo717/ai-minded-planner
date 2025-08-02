/**
 * SUBTAREA 2: Prompts especializados para generación de reportes HTML
 * Templates de prompts que generan HTML profesional de alta calidad
 */

import { AIReportConfiguration } from '@/services/aiHTMLReportService';

/**
 * Obtiene el prompt del sistema según el tipo de reporte
 */
export function getReportPrompt(type: 'weekly' | 'monthly', config: AIReportConfiguration): string {
  const basePrompt = getBaseReportPrompt();
  const typeSpecificPrompt = type === 'weekly' ? getWeeklyPrompt() : getMonthlyPrompt();
  const stylePrompt = getStylePrompt(config);
  
  return `${basePrompt}\n\n${typeSpecificPrompt}\n\n${stylePrompt}`;
}

/**
 * Prompt base para todos los reportes
 */
function getBaseReportPrompt(): string {
  return `Eres un experto en generación de reportes HTML profesionales para análisis de productividad. Tu tarea es crear un reporte HTML visualmente atractivo, profesional y completo basado en datos de tareas y proyectos.

PRINCIPIOS FUNDAMENTALES:
1. **HTML AUTÓNOMO**: Todo el CSS debe estar inline o en un <style> tag. No referencias externas excepto CDNs específicamente solicitados.
2. **DISEÑO RESPONSIVE**: El reporte debe verse bien en dispositivos móviles y desktop.
3. **VISUALIZACIÓN DE DATOS**: Usa gráficos y métricas visuales cuando sea apropiado.
4. **INSIGHTS INTELIGENTES**: Analiza los datos y proporciona recomendaciones accionables.
5. **PROFESIONALISMO**: El diseño debe ser elegante, limpio y adecuado para presentar a gerencia.

ESTRUCTURA OBLIGATORIA:
1. Header con título y período
2. Resumen ejecutivo con métricas clave
3. Análisis de productividad
4. Detalles de tareas y proyectos
5. Insights y recomendaciones
6. Footer con metadata de generación

ELEMENTOS TÉCNICOS REQUERIDOS:
- DOCTYPE html5 completo
- Meta tags responsive
- CSS inline o en <style>
- Colores en formato HSL
- Iconos usando Unicode o CSS
- Gráficos simples con CSS o Chart.js CDN si solicitado`;
}

/**
 * Prompt específico para reportes semanales
 */
function getWeeklyPrompt(): string {
  return `CONFIGURACIÓN ESPECÍFICA PARA REPORTE SEMANAL:

ENFOQUE: Análisis táctico de la semana con foco en momentum y patrones diarios.

SECCIONES ESPECÍFICAS:
1. **Resumen de la Semana**: Logros principales y métricas de 7 días
2. **Progreso Diario**: Breakdown día por día si hay datos suficientes
3. **Momentum Analysis**: Tendencias de productividad durante la semana
4. **Sprint Planning**: Preparación para la siguiente semana
5. **Quick Wins**: Tareas rápidas que pueden completarse pronto

MÉTRICAS CLAVE:
- Tareas completadas por día
- Tiempo de trabajo diario
- Picos de productividad por hora
- Ratio completado vs creado
- Eficiencia en estimaciones

INSIGHTS REQUERIDOS:
- Mejor día de la semana
- Patrones de trabajo diario
- Recomendaciones para la próxima semana
- Identificación de bloqueos`;
}

/**
 * Prompt específico para reportes mensuales
 */
function getMonthlyPrompt(): string {
  return `CONFIGURACIÓN ESPECÍFICA PARA REPORTE MENSUAL:

ENFOQUE: Análisis estratégico mensual con perspectiva de crecimiento y planificación.

SECCIONES ESPECÍFICAS:
1. **Resumen Ejecutivo**: Logros del mes y métricas estratégicas
2. **Análisis de Proyectos**: Estado de proyectos y avance general
3. **Tendencias de Productividad**: Evolución durante el mes
4. **Comparación Histórica**: Vs mes anterior si hay datos
5. **Planificación Estratégica**: Objetivos para el próximo mes

MÉTRICAS CLAVE:
- Total de tareas completadas en el mes
- Horas totales trabajadas
- Progreso en proyectos principales
- Ratio de eficiencia mensual
- Tiempo promedio por tarea

INSIGHTS REQUERIDOS:
- Patrones de productividad mensual
- Proyectos más exitosos
- Áreas de mejora identificadas
- Recomendaciones estratégicas para el próximo mes
- Análisis de carga de trabajo`;
}

/**
 * Prompt para estilos y diseño visual
 */
function getStylePrompt(config: AIReportConfiguration): string {
  const colorSchemes = {
    blue: {
      primary: 'hsl(210, 100%, 50%)',
      secondary: 'hsl(210, 100%, 95%)',
      accent: 'hsl(210, 100%, 40%)',
      text: 'hsl(210, 20%, 20%)'
    },
    green: {
      primary: 'hsl(120, 60%, 50%)',
      secondary: 'hsl(120, 60%, 95%)',
      accent: 'hsl(120, 60%, 40%)',
      text: 'hsl(120, 20%, 20%)'
    },
    purple: {
      primary: 'hsl(270, 70%, 50%)',
      secondary: 'hsl(270, 70%, 95%)',
      accent: 'hsl(270, 70%, 40%)',
      text: 'hsl(270, 20%, 20%)'
    },
    corporate: {
      primary: 'hsl(200, 20%, 30%)',
      secondary: 'hsl(200, 20%, 95%)',
      accent: 'hsl(200, 60%, 50%)',
      text: 'hsl(200, 20%, 10%)'
    }
  };

  const selectedColors = colorSchemes[config.colorScheme || 'blue'];

  return `CONFIGURACIÓN DE DISEÑO Y ESTILO:

ESQUEMA DE COLORES (${config.colorScheme || 'blue'}):
- Primary: ${selectedColors.primary}
- Secondary: ${selectedColors.secondary}
- Accent: ${selectedColors.accent}
- Text: ${selectedColors.text}

NIVEL DE DETALLE: ${config.detailLevel || 'detailed'}
${config.detailLevel === 'summary' ? '- Mostrar solo métricas principales y resumen' : ''}
${config.detailLevel === 'detailed' ? '- Incluir análisis detallado y desglose de datos' : ''}
${config.detailLevel === 'comprehensive' ? '- Incluir todo: análisis profundo, gráficos, comparaciones históricas' : ''}

GRÁFICOS: ${config.includeCharts ? 'SÍ - Usar Chart.js CDN' : 'NO - Solo métricas visuales con CSS'}
${config.includeCharts ? `
CONFIGURACIÓN DE GRÁFICOS:
- Incluir <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
- Crear gráficos de barras para tareas por día
- Gráfico de líneas para tendencias de productividad
- Gráfico circular para distribución de tiempo por proyecto
- Usar los colores del esquema seleccionado` : ''}

INSIGHTS: ${config.includeInsights ? 'SÍ - Generar insights inteligentes' : 'NO - Solo datos básicos'}
${config.includeInsights ? `
INSIGHTS REQUERIDOS:
- Análisis de patrones de trabajo
- Identificación de picos de productividad
- Recomendaciones personalizadas
- Predicciones para el próximo período
- Identificación de oportunidades de mejora` : ''}

ELEMENTOS DE DISEÑO OBLIGATORIOS:
- Usar CSS Grid o Flexbox para layouts responsive
- Cards con sombras sutiles para métricas
- Gradientes suaves usando los colores del esquema
- Tipografía clara con jerarquía visual
- Espaciado consistente y breathing room
- Hover effects sutiles donde sea apropiado
- Iconos Unicode para métricas (📊 📈 ⏰ ✅ 🎯)

EJEMPLO DE ESTRUCTURA CSS:
\`\`\`css
.metric-card {
  background: linear-gradient(135deg, ${selectedColors.secondary}, white);
  border-left: 4px solid ${selectedColors.primary};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px hsla(0, 0%, 0%, 0.1);
}

.header {
  background: linear-gradient(135deg, ${selectedColors.primary}, ${selectedColors.accent});
  color: white;
  padding: 30px;
  text-align: center;
}
\`\`\``;
}

/**
 * Prompt para generar insights inteligentes
 */
export function getInsightsPrompt(): string {
  return `
GENERACIÓN DE INSIGHTS INTELIGENTES:

Analiza los datos proporcionados y genera insights accionables en estas categorías:

1. **PATRONES DE PRODUCTIVIDAD**:
   - Horarios más productivos
   - Días de mejor rendimiento
   - Correlaciones entre tipo de tarea y eficiencia

2. **ANÁLISIS DE TENDENCIAS**:
   - Evolución de métricas clave
   - Identificación de mejoras o declives
   - Predicciones basadas en patrones

3. **OPORTUNIDADES DE OPTIMIZACIÓN**:
   - Tareas que toman más tiempo del estimado
   - Proyectos con baja eficiencia
   - Recomendaciones de priorización

4. **RECOMENDACIONES ACCIONABLES**:
   - Cambios específicos en workflow
   - Ajustes en planificación
   - Estrategias para mejorar productividad

FORMATO: Presenta cada insight con:
- 🎯 Título descriptivo
- 📊 Datos que lo respaldan
- 💡 Recomendación específica
- 🎲 Impacto esperado`;
}