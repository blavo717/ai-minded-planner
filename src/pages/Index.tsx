
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">AI Planner</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user?.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a tu AI Planner!
          </h2>
          <p className="text-lg text-gray-600">
            Tu asistente inteligente para la productividad está listo para ayudarte.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <span>IA Personalizada</span>
              </CardTitle>
              <CardDescription>
                La IA aprenderá de tus patrones y hábitos para ofrecerte sugerencias cada vez más precisas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-500" />
                <span>Perfil Configurado</span>
              </CardTitle>
              <CardDescription>
                Tu perfil está listo. Pronto podrás personalizar tus preferencias y configuraciones.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LogOut className="h-5 w-5 text-purple-500" />
                <span>Próximas Funciones</span>
              </CardTitle>
              <CardDescription>
                Gestión de tareas, proyectos, contactos y mucho más está en desarrollo.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tu Planner Inteligente está Listo
              </h3>
              <p className="text-gray-600">
                Has iniciado sesión exitosamente. Las próximas funciones incluirán gestión de tareas, 
                análisis de patrones, recordatorios inteligentes y mucho más.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
