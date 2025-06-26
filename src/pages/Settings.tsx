
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from '@/hooks/useProfile';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import LLMConfigurationForm from '@/components/LLM/LLMConfigurationForm';
import LLMConfigurationList from '@/components/LLM/LLMConfigurationList';
import AIConfigurationPanel from '@/components/ai/AIConfigurationPanel';
import SimpleChatTest from '@/components/testing/SimpleChatTest';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
  is_active: z.boolean().default(false),
})

const Settings = () => {
  const { toast } = useToast()
  const { profile, isLoading: isProfileLoading, updateProfile } = useProfile();
  const { configurations, activeConfiguration } = useLLMConfigurations();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      is_active: profile?.is_active || false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProfile({
        name: values.name,
        email: values.email,
        is_active: values.is_active,
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
          <TabsTrigger value="llm">LLM</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
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
                    name="name"
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
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Cuenta Activa</FormLabel>
                          <FormDescription>
                            Habilita o deshabilita tu cuenta.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Actualizar Perfil</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuraciones LLM</CardTitle>
              <CardDescription>
                Gestiona tus configuraciones de Large Language Models (LLM)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LLMConfigurationForm />
              <LLMConfigurationList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIConfigurationPanel />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tests del Sistema</CardTitle>
              <CardDescription>
                Ejecuta tests para verificar el funcionamiento del asistente IA simplificado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChatTest />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
