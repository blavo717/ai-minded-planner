
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from '@/hooks/useProfile';
import { useLLMConfigurations, LLMConfiguration } from '@/hooks/useLLMConfigurations';
import LLMConfigurationForm from '@/components/LLM/LLMConfigurationForm';
import LLMConfigurationList from '@/components/LLM/LLMConfigurationList';
import AIConfigurationPanel from '@/components/ai/AIConfigurationPanel';
import SystemHealth from '@/pages/SystemHealth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Key } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
})

const Settings = () => {
  const { toast } = useToast()
  const { profile, isLoading: isProfileLoading, updateProfile } = useProfile();
  const { 
    configurations, 
    activeConfiguration,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    testConnection,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting
  } = useLLMConfigurations();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      email: profile?.email || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProfile({
        full_name: values.full_name,
        email: values.email,
      });
      toast({
        title: "Perfil actualizado.",
        description: "Tus cambios han sido guardados exitosamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Algo salió mal.",
        description: "Hubo un problema al guardar tus cambios. Intenta nuevamente.",
      })
    }
  }

  const handleLLMSubmit = (data: any) => {
    createConfiguration(data);
  };

  const handleLLMEdit = (config: any) => {
    // For simplicity, we'll just log this for now
    console.log('Edit config:', config);
  };

  const handleToggleActive = (configId: string, isActive: boolean) => {
    updateConfiguration({ id: configId, is_active: isActive });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tus preferencias y configuraciones del sistema
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
          <TabsTrigger value="system-health">Salud del Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal y preferencias de la cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este es el nombre que se mostrará en tu perfil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Esta es tu dirección de correo electrónico.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Actualizar Perfil</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia" className="space-y-6">
          {/* API Key Alert */}
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              Para usar las funciones de IA, necesitas configurar tu API Key de OpenRouter.
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:underline"
              >
                Obtener API Key →
              </a>
            </AlertDescription>
          </Alert>

          {/* Current Active Configuration */}
          {activeConfiguration && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Configuración Activa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activeConfiguration.model_name}</p>
                    <p className="text-sm text-green-600">
                      Temperatura: {activeConfiguration.temperature} | 
                      Max Tokens: {activeConfiguration.max_tokens}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Configuraciones de IA</CardTitle>
              <CardDescription>
                Gestiona tus configuraciones de modelos de lenguaje (LLM)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LLMConfigurationForm
                onSubmit={handleLLMSubmit}
                onCancel={() => console.log('Cancelled')}
                isLoading={isCreating}
              />
              <LLMConfigurationList
                configurations={configurations}
                onEdit={handleLLMEdit}
                onDelete={deleteConfiguration}
                onTestConnection={testConnection}
                onToggleActive={handleToggleActive}
                isDeleting={isDeleting}
                isTesting={isTesting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AIConfigurationPanel />
        </TabsContent>

        <TabsContent value="system-health" className="space-y-6">
          <SystemHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
