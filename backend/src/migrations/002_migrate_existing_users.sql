-- ===========================================
-- MIGRACIÓN: USUARIOS EXISTENTES A NUEVA ESTRUCTURA
-- ===========================================
-- Ejecutar después de crear las tablas
-- ===========================================

-- 1. Migrar usuarios existentes a user_profiles
INSERT INTO user_profiles (id, user_type, display_name, status, created_at)
SELECT 
    u.id,
    'free' as user_type, -- Por defecto, todos los usuarios existentes son gratuitos
    COALESCE(u.user_metadata->>'full_name', u.user_metadata->>'name', split_part(u.email, '@', 1)) as display_name,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN 'active'
        ELSE 'inactive'
    END as status,
    u.created_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = u.id
);

-- 2. Crear suscripciones gratuitas para usuarios existentes
INSERT INTO user_subscriptions (user_id, plan_type, status, start_date, price)
SELECT 
    up.id,
    'free' as plan_type,
    'active' as status,
    up.created_at as start_date,
    0.00 as price
FROM user_profiles up
WHERE up.user_type = 'free'
AND NOT EXISTS (
    SELECT 1 FROM user_subscriptions us WHERE us.user_id = up.id
);

-- 3. Crear algunos usuarios de prueba para desarrollo
-- (Solo ejecutar en base de datos de desarrollo)

-- Usuario Premium de prueba
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, user_metadata)
VALUES (
    gen_random_uuid(),
    'premium@test.com',
    NOW(),
    NOW(),
    '{"full_name": "Usuario Premium Test"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Usuario Pro de prueba
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, user_metadata)
VALUES (
    gen_random_uuid(),
    'pro@test.com',
    NOW(),
    NOW(),
    '{"full_name": "Usuario Pro Test"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Educador de prueba
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, user_metadata)
VALUES (
    gen_random_uuid(),
    'educator@test.com',
    NOW(),
    NOW(),
    '{"full_name": "Dr. María González"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Estudiante de prueba
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, user_metadata)
VALUES (
    gen_random_uuid(),
    'student@test.com',
    NOW(),
    NOW(),
    '{"full_name": "Ana Martínez"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- 4. Crear perfiles para usuarios de prueba
INSERT INTO user_profiles (id, user_type, display_name, status, created_at)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'premium@test.com' THEN 'premium'
        WHEN u.email = 'pro@test.com' THEN 'pro'
        WHEN u.email = 'educator@test.com' THEN 'educator'
        WHEN u.email = 'student@test.com' THEN 'student'
        ELSE 'free'
    END as user_type,
    COALESCE(u.user_metadata->>'full_name', split_part(u.email, '@', 1)) as display_name,
    'active' as status,
    u.created_at
FROM auth.users u
WHERE u.email IN ('premium@test.com', 'pro@test.com', 'educator@test.com', 'student@test.com')
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = u.id
);

-- 5. Crear suscripciones para usuarios de prueba
INSERT INTO user_subscriptions (user_id, plan_type, status, start_date, price)
SELECT 
    up.id,
    up.user_type as plan_type,
    'active' as status,
    up.created_at as start_date,
    CASE 
        WHEN up.user_type = 'free' THEN 0.00
        WHEN up.user_type = 'premium' THEN 29.99
        WHEN up.user_type = 'pro' THEN 99.99
        ELSE 0.00
    END as price
FROM user_profiles up
WHERE up.user_type IN ('premium', 'pro')
AND NOT EXISTS (
    SELECT 1 FROM user_subscriptions us WHERE us.user_id = up.id
);

-- 6. Crear perfil de educador
INSERT INTO educators (id, bio, commission_rate, total_earnings, total_students, rating)
SELECT 
    up.id,
    'Experta en trading con más de 10 años de experiencia en mercados financieros.',
    15.50 as commission_rate,
    0.00 as total_earnings,
    0 as total_students,
    4.8 as rating
FROM user_profiles up
WHERE up.user_type = 'educator'
AND NOT EXISTS (
    SELECT 1 FROM educators e WHERE e.id = up.id
);

-- 7. Crear perfil de estudiante
INSERT INTO students (id, educator_id, level, progress, joined_at)
SELECT 
    up.id,
    (SELECT e.id FROM educators e LIMIT 1) as educator_id,
    'beginner' as level,
    '{"completed_lessons": 0, "total_lessons": 10, "progress_percentage": 0}'::jsonb as progress,
    NOW() as joined_at
FROM user_profiles up
WHERE up.user_type = 'student'
AND NOT EXISTS (
    SELECT 1 FROM students s WHERE s.id = up.id
);

-- 8. Actualizar contador de estudiantes del educador
UPDATE educators 
SET total_students = (
    SELECT COUNT(*) 
    FROM students s 
    WHERE s.educator_id = educators.id
)
WHERE id IN (SELECT id FROM educators);

-- ===========================================
-- VERIFICACIÓN DE MIGRACIÓN
-- ===========================================

-- Mostrar resumen de usuarios migrados
SELECT 
    user_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
FROM user_profiles 
GROUP BY user_type
ORDER BY total_users DESC;

-- Mostrar suscripciones creadas
SELECT 
    plan_type,
    COUNT(*) as total_subscriptions,
    SUM(price) as total_revenue
FROM user_subscriptions 
GROUP BY plan_type
ORDER BY total_subscriptions DESC;

-- Mostrar educadores y estudiantes
SELECT 
    'Educators' as type,
    COUNT(*) as total
FROM educators
UNION ALL
SELECT 
    'Students' as type,
    COUNT(*) as total
FROM students;

