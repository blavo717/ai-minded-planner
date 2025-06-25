
/**
 * Utilidad para generar UUIDs válidos
 * Soluciona el problema crítico de UUIDs inválidos que causan errores en Supabase
 */

export const generateValidUUID = (): string => {
  try {
    // Usar crypto.randomUUID() nativo del navegador (más seguro y válido)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback: generar UUID v4 manualmente
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  } catch (error) {
    console.error('❌ Error generating UUID:', error);
    // Último recurso: timestamp + random
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateAndFixUUID = (uuid: string): string => {
  if (isValidUUID(uuid)) {
    return uuid;
  }
  
  console.warn('⚠️ Invalid UUID detected, generating new one:', uuid);
  return generateValidUUID();
};
