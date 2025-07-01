
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  ArrowRight, 
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
import { useProfiles } from '@/hooks/useProfiles';

interface TaskAssignmentsProps {
  task: Task;
}

const TaskAssignments = ({ task }: TaskAssignmentsProps) => {
  const { taskAssignments } = useTaskAssignments();
  const { dependencies } = useTaskDependencies(task.id);
  const { profiles } = useProfiles();

  // Get assignments for this task
  const currentAssignments = taskAssignments.filter(
    assignment => assignment.task_id === task.id
  );

  const getProfileName = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.full_name || profile?.email || 'Usuario desconocido';
  };

  const getProfileInitials = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    const name = profile?.full_name || profile?.email || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'responsible':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contributor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reviewer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'observer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'responsible':
        return 'Responsable';
      case 'contributor':
        return 'Colaborador';
      case 'reviewer':
        return 'Revisor';
      case 'observer':
        return 'Observador';
      default:
        return 'Sin rol';
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignments Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Asignaciones ({currentAssignments.length})
            </CardTitle>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Asignar Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentAssignments.length > 0 ? (
            <div className="space-y-4">
              {currentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getProfileInitials(assignment.assigned_to)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">
                        {getProfileName(assignment.assigned_to)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Asignado el {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(assignment.role_in_task)}>
                      {getRoleLabel(assignment.role_in_task)}
                    </Badge>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">Sin asignaciones</p>
              <p className="text-sm">Esta tarea no está asignada a ningún usuario</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dependencies Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Dependencias ({dependencies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dependencies.length > 0 ? (
            <div className="space-y-4">
              {dependencies.map((dependency) => (
                <div key={dependency.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Esta tarea depende de:</span>
                  </div>
                  <div className="ml-6">
                    <p className="font-medium">Tarea relacionada</p>
                    <p className="text-sm text-gray-600">
                      ID: {dependency.depends_on_task_id}
                    </p>
                    {dependency.dependency_type && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {dependency.dependency_type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ArrowRight className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">Sin dependencias</p>
              <p className="text-sm">Esta tarea no tiene dependencias configuradas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentAssignments.filter(a => a.role_in_task === 'responsible').length}
            </div>
            <p className="text-sm text-gray-500">Responsables</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {currentAssignments.filter(a => a.role_in_task === 'contributor').length}
            </div>
            <p className="text-sm text-gray-500">Colaboradores</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {dependencies.length}
            </div>
            <p className="text-sm text-gray-500">Dependencias</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskAssignments;
