-- =============================================
-- ACTUALIZAR TABLA PARA SALDO INICIAL
-- =============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna para saldo inicial por diario
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS initial_balances JSONB DEFAULT '{}';

-- Comentario para documentación
COMMENT ON COLUMN user_preferences.initial_balances IS 'Balances iniciales por diario en formato JSON: {"journal_id": balance}';


