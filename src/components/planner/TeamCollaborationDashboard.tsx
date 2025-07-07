import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  ArrowRight,
  Target,
  Zap
} from 'lucide-react';
import { useTeamCollaboration } from '@/hooks/useTeamCollaboration';

interface TeamCollaborationDashboardProps {
  onClose?: () => void;
}

const TeamCollaborationDashboard: React.FC<TeamCollaborationDashboardProps> = ({ onClose }) => {
  const {
    teamWorkload,
    isLoadingWorkload,
    generateRedistributionSuggestions,
    isGeneratingSuggestions,
    teamMetrics,
    hasTeamMembers
  } = useTeamCollaboration();

  const [redistributionSuggestions, setRedistributionSuggestions] = useState([]);

  const handleGenerateSuggestions = () => {
    generateRedistributionSuggestions();
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'low': return 'bg-green-500';
      case 'normal': return 'bg-blue-500';
      case 'high': return 'bg-yellow-500';
      case 'overloaded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available': return <Badge className="bg-green-100 text-green-700">Disponible</Badge>;
      case 'busy': return <Badge className="bg-yellow-100 text-yellow-700">Ocupado</Badge>;
      case 'unavailable': return <Badge variant="destructive">No disponible</Badge>;
      default: return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  if (!hasTeamMembers) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No hay equipo detectado</h3>
            <p className="text-gray-600 mb-4">
              Para usar las funciones de colaboración, necesitas tener proyectos compartidos con otros usuarios.
            </p>
            <p className="text-sm text-gray-500">
              Asigna tareas a otros miembros del equipo o comparte proyectos para comenzar a colaborar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Colaboración en Equipo
          </h2>
          <p className="text-gray-600">
            Gestiona la carga de trabajo y optimiza la colaboración del equipo
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGenerateSuggestions}
            disabled={isGeneratingSuggestions}
          >
            <TrendingUp className={`w-4 h-4 mr-2 ${isGeneratingSuggestions ? 'animate-spin' : ''}`} />
            {isGeneratingSuggestions ? 'Analizando...' : 'Generar Sugerencias'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              Cerrar
            </Button>
          )}
        </div>
      </div>

      {/* Métricas del equipo */}
      {teamMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{teamMetrics.total_team_members}</div>
                  <div className="text-sm text-gray-600">Miembros del equipo</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{teamMetrics.average_completion_rate}%</div>
                  <div className="text-sm text-gray-600">Tasa de completación</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{teamMetrics.collaboration_score}</div>
                  <div className="text-sm text-gray-600">Score colaboración</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  teamMetrics.workload_distribution === 'balanced' ? 'bg-green-100' :
                  teamMetrics.workload_distribution === 'unbalanced' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <BarChart3 className={`w-5 h-5 ${
                    teamMetrics.workload_distribution === 'balanced' ? 'text-green-600' :
                    teamMetrics.workload_distribution === 'unbalanced' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{teamMetrics.total_active_tasks}</div>
                  <div className="text-sm text-gray-600">Tareas activas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado de distribución de carga */}
      {teamMetrics?.workload_distribution !== 'balanced' && (
        <Alert variant={teamMetrics.workload_distribution === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Distribución de carga desbalanceada:</strong> 
            {teamMetrics.workload_distribution === 'critical' 
              ? ' Se requiere redistribución inmediata de tareas para evitar sobrecarga del equipo.'
              : ' Considera redistribuir algunas tareas para optimizar la productividad del equipo.'
            }
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="workload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workload">Carga de Trabajo</TabsTrigger>
          <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
        </TabsList>

        <TabsContent value="workload" className="space-y-4">
          <div className="grid gap-4">
            {teamWorkload.map((member) => (
              <Card key={member.user_id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{member.user_name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          {getAvailabilityBadge(member.availability)}
                          <Badge 
                            className={`${getLoadColor(member.current_load)} text-white`}
                          >
                            Carga: {member.current_load}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">{member.active_tasks}</div>
                      <div className="text-sm text-gray-600">tareas activas</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-semibold">{member.total_estimated_hours}h</div>
                      <div className="text-sm text-gray-600">Horas estimadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-red-600">{member.overdue_tasks}</div>
                      <div className="text-sm text-gray-600">Tareas vencidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-600">{member.completion_rate}%</div>
                      <div className="text-sm text-gray-600">Tasa completación</div>
                    </div>
                    <div className="text-center">
                      <Progress 
                        value={Math.min(100, (member.total_estimated_hours / 40) * 100)} 
                        className="h-2 mt-2"
                      />
                      <div className="text-sm text-gray-600 mt-1">Capacidad semanal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="text-center py-8">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">Sugerencias de Redistribución</h3>
            <p className="text-gray-600 mb-4">
              Genera sugerencias inteligentes para optimizar la distribución de tareas del equipo.
            </p>
            <Button onClick={handleGenerateSuggestions} disabled={isGeneratingSuggestions}>
              <TrendingUp className="w-4 h-4 mr-2" />
              {isGeneratingSuggestions ? 'Generando sugerencias...' : 'Generar Sugerencias'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamCollaborationDashboard;