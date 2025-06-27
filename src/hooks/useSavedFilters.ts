
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
      
      // Convert the data from Supabase to our SavedFilter type
      const convertedData: SavedFilter[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        filter_data: item.filter_data as FilterState,
        is_default: item.is_default,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      setSavedFilters(convertedData);
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
        .insert([{
          user_id: user.id,
          name,
          description,
          filter_data: filterData as any, // Cast to any to handle Json type
        }])
        .select()
        .single();

      if (error) throw error;

      // Convert the returned data to our SavedFilter type
      const convertedData: SavedFilter = {
        id: data.id,
        name: data.name,
        description: data.description,
        filter_data: data.filter_data as FilterState,
        is_default: data.is_default,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setSavedFilters(prev => [convertedData, ...prev]);
      toast({
        title: "Filtro guardado",
        description: `El filtro "${name}" se ha guardado correctamente`,
      });

      return convertedData;
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
      // Convert updates to match Supabase expected format
      const supabaseUpdates: any = {};
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.filter_data !== undefined) supabaseUpdates.filter_data = updates.filter_data as any;
      if (updates.is_default !== undefined) supabaseUpdates.is_default = updates.is_default;

      const { data, error } = await supabase
        .from('saved_filters')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Convert the returned data to our SavedFilter type
      const convertedData: SavedFilter = {
        id: data.id,
        name: data.name,
        description: data.description,
        filter_data: data.filter_data as FilterState,
        is_default: data.is_default,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setSavedFilters(prev => prev.map(filter => 
        filter.id === id ? { ...filter, ...convertedData } : filter
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
