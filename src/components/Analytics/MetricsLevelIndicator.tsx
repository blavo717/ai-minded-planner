
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  BarChart3, 
  TrendingUp, 
  Zap,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';

const MetricsLevelIndicator = () => {
  const { data: stats } = useGeneralStats();

  const calculateMetricsLevel = () => {
    if (!stats?.hasAnyData) return { level: 0, name: 'Sin datos', progress: 0 };

    let score = 0;
    let maxScore = 0;

    // Puntuación por proyectos
    maxScore += 20;
    if (stats.totalProjects > 0) score += 10;
    if (stats.totalProjects >= 3) score += 5;
    if (stats.completedProjects > 0) score += 5;

    // Puntuación por tareas
    maxScore += 30;
    if (stats.totalTasks > 0) score += 10;
    if (stats.totalTasks >= 10) score += 10;
    if (stats.completedTasks >= 5) score += 10;

    // Puntuación por sesiones
    maxScore += 25;
    if (stats.totalSessions > 0) score += 10;
    if (stats.totalSessions >= 5) score += 10;
    if (stats.totalWorkHours >= 10) score += 5;

    // Puntuación por diversidad de datos
    maxScore += 25;
    if (stats.totalProjects > 0 && stats.totalTasks > 0) score += 10;
    if (stats.totalSessions > 0 && stats.completedTasks > 0) score += 10;
    if (stats.totalWorkHours > 0) score += 5;

    const progress = (score / maxScore) * 100;

    if (progress >= 80) return { level: 3, name: 'Avanzado', progress };
    if (progress >= 50) return { level: 2, name: 'Intermedio', progress };
    if (progress >= 20) return { level: 1, name: 'Básico', progress };
    return { level: 0, name: 'Inicial', progress };
  };

  const { level, name, progress } = calculateMetricsLevel();

  const levels = [
    {
      level: 0,
      name: 'Inicial',
      icon: Database,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      description: 'Datos básicos del sistema',
      requirements: ['Crear proyectos', 'Agregar tareas', 'Registrar trabajo']
    },
    {
      level: 1,
      name: 'Básico',
      icon: BarChart3,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      description: 'Métricas fundamentales disponibles',
      requirements: ['10+ tareas', '3+ proyectos', '5+ sesiones']
    },
    {
      level: 2,
      name: 'Intermedio',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      description: 'Análisis de tendencias y patrones',
      requirements: ['Historial consistente', 'Datos variados', 'Uso regular']
    },
    {
      level: 3,
      name: 'Avanzado',
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      description: 'Insights predictivos y recomendaciones IA',
      requirements: ['Datos completos', 'Uso avanzado', 'Histórico extenso']
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Nivel de Métricas Disponibles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nivel actual */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge variant={level >= 2 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              Nivel {level}: {name}
            </Badge>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">{progress.toFixed(0)}% completado</p>
        </div>

        {/* Descripción del nivel actual */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {levels[level]?.description}
          </p>
        </div>

        {/* Grid de niveles */}
        <div className="grid grid-cols-2 gap-3">
          {levels.map((levelInfo, index) => {
            const Icon = levelInfo.icon;
            const isUnlocked = level >= index;
            const isCurrent = level === index;

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? 'border-primary bg-primary/5'
                    : isUnlocked
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isUnlocked ? (
                    <Icon className={`h-4 w-4 ${levelInfo.color}`} />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    isUnlocked ? levelInfo.color : 'text-gray-400'
                  }`}>
                    {levelInfo.name}
                  </span>
                  {isUnlocked && <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />}
                </div>
                <div className="text-xs text-muted-foreground">
                  {levelInfo.requirements.slice(0, 2).map((req, i) => (
                    <div key={i}>• {req}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Próximos pasos */}
        {level < 3 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-blue-800">
              Para desbloquear el siguiente nivel:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {levels[level + 1]?.requirements.map((req, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsLevelIndicator;
