
-- FASE 1: LIMPIEZA QUIRÚRGICA DE DUPLICADOS (PARTE 1)
-- Crear función para limpiar duplicados
CREATE OR REPLACE FUNCTION clean_duplicate_ai_messages()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar duplicados manteniendo solo el mensaje más reciente
    -- por combinación de user_id, type, content
    WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY user_id, type, content 
                   ORDER BY created_at DESC
               ) as rn
        FROM ai_chat_messages
    )
    DELETE FROM ai_chat_messages 
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log de limpieza
    RAISE NOTICE 'Eliminados % mensajes duplicados', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la limpieza de duplicados
SELECT clean_duplicate_ai_messages();

-- Estadísticas después de la limpieza
SELECT 
    user_id,
    type,
    COUNT(*) as message_count,
    MIN(created_at) as oldest_message,
    MAX(created_at) as newest_message
FROM ai_chat_messages 
GROUP BY user_id, type
ORDER BY user_id, type;
