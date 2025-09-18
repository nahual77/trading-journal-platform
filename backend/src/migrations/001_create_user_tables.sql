-- ===========================================
-- MIGRACIÓN: ESTRUCTURA HÍBRIDA DE USUARIOS
-- ===========================================
-- Ejecutar en Supabase SQL Editor del proyecto DEV
-- ===========================================

-- 1. Tabla de perfiles de usuarios (extensión de auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('free', 'premium', 'pro', 'educator', 'student')),
  display_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla de suscripciones
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabla de educadores
CREATE TABLE IF NOT EXISTS educators (
  id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  bio TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  total_students INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  educator_id UUID REFERENCES educators(id) ON DELETE SET NULL,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  progress JSONB DEFAULT '{}',
  joined_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabla de características por plan
CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium', 'pro')),
  feature_name TEXT NOT NULL,
  feature_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===========================================

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- Índices para user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_type ON user_subscriptions(plan_type);

-- Índices para educators
CREATE INDEX IF NOT EXISTS idx_educators_commission ON educators(commission_rate);
CREATE INDEX IF NOT EXISTS idx_educators_earnings ON educators(total_earnings);

-- Índices para students
CREATE INDEX IF NOT EXISTS idx_students_educator_id ON students(educator_id);
CREATE INDEX IF NOT EXISTS idx_students_level ON students(level);

-- ===========================================
-- DATOS INICIALES
-- ===========================================

-- Insertar características de planes
INSERT INTO plan_features (plan_type, feature_name, feature_value) VALUES
('free', 'max_journals', '{"value": 1}'),
('free', 'max_trades_per_day', '{"value": 10}'),
('free', 'basic_analytics', '{"value": true}'),
('free', 'export_csv', '{"value": false}'),
('free', 'api_access', '{"value": false}'),

('premium', 'max_journals', '{"value": 5}'),
('premium', 'max_trades_per_day', '{"value": 100}'),
('premium', 'advanced_analytics', '{"value": true}'),
('premium', 'export_csv', '{"value": true}'),
('premium', 'api_access', '{"value": true}'),
('premium', 'priority_support', '{"value": true}'),

('pro', 'max_journals', '{"value": -1}'),
('pro', 'max_trades_per_day', '{"value": -1}'),
('pro', 'advanced_analytics', '{"value": true}'),
('pro', 'export_csv', '{"value": true}'),
('pro', 'api_access', '{"value": true}'),
('pro', 'priority_support', '{"value": true}'),
('pro', 'custom_features', '{"value": true}'),
('pro', 'white_label', '{"value": true}');

-- ===========================================
-- FUNCIONES DE UTILIDAD
-- ===========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ===========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE educators ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Política para user_profiles (usuarios solo pueden ver su propio perfil)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para user_subscriptions (usuarios solo pueden ver sus propias suscripciones)
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Política para educators (público para lectura, solo el educador para escritura)
CREATE POLICY "Anyone can view educators" ON educators
    FOR SELECT USING (true);

CREATE POLICY "Educators can update own profile" ON educators
    FOR UPDATE USING (auth.uid() = id);

-- Política para students (estudiantes solo pueden ver su propio perfil)
CREATE POLICY "Students can view own profile" ON students
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update own profile" ON students
    FOR UPDATE USING (auth.uid() = id);

-- Política para plan_features (lectura pública)
CREATE POLICY "Anyone can view plan features" ON plan_features
    FOR SELECT USING (true);

-- ===========================================
-- COMENTARIOS
-- ===========================================

COMMENT ON TABLE user_profiles IS 'Perfiles extendidos de usuarios con tipos y estados';
COMMENT ON TABLE user_subscriptions IS 'Suscripciones y planes de usuarios';
COMMENT ON TABLE educators IS 'Información específica de educadores';
COMMENT ON TABLE students IS 'Información específica de estudiantes';
COMMENT ON TABLE plan_features IS 'Características disponibles por tipo de plan';

COMMENT ON COLUMN user_profiles.user_type IS 'Tipo de usuario: free, premium, pro, educator, student';
COMMENT ON COLUMN user_subscriptions.plan_type IS 'Tipo de plan de suscripción';
COMMENT ON COLUMN educators.commission_rate IS 'Porcentaje de comisión del educador';
COMMENT ON COLUMN students.level IS 'Nivel del estudiante: beginner, intermediate, advanced';

