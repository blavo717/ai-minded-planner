
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateExternalContactData } from './useExternalContacts';

export const useExternalContactMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createExternalContactMutation = useMutation({
    mutationFn: async (contactData: CreateExternalContactData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('external_contacts')
        .insert({
          ...contactData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external_contacts', user?.id] });
      toast({
        title: "Contacto creado",
        description: "El contacto externo se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear contacto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateExternalContactMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateExternalContactData>) => {
      const { data, error } = await supabase
        .from('external_contacts')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external_contacts', user?.id] });
      toast({
        title: "Contacto actualizado",
        description: "El contacto se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar contacto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteExternalContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('external_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external_contacts', user?.id] });
      toast({
        title: "Contacto eliminado",
        description: "El contacto se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar contacto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createExternalContact: createExternalContactMutation.mutate,
    updateExternalContact: updateExternalContactMutation.mutate,
    deleteExternalContact: deleteExternalContactMutation.mutate,
    isCreatingExternalContact: createExternalContactMutation.isPending,
    isUpdatingExternalContact: updateExternalContactMutation.isPending,
    isDeletingExternalContact: deleteExternalContactMutation.isPending,
  };
};
