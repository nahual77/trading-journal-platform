-- =============================================
-- SCHEMA PARA TRADING JOURNAL - SUPABASE
-- =============================================

-- Habilitar RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =============================================
-- TABLA: trading_journals
-- =============================================
CREATE TABLE IF NOT EXISTS trading_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false
);

-- =============================================
-- TABLA: trade_entries
-- =============================================
CREATE TABLE IF NOT EXISTS trade_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID REFERENCES trading_journals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Campos de texto
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  razon_entrada TEXT,
  ratio TEXT,
  beneficio TEXT,
  leccion TEXT,
  emociones_antes TEXT,
  emociones_durante TEXT,
  emociones_despues TEXT,
  
  -- Campos booleanos
  se_cumplio_plan BOOLEAN DEFAULT false,
  
  -- Campos JSON para datos complejos
  custom_fields JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: trade_images
-- =============================================
CREATE TABLE IF NOT EXISTS trade_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_entry_id UUID REFERENCES trade_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadatos de la imagen
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Tipo de imagen (antes, durante, entradas_no_tomadas, etc.)
  image_type TEXT NOT NULL CHECK (image_type IN (
    'antes', 
    'durante', 
    'entradas_no_tomadas', 
    'que_sucedio_entradas', 
    'screenshots'
  )),
  
  -- Orden de la imagen en su tipo
  image_order INTEGER DEFAULT 1,
  
  -- Metadatos adicionales
  file_size BIGINT,
  mime_type TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: journal_columns
-- =============================================
CREATE TABLE IF NOT EXISTS journal_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID REFERENCES trading_journals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Definición de columna
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  column_type TEXT NOT NULL CHECK (column_type IN (
    'text', 'number', 'boolean', 'date', 'time', 'image'
  )),
  
  -- Configuración de visualización
  visible BOOLEAN DEFAULT true,
  column_order INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: mt5_configs
-- =============================================
CREATE TABLE IF NOT EXISTS mt5_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID REFERENCES trading_journals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Configuración del broker
  broker TEXT NOT NULL,
  account_number TEXT NOT NULL,
  server_name TEXT NOT NULL,
  password TEXT,
  api_token TEXT,
  
  -- Datos financieros
  balance DECIMAL(15,2) DEFAULT 0.00,
  equity DECIMAL(15,2) DEFAULT 0.00,
  margin DECIMAL(15,2) DEFAULT 0.00,
  free_margin DECIMAL(15,2) DEFAULT 0.00,
  connected BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: trading_plans
-- =============================================
CREATE TABLE IF NOT EXISTS trading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos del plan
  checklist JSONB NOT NULL DEFAULT '[]',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: user_preferences
-- =============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Preferencias del usuario
  active_journal_id UUID REFERENCES trading_journals(id) ON DELETE SET NULL,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'es',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para trading_journals
CREATE INDEX IF NOT EXISTS idx_trading_journals_user_id ON trading_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_journals_active ON trading_journals(user_id, is_active);

-- Índices para trade_entries
CREATE INDEX IF NOT EXISTS idx_trade_entries_journal_id ON trade_entries(journal_id);
CREATE INDEX IF NOT EXISTS idx_trade_entries_user_id ON trade_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_entries_fecha ON trade_entries(fecha);

-- Índices para trade_images
CREATE INDEX IF NOT EXISTS idx_trade_images_entry_id ON trade_images(trade_entry_id);
CREATE INDEX IF NOT EXISTS idx_trade_images_user_id ON trade_images(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_images_type ON trade_images(image_type);

-- Índices para journal_columns
CREATE INDEX IF NOT EXISTS idx_journal_columns_journal_id ON journal_columns(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_columns_user_id ON journal_columns(user_id);

-- Índices para mt5_configs
CREATE INDEX IF NOT EXISTS idx_mt5_configs_journal_id ON mt5_configs(journal_id);
CREATE INDEX IF NOT EXISTS idx_mt5_configs_user_id ON mt5_configs(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE trading_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt5_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para trading_journals
CREATE POLICY "Users can view their own journals" ON trading_journals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journals" ON trading_journals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals" ON trading_journals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals" ON trading_journals
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para trade_entries
CREATE POLICY "Users can view their own trade entries" ON trade_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trade entries" ON trade_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade entries" ON trade_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade entries" ON trade_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para trade_images
CREATE POLICY "Users can view their own trade images" ON trade_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trade images" ON trade_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade images" ON trade_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade images" ON trade_images
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para journal_columns
CREATE POLICY "Users can view their own journal columns" ON journal_columns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal columns" ON journal_columns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal columns" ON journal_columns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal columns" ON journal_columns
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para mt5_configs
CREATE POLICY "Users can view their own mt5 configs" ON mt5_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mt5 configs" ON mt5_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mt5 configs" ON mt5_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mt5 configs" ON mt5_configs
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para trading_plans
CREATE POLICY "Users can view their own trading plans" ON trading_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trading plans" ON trading_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading plans" ON trading_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading plans" ON trading_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FUNCIONES DE UTILIDAD
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_trading_journals_updated_at BEFORE UPDATE ON trading_journals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trade_entries_updated_at BEFORE UPDATE ON trade_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_columns_updated_at BEFORE UPDATE ON journal_columns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mt5_configs_updated_at BEFORE UPDATE ON mt5_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_plans_updated_at BEFORE UPDATE ON trading_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar columnas por defecto cuando se crea un nuevo journal
CREATE OR REPLACE FUNCTION create_default_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar columnas por defecto
    INSERT INTO journal_columns (journal_id, user_id, key, name, column_type, visible, column_order) VALUES
    (NEW.id, NEW.user_id, 'fecha', 'Fecha', 'date', true, 1),
    (NEW.id, NEW.user_id, 'hora', 'Hora', 'time', true, 2),
    (NEW.id, NEW.user_id, 'razonEntrada', 'Razón de entrada', 'text', true, 3),
    (NEW.id, NEW.user_id, 'antes', 'Antes', 'image', true, 4),
    (NEW.id, NEW.user_id, 'durante', 'Durante', 'image', true, 5),
    (NEW.id, NEW.user_id, 'ratio', 'Ratio', 'text', true, 6),
    (NEW.id, NEW.user_id, 'beneficio', 'Beneficio', 'text', true, 7),
    (NEW.id, NEW.user_id, 'seCumplioElPlan', 'Se cumplió el plan?', 'boolean', true, 8),
    (NEW.id, NEW.user_id, 'leccion', 'Lección', 'text', true, 9),
    (NEW.id, NEW.user_id, 'emocionesAntes', 'Emociones (antes)', 'text', true, 10),
    (NEW.id, NEW.user_id, 'emocionesDurante', 'Emociones (durante)', 'text', true, 11),
    (NEW.id, NEW.user_id, 'emocionesDespues', 'Emociones (después)', 'text', true, 12),
    (NEW.id, NEW.user_id, 'entradasNoTomadas', 'Entradas no tomadas', 'image', true, 13),
    (NEW.id, NEW.user_id, 'queSucedioConEntradasNoTomadas', 'Que sucedió con estas entradas', 'image', true, 14),
    (NEW.id, NEW.user_id, 'screenshots', 'Screenshots', 'image', true, 15);
    
    -- Crear configuración MT5 por defecto
    INSERT INTO mt5_configs (journal_id, user_id, broker, account_number, server_name, balance, equity, free_margin)
    VALUES (NEW.id, NEW.user_id, 'Deriv (SVG) LLC', substring(NEW.id::text, 1, 8), 'DerivSVG-Server-02', 1000.00, 1000.00, 1000.00);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para crear columnas por defecto
CREATE TRIGGER create_default_journal_data AFTER INSERT ON trading_journals
    FOR EACH ROW EXECUTE FUNCTION create_default_columns();

-- =============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =============================================

COMMENT ON TABLE trading_journals IS 'Diarios de trading por usuario';
COMMENT ON TABLE trade_entries IS 'Operaciones individuales dentro de cada diario';
COMMENT ON TABLE trade_images IS 'Imágenes asociadas a las operaciones (antes, durante, screenshots, etc.)';
COMMENT ON TABLE journal_columns IS 'Configuración de columnas personalizables por diario';
COMMENT ON TABLE mt5_configs IS 'Configuraciones de conexión MT5 por diario';
COMMENT ON TABLE trading_plans IS 'Planes de trading y checklist por usuario';
COMMENT ON TABLE user_preferences IS 'Preferencias y configuraciones del usuario';


