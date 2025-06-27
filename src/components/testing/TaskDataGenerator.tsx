
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjectMutations } from '@/hooks/useProjectMutations';
import { toast } from '@/hooks/use-toast';

const TaskDataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const { createTask } = useTaskMutations();
  const { createProject } = useProjectMutations();

  const sampleProjects = [
    { name: 'Desarrollo Web', description: 'Proyecto de desarrollo de aplicación web', color: '#3B82F6' },
    { name: 'Marketing Digital', description: 'Campaña de marketing online', color: '#10B981' },
    { name: 'Recursos Humanos', description: 'Gestión de personal y procesos', color: '#F59E0B' },
    { name: 'Investigación', description: 'Proyecto de investigación y desarrollo', color: '#8B5CF6' }
  ];

  const sampleMainTasks = [
    {
      title: 'Desarrollar nueva funcionalidad de autenticación',
      description: 'Implementar sistema completo de autenticación con OAuth y 2FA',
      priority: 'high' as const,
      status: 'in_progress' as const,
      project: 0,
      estimated_duration: 480,
      tags: ['desarrollo', 'seguridad', 'backend'],
      subtasks: [
        {
          title: 'Configurar OAuth providers',
          description: 'Setup de Google, GitHub y Microsoft OAuth',
          priority: 'high' as const,
          status: 'completed' as const,
          estimated_duration: 120,
          microtasks: [
            { title: 'Configurar Google OAuth', priority: 'medium' as const, status: 'completed' as const },
            { title: 'Configurar GitHub OAuth', priority: 'medium' as const, status: 'completed' as const },
            { title: 'Configurar Microsoft OAuth', priority: 'low' as const, status: 'in_progress' as const }
          ]
        },
        {
          title: 'Implementar 2FA',
          description: 'Sistema de autenticación de dos factores',
          priority: 'high' as const,
          status: 'in_progress' as const,
          estimated_duration: 180,
          microtasks: [
            { title: 'Investigar librerías 2FA', priority: 'high' as const, status: 'completed' as const },
            { title: 'Implementar TOTP', priority: 'high' as const, status: 'in_progress' as const },
            { title: 'Testear integración', priority: 'medium' as const, status: 'pending' as const }
          ]
        }
      ]
    },
    {
      title: 'Campaña de lanzamiento producto',
      description: 'Estrategia completa de marketing para nuevo producto',
      priority: 'urgent' as const,
      status: 'pending' as const,
      project: 1,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_duration: 320,
      tags: ['marketing', 'campaña', 'urgente'],
      subtasks: [
        {
          title: 'Crear contenido visual',
          description: 'Diseños para redes sociales y web',
          priority: 'high' as const,
          status: 'pending' as const,
          estimated_duration: 160,
          microtasks: [
            { title: 'Diseñar posts Instagram', priority: 'high' as const, status: 'pending' as const },
            { title: 'Crear banners web', priority: 'medium' as const, status: 'pending' as const },
            { title: 'Video promocional', priority: 'high' as const, status: 'pending' as const }
          ]
        },
        {
          title: 'Configurar campañas publicitarias',
          description: 'Setup de Google Ads y Facebook Ads',
          priority: 'urgent' as const,
          status: 'pending' as const,
          estimated_duration: 90,
          microtasks: [
            { title: 'Keyword research', priority: 'high' as const, status: 'pending' as const },
            { title: 'Crear campañas Google Ads', priority: 'urgent' as const, status: 'pending' as const },
            { title: 'Setup Facebook Ads', priority: 'high' as const, status: 'pending' as const }
          ]
        }
      ]
    },
    {
      title: 'Proceso de onboarding empleados',
      description: 'Mejorar el proceso de incorporación de nuevos empleados',
      priority: 'medium' as const,
      status: 'pending' as const,
      project: 2,
      estimated_duration: 240,
      tags: ['rrhh', 'proceso', 'onboarding'],
      subtasks: [
        {
          title: 'Documentar procedimientos',
          description: 'Crear guías y manuales de onboarding',
          priority: 'medium' as const,
          status: 'pending' as const,
          estimated_duration: 120,
          microtasks: [
            { title: 'Manual de bienvenida', priority: 'medium' as const, status: 'pending' as const },
            { title: 'Checklist primer día', priority: 'high' as const, status: 'pending' as const },
            { title: 'Guía herramientas', priority: 'low' as const, status: 'pending' as const }
          ]
        }
      ]
    },
    {
      title: 'Optimización base de datos',
      description: 'Mejorar rendimiento y escalabilidad de la BD',
      priority: 'high' as const,
      status: 'completed' as const,
      project: 0,
      completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_duration: 360,
      tags: ['database', 'performance', 'backend'],
      subtasks: [
        {
          title: 'Análisis de queries lentas',
          description: 'Identificar y optimizar consultas problemáticas',
          priority: 'high' as const,
          status: 'completed' as const,
          estimated_duration: 180,
          microtasks: [
            { title: 'Instalar monitoring', priority: 'high' as const, status: 'completed' as const },
            { title: 'Analizar logs', priority: 'medium' as const, status: 'completed' as const },
            { title: 'Crear índices', priority: 'high' as const, status: 'completed' as const }
          ]
        }
      ]
    },
    {
      title: 'Investigación nuevas tecnologías',
      description: 'Evaluar tecnologías emergentes para próximos proyectos',
      priority: 'low' as const,
      status: 'in_progress' as const,
      project: 3,
      estimated_duration: 200,
      tags: ['investigación', 'tecnología', 'innovación'],
      subtasks: [
        {
          title: 'Evaluación frameworks frontend',
          description: 'Comparar React, Vue, Svelte para próximos proyectos',
          priority: 'medium' as const,
          status: 'in_progress' as const,
          estimated_duration: 100,
          microtasks: [
            { title: 'Crear POC con Vue', priority: 'medium' as const, status: 'completed' as const },
            { title: 'Crear POC con Svelte', priority: 'medium' as const, status: 'in_progress' as const },
            { title: 'Documentar comparación', priority: 'low' as const, status: 'pending' as const }
          ]
        }
      ]
    },
    {
      title: 'Refactoring código legacy',
      description: 'Modernizar y limpiar código antiguo del sistema',
      priority: 'medium' as const,
      status: 'cancelled' as const,
      project: 0,
      estimated_duration: 480,
      tags: ['refactoring', 'legacy', 'mantenimiento'],
      subtasks: [
        {
          title: 'Migrar a TypeScript',
          description: 'Convertir archivos JavaScript a TypeScript',
          priority: 'medium' as const,
          status: 'cancelled' as const,
          estimated_duration: 240,
          microtasks: [
            { title: 'Setup TypeScript config', priority: 'high' as const, status: 'completed' as const },
            { title: 'Migrar componentes core', priority: 'medium' as const, status: 'cancelled' as const }
          ]
        }
      ]
    },
    {
      title: 'Implementar sistema de notificaciones',
      description: 'Sistema completo de notificaciones push y email',
      priority: 'high' as const,
      status: 'pending' as const,
      project: 0,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_duration: 400,
      tags: ['notificaciones', 'push', 'email'],
      needs_followup: true,
      subtasks: [
        {
          title: 'Configurar servicio push',
          description: 'Setup de Firebase Cloud Messaging',
          priority: 'high' as const,
          status: 'pending' as const,
          estimated_duration: 120,
          microtasks: [
            { title: 'Configurar Firebase', priority: 'high' as const, status: 'pending' as const },
            { title: 'Implementar service worker', priority: 'medium' as const, status: 'pending' as const }
          ]
        },
        {
          title: 'Sistema de templates email',
          description: 'Crear templates responsive para emails',
          priority: 'medium' as const,
          status: 'pending' as const,
          estimated_duration: 160,
          microtasks: [
            { title: 'Diseñar templates base', priority: 'medium' as const, status: 'pending' as const },
            { title: 'Implementar variables dinámicas', priority: 'low' as const, status: 'pending' as const }
          ]
        }
      ]
    },
    {
      title: 'Auditoría de seguridad',
      description: 'Revisión completa de seguridad del sistema',
      priority: 'urgent' as const,
      status: 'in_progress' as const,
      project: 0,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_duration: 320,
      tags: ['seguridad', 'auditoría', 'crítico'],
      last_communication_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      communication_type: 'email' as const,
      subtasks: [
        {
          title: 'Scan de vulnerabilidades',
          description: 'Escaneo automatizado de seguridad',
          priority: 'urgent' as const,
          status: 'completed' as const,
          estimated_duration: 60,
          microtasks: [
            { title: 'Configurar herramientas scan', priority: 'urgent' as const, status: 'completed' as const },
            { title: 'Ejecutar scans', priority: 'urgent' as const, status: 'completed' as const },
            { title: 'Generar reporte', priority: 'high' as const, status: 'completed' as const }
          ]
        },
        {
          title: 'Revisión manual código',
          description: 'Code review enfocado en seguridad',
          priority: 'high' as const,
          status: 'in_progress' as const,
          estimated_duration: 180,
          microtasks: [
            { title: 'Revisar autenticación', priority: 'urgent' as const, status: 'completed' as const },
            { title: 'Revisar autorización', priority: 'high' as const, status: 'in_progress' as const },
            { title: 'Revisar input validation', priority: 'high' as const, status: 'pending' as const }
          ]
        }
      ]
    },
    {
      title: 'Migración a microservicios',
      description: 'Separar monolito en microservicios especializados',
      priority: 'low' as const,
      status: 'pending' as const,
      project: 0,
      estimated_duration: 960,
      tags: ['arquitectura', 'microservicios', 'migración'],
      subtasks: [
        {
          title: 'Diseño arquitectura',
          description: 'Definir estructura y comunicación entre servicios',
          priority: 'high' as const,
          status: 'pending' as const,
          estimated_duration: 200,
          microtasks: [
            { title: 'Mapear dominios', priority: 'high' as const, status: 'pending' as const },
            { title: 'Definir APIs', priority: 'medium' as const, status: 'pending' as const },
            { title: 'Plan de migración', priority: 'high' as const, status: 'pending' as const }
          ]
        },
        {
          title: 'Implementar servicio usuarios',
          description: 'Primer microservicio: gestión de usuarios',
          priority: 'medium' as const,
          status: 'pending' as const,
          estimated_duration: 240,
          microtasks: [
            { title: 'Setup proyecto base', priority: 'high' as const, status: 'pending' as const },
            { title: 'Migrar lógica usuarios', priority: 'medium' as const, status: 'pending' as const },
            { title: 'Tests integración', priority: 'medium' as const, status: 'pending' as const }
          ]
        }
      ]
    },
    {
      title: 'Análisis competencia mercado',
      description: 'Studio exhaustivo de competidores y oportunidades',
      priority: 'medium' as const,
      status: 'pending' as const,
      project: 1,
      estimated_duration: 280,
      tags: ['análisis', 'competencia', 'mercado'],
      subtasks: [
        {
          title: 'Identificar competidores directos',
          description: 'Mapear landscape competitivo actual',
          priority: 'high' as const,
          status: 'pending' as const,
          estimated_duration: 120,
          microtasks: [
            { title: 'Lista competidores principales', priority: 'high' as const, status: 'pending' as const },
            { title: 'Análisis features', priority: 'medium' as const, status: 'pending' as const },
            { title: 'Análisis pricing', priority: 'medium' as const, status: 'pending' as const }
          ]
        },
        {
          title: 'Análisis SWOT',
          description: 'Fortalezas, debilidades, oportunidades y amenazas',
          priority: 'medium' as const,
          status: 'pending' as const,
          estimated_duration: 90,
          microtasks: [
            { title: 'Identificar fortalezas', priority: 'medium' as const, status: 'pending' as const },
            { title: 'Mapear oportunidades', priority: 'high' as const, status: 'pending' as const }
          ]
        }
      ]
    }
  ];

  const generateTestData = async () => {
    setIsGenerating(true);
    setGenerationStatus('generating');

    try {
      // Crear proyectos primero
      const createdProjects: string[] = [];
      
      for (const project of sampleProjects) {
        try {
          const result = await new Promise<any>((resolve, reject) => {
            createProject({
              name: project.name,
              description: project.description,
              color: project.color
            }, {
              onSuccess: resolve,
              onError: reject
            });
          });
          createdProjects.push(result.id);
        } catch (error) {
          console.error('Error creating project:', error);
        }
      }

      // Crear tareas principales con sus jerarquías
      for (const mainTask of sampleMainTasks) {
        try {
          // Crear tarea principal
          const mainTaskResult = await new Promise<any>((resolve, reject) => {
            createTask({
              title: mainTask.title,
              description: mainTask.description,
              priority: mainTask.priority,
              status: mainTask.status,
              project_id: createdProjects[mainTask.project] || undefined,
              due_date: mainTask.due_date,
              estimated_duration: mainTask.estimated_duration,
              tags: mainTask.tags,
              completed_at: mainTask.completed_at,
              needs_followup: mainTask.needs_followup,
              last_communication_at: mainTask.last_communication_at,
              communication_type: mainTask.communication_type,
              task_level: 1
            }, {
              onSuccess: resolve,
              onError: reject
            });
          });

          // Crear subtareas
          for (const subtask of mainTask.subtasks) {
            try {
              const subtaskResult = await new Promise<any>((resolve, reject) => {
                createTask({
                  title: subtask.title,
                  description: subtask.description,
                  priority: subtask.priority,
                  status: subtask.status,
                  parent_task_id: mainTaskResult.id,
                  estimated_duration: subtask.estimated_duration,
                  task_level: 2
                }, {
                  onSuccess: resolve,
                  onError: reject
                });
              });

              // Crear microtareas
              if (subtask.microtasks) {
                for (const microtask of subtask.microtasks) {
                  try {
                    await new Promise<any>((resolve, reject) => {
                      createTask({
                        title: microtask.title,
                        priority: microtask.priority,
                        status: microtask.status,
                        parent_task_id: subtaskResult.id,
                        task_level: 3
                      }, {
                        onSuccess: resolve,
                        onError: reject
                      });
                    });
                  } catch (error) {
                    console.error('Error creating microtask:', error);
                  }
                }
              }
            } catch (error) {
              console.error('Error creating subtask:', error);
            }
          }
        } catch (error) {
          console.error('Error creating main task:', error);
        }
      }

      setGenerationStatus('success');
      toast({
        title: "Datos de prueba generados",
        description: "Se han creado 10 tareas principales con subtareas y microtareas",
      });
    } catch (error) {
      console.error('Error generating test data:', error);
      setGenerationStatus('error');
      toast({
        title: "Error generando datos",
        description: "Hubo un problema al crear los datos de prueba",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Generador de Datos de Prueba - Tareas Jerárquicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">¿Qué se va a generar?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium">📁 4 Proyectos:</h4>
              <ul className="ml-4 space-y-1">
                <li>• Desarrollo Web</li>
                <li>• Marketing Digital</li>
                <li>• Recursos Humanos</li>
                <li>• Investigación</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">📋 10 Tareas Principales:</h4>
              <ul className="ml-4 space-y-1">
                <li>• Con diferentes prioridades</li>
                <li>• Estados variados</li>
                <li>• Fechas de vencimiento</li>
                <li>• Tags y categorías</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">📄 15+ Subtareas:</h4>
              <ul className="ml-4 space-y-1">
                <li>• Vinculadas a tareas principales</li>
                <li>• Diferentes estados</li>
                <li>• Estimaciones de tiempo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">🔸 40+ Microtareas:</h4>
              <ul className="ml-4 space-y-1">
                <li>• Nivel 3 de jerarquía</li>
                <li>• Estados de progreso</li>
                <li>• Casos de uso reales</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={
            generationStatus === 'success' ? 'default' :
            generationStatus === 'error' ? 'destructive' :
            generationStatus === 'generating' ? 'secondary' : 'outline'
          } className="flex items-center gap-2">
            {generationStatus === 'success' && <CheckCircle className="h-3 w-3" />}
            {generationStatus === 'error' && <AlertCircle className="h-3 w-3" />}
            {generationStatus === 'generating' && <Loader2 className="h-3 w-3 animate-spin" />}
            {generationStatus === 'idle' && 'Listo para generar'}
            {generationStatus === 'generating' && 'Generando datos...'}
            {generationStatus === 'success' && 'Datos generados exitosamente'}
            {generationStatus === 'error' && 'Error en la generación'}
          </Badge>

          <Button 
            onClick={generateTestData}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Generar Datos de Prueba
              </>
            )}
          </Button>
        </div>

        {generationStatus === 'success' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">✅ Datos generados exitosamente</h3>
            <p className="text-green-800 text-sm">
              Puedes ver las tareas generadas en la vista Kanban o en la lista de tareas. 
              Cada tarea principal contiene subtareas y microtareas para probar toda la funcionalidad jerárquica.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskDataGenerator;
