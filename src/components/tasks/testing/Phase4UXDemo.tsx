
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Navigation, 
  Smartphone, 
  Monitor, 
  Eye,
  Zap,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Settings,
  MousePointer,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Phase4UXDemo = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [demoResults, setDemoResults] = useState<Record<string, any>>({});

  const uxDemos = [
    {
      id: 'visual-improvements',
      title: 'Mejoras Visuales',
      description: 'Demostración de consistencia visual mejorada',
      icon: Palette,
      color: 'purple',
      improvements: [
        'Botones con estilos uniformes y estados hover/focus',
        'Paleta de colores coherente en toda la aplicación',
        'Tipografía jerarquizada y legible',
        'Espaciado consistente entre elementos',
        'Iconografía unificada con lucide-react'
      ]
    },
    {
      id: 'navigation-enhancements',
      title: 'Navegación Optimizada',
      description: 'Flujos de navegación más intuitivos',
      icon: Navigation,
      color: 'blue',
      improvements: [
        'Breadcrumbs contextuales en cada sección',
        'Menú lateral con estados activos claros',
        'Transiciones suaves entre páginas',
        'Accesos rápidos a funciones principales',
        'Navegación por teclado mejorada'
      ]
    },
    {
      id: 'responsive-showcase',
      title: 'Diseño Responsivo',
      description: 'Adaptación perfecta a todos los dispositivos',
      icon: Smartphone,
      color: 'green',
      improvements: [
        'Layout adaptativo para mobile, tablet y desktop',
        'Componentes que se reorganizan inteligentemente',
        'Texto siempre legible en cualquier pantalla',
        'Botones y controles accesibles al tacto',
        'Menús y modales optimizados por dispositivo'
      ]
    },
    {
      id: 'feedback-system',
      title: 'Sistema de Feedback',
      description: 'Comunicación clara con el usuario',
      icon: Eye,
      color: 'orange',
      improvements: [
        'Toasts informativos con iconos contextualmente',
        'Estados de carga con progress indicators',
        'Mensajes de error descriptivos y accionables',
        'Confirmaciones de acciones importantes',
        'Feedback inmediato en formularios'
      ]
    },
    {
      id: 'performance-ux',
      title: 'Rendimiento UX',
      description: 'Optimizaciones para mejor experiencia',
      icon: Zap,
      color: 'yellow',
      improvements: [
        'Lazy loading de componentes pesados',
        'Optimización de re-renders con React.memo',
        'Debounce en búsquedas y filtros',
        'Transiciones CSS optimizadas',
        'Bundle splitting para carga rápida'
      ]
    },
    {
      id: 'accessibility-features',
      title: 'Accesibilidad Mejorada',
      description: 'Aplicación accesible para todos',
      icon: MousePointer,
      color: 'indigo',
      improvements: [
        'Contraste WCAG AA en todos los elementos',
        'Navegación completa por teclado',
        'Etiquetas ARIA en componentes interactivos',
        'Focus visible y lógico',
        'Texto alternativo en elementos visuales'
      ]
    }
  ];

  const runDemo = async (demoId: string) => {
    setActiveDemo(demoId);
    const demo = uxDemos.find(d => d.id === demoId);
    
    if (!demo) return;
    
    console.log(`=== DEMO: ${demo.title} ===`);
    
    // Simular proceso de demostración
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDemoResults(prev => ({
      ...prev,
      [demoId]: {
        success: true,
        timestamp: new Date().toISOString(),
        improvements: demo.improvements
      }
    }));
    
    toast({
      title: `Demo: ${demo.title}`,
      description: `Se han implementado ${demo.improvements.length} mejoras de UX`,
    });
    
    setActiveDemo(null);
    console.log(`✓ Demo ${demo.title} completada`);
  };

  const runAllDemos = async () => {
    console.log('=== EJECUTANDO TODAS LAS DEMOS DE UX ===');
    
    for (const demo of uxDemos) {
      await runDemo(demo.id);
      // Pausa entre demos
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    toast({
      title: "Todas las Demos Completadas",
      description: "Se han demostrado todas las mejoras de UX",
    });
    
    console.log('=== TODAS LAS DEMOS COMPLETADAS ===');
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'border-purple-200 bg-purple-50',
      blue: 'border-blue-200 bg-blue-50',
      green: 'border-green-200 bg-green-50',
      orange: 'border-orange-200 bg-orange-50',
      yellow: 'border-yellow-200 bg-yellow-50',
      indigo: 'border-indigo-200 bg-indigo-50'
    };
    return colors[color] || 'border-gray-200 bg-gray-50';
  };

  const completedDemos = Object.keys(demoResults).length;
  const totalDemos = uxDemos.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-indigo-600" />
          Demo: Refinamiento UX
        </CardTitle>
        <CardDescription>
          Demostración interactiva de mejoras en experiencia de usuario
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controles principales */}
        <div className="flex gap-3">
          <Button 
            onClick={runAllDemos} 
            disabled={activeDemo !== null}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${activeDemo ? 'animate-spin' : ''}`} />
            {activeDemo ? 'Ejecutando Demo...' : 'Ejecutar Todas las Demos'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setDemoResults({})}
            disabled={activeDemo !== null}
          >
            Reset Demos
          </Button>
        </div>

        {/* Estado general */}
        {completedDemos > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">
                Progreso de Demos: {completedDemos}/{totalDemos}
              </div>
              <div className="text-sm">
                {completedDemos === totalDemos ? 
                  '🎉 ¡Todas las demos de UX completadas!' : 
                  `${totalDemos - completedDemos} demos pendientes`
                }
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs de demos */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="demos">Demos Individuales</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uxDemos.map((demo) => {
                const IconComponent = demo.icon;
                const result = demoResults[demo.id];
                const isActive = activeDemo === demo.id;
                
                return (
                  <Card 
                    key={demo.id} 
                    className={`${getColorClasses(demo.color)} border-2 transition-all hover:shadow-md`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {demo.title}
                        {result && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {isActive && <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {demo.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => runDemo(demo.id)}
                        disabled={activeDemo !== null}
                        className="w-full"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Ejecutar Demo
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="demos" className="space-y-4">
            {uxDemos.map((demo) => {
              const IconComponent = demo.icon;
              const result = demoResults[demo.id];
              const isActive = activeDemo === demo.id;
              
              return (
                <Card key={demo.id} className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {demo.title}
                      {result && <Badge variant="secondary">Completada</Badge>}
                      {isActive && <Badge variant="outline">Ejecutando...</Badge>}
                    </CardTitle>
                    <CardDescription>{demo.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Mejoras Implementadas:</h4>
                      <div className="space-y-1">
                        {demo.improvements.map((improvement, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span>{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => runDemo(demo.id)}
                      disabled={activeDemo !== null}
                      className="flex items-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      {isActive ? 'Ejecutando...' : 'Ejecutar Demo'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {completedDemos === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay resultados disponibles. Ejecuta algunas demos primero.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{completedDemos}</div>
                    <div className="text-sm text-muted-foreground">Demos Completadas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(demoResults).reduce((acc: number, result: any) => 
                        acc + (result.improvements?.length || 0), 0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Mejoras Demostradas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((completedDemos / totalDemos) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Progreso UX</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Historial de Demos:</h4>
                  {Object.entries(demoResults).map(([demoId, result]: [string, any]) => {
                    const demo = uxDemos.find(d => d.id === demoId);
                    if (!demo) return null;
                    
                    return (
                      <div key={demoId} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-sm">{demo.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.improvements?.length || 0} mejoras demostradas
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Phase4UXDemo;
