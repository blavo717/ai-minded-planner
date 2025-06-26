
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useThemePreference } from '@/hooks/useThemePreference';
import { toast } from 'sonner';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { updateThemePreference, isUpdating } = useThemePreference();

  console.log('ThemeToggle - Current theme:', theme);

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      console.log('ThemeToggle - Switching to:', newTheme);
      
      // Cambiar tema inmediatamente para feedback visual
      setTheme(newTheme);
      
      // Guardar en la base de datos
      await updateThemePreference(newTheme);
      console.log('ThemeToggle - Theme saved to DB:', newTheme);
      
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Error al cambiar el tema');
      
      // Revertir el tema si falló guardar en DB
      const revertTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(revertTheme);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      disabled={isUpdating}
      className="relative"
      title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
};

export default ThemeToggle;
