-- =============================================
-- TABLA: user_table_columns
-- Configuraciones globales de columnas por usuario
-- =============================================

CREATE TABLE IF NOT EXISTS user_table_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_type VARCHAR(50) NOT NULL CHECK (table_type IN ('diary', 'backtesting')),
  column_config JSONB NOT NULL, -- Array completo de ColumnDefinition
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, table_type)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_user_table_columns_user_id ON user_table_columns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_table_columns_table_type ON user_table_columns(table_type);
CREATE INDEX IF NOT EXISTS idx_user_table_columns_user_table ON user_table_columns(user_id, table_type);

-- Habilitar RLS
ALTER TABLE user_table_columns ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own table columns" ON user_table_columns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own table columns" ON user_table_columns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own table columns" ON user_table_columns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own table columns" ON user_table_columns
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_table_columns_updated_at 
  BEFORE UPDATE ON user_table_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE user_table_columns IS 'Configuraciones globales de columnas por usuario y tipo de tabla';
COMMENT ON COLUMN user_table_columns.table_type IS 'Tipo de tabla: diary o backtesting';
COMMENT ON COLUMN user_table_columns.column_config IS 'Configuración completa de columnas en formato JSONB';
