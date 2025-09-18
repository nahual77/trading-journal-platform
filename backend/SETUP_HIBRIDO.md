# 🚀 Configuración de Base de Datos Híbrida

## 📋 Pasos para Implementar la Estrategia Híbrida

### 1. Crear Proyecto de Desarrollo en Supabase

1. **Ve a** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Clic en "New Project"**
3. **Configuración:**
   - **Name:** `trading-journal-dev`
   - **Database Password:** Genera una segura (guárdala)
   - **Region:** La más cercana a ti
4. **Espera** a que se cree (2-3 minutos)

### 2. Obtener Credenciales de Desarrollo

1. **Ve a** Settings → API en el nuevo proyecto
2. **Copia las credenciales:**
   - Project URL
   - anon public key
   - service_role secret key

### 3. Configurar Variables de Entorno

Crea o actualiza el archivo `backend/.env`:

```env
# DESARROLLO (Base de datos de desarrollo)
SUPABASE_URL_DEV=https://tu-proyecto-dev.supabase.co
SUPABASE_ANON_KEY_DEV=tu_anon_key_dev
SUPABASE_SERVICE_ROLE_KEY_DEV=tu_service_role_key_dev

# PRODUCCIÓN (Base de datos de producción)
SUPABASE_URL=https://tu-proyecto-prod.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_prod
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_prod

# CONFIGURACIÓN DEL SERVIDOR
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Ejecutar Migraciones en Base de Datos de Desarrollo

1. **Ve a** SQL Editor en el proyecto de desarrollo
2. **Ejecuta** `backend/src/migrations/001_create_user_tables.sql`
3. **Ejecuta** `backend/src/migrations/002_migrate_existing_users.sql`

### 5. Verificar Configuración

```bash
# Iniciar el servidor
cd backend
npm run dev

# Verificar logs
# Deberías ver: "🔗 Conectado a Supabase DESARROLLO"
```

## 🏗️ Estructura de la Base de Datos

### Tablas Principales:

- **`user_profiles`** - Perfiles extendidos de usuarios
- **`user_subscriptions`** - Suscripciones y planes
- **`educators`** - Información específica de educadores
- **`students`** - Información específica de estudiantes
- **`plan_features`** - Características por tipo de plan

### Tipos de Usuario:

- **`free`** - Usuarios gratuitos
- **`premium`** - Usuarios premium
- **`pro`** - Usuarios profesionales
- **`educator`** - Educadores
- **`student`** - Estudiantes

## 🔧 API Endpoints

### Usuarios por Tipo:
- `GET /api/users/by-type/:type` - Obtener usuarios por tipo
- `GET /api/users/overview` - Resumen general de usuarios
- `POST /api/users/create` - Crear nuevo usuario
- `PUT /api/users/:id/type` - Actualizar tipo de usuario
- `GET /api/users/plan-features/:plan` - Obtener características del plan

### Parámetros de Query:
- `page` - Página (default: 1)
- `limit` - Límite por página (default: 20)

## 🧪 Datos de Prueba

La migración incluye usuarios de prueba:
- `premium@test.com` - Usuario Premium
- `pro@test.com` - Usuario Pro
- `educator@test.com` - Educador
- `student@test.com` - Estudiante

## 🔄 Cambiar Entre Desarrollo y Producción

### Para Desarrollo:
```env
NODE_ENV=development
```

### Para Producción:
```env
NODE_ENV=production
```

## 🛡️ Seguridad

- **RLS habilitado** en todas las tablas
- **Políticas de seguridad** configuradas
- **Validaciones** en base de datos
- **Índices** para optimización

## 📊 Monitoreo

### Logs del Servidor:
- Verifica que aparezca "DESARROLLO" o "PRODUCCIÓN"
- Revisa la URL de conexión

### Base de Datos:
- Usa el dashboard de Supabase para verificar datos
- Revisa las tablas creadas
- Verifica los usuarios de prueba

## 🚨 Troubleshooting

### Error de Conexión:
1. Verifica las variables de entorno
2. Confirma que el proyecto de Supabase esté activo
3. Revisa las credenciales

### Error de Migración:
1. Ejecuta las migraciones en orden
2. Verifica permisos de la base de datos
3. Revisa logs de Supabase

### Error de API:
1. Verifica que el servidor esté corriendo
2. Revisa logs del backend
3. Confirma que las rutas estén registradas

