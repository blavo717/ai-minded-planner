
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SavedFilter, FilterState } from '@/types/filters';

export const useSavedFilters = () => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSavedFilters = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedFilters(data || []);
    } catch (error) {
      console.error('Error fetching saved filters:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los filtros guardados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async (name: string, description: string, filterData: FilterState) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: user.id,
          name,
          description,
          filter_data: filterData,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedFilters(prev => [data, ...prev]);
      toast({
        title: "Filtro guardado",
        description: `El filtro "${name}" se ha guardado correctamente`,
      });

      return data;
    } catch (error) {
      console.error('Error saving filter:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el filtro",
        variant: "destructive",
      });
    }
  };

  const updateFilter = async (id: string, updates: Partial<Omit<SavedFilter, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSavedFilters(prev => prev.map(filter => 
        filter.id === id ? { ...filter, ...data } : filter
      ));

      toast({
        title: "Filtro actualizado",
        description: "El filtro se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating filter:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el filtro",
        variant: "destructive",
      });
    }
  };

  const deleteFilter = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedFilters(prev => prev.filter(filter => filter.id !== id));
      toast({
        title: "Filtro eliminado",
        description: "El filtro se ha eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el filtro",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSavedFilters();
  }, [user]);

  return {
    savedFilters,
    loading,
    saveFilter,
    updateFilter,
    deleteFilter,
    refetch: fetchSavedFilters,
  };
};
