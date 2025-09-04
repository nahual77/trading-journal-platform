# 🗄️ Configuración de Base de Datos - Trading Journal

## 📋 Pasos para Configurar Supabase

### 1. **Acceder a Supabase Dashboard**
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: `qxofbcfindfglcbkckxs`

### 2. **Ejecutar el Script SQL**
1. En el dashboard de Supabase, ve a **SQL Editor**
2. Haz clic en **"New Query"**
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Haz clic en **"Run"** para ejecutar el script

### 3. **Verificar las Tablas Creadas**
Después de ejecutar el script, deberías ver estas tablas en **Table Editor**:

- ✅ `trading_journals` - Diarios de trading por usuario
- ✅ `trade_entries` - Operaciones individuales
- ✅ `trade_images` - Imágenes de las operaciones
- ✅ `journal_columns` - Configuración de columnas
- ✅ `mt5_configs` - Configuraciones MT5
- ✅ `trading_plans` - Planes de trading
- ✅ `user_preferences` - Preferencias del usuario

### 4. **Verificar Row Level Security (RLS)**
1. Ve a **Authentication** → **Policies**
2. Deberías ver políticas para cada tabla que permiten:
   - Los usuarios solo pueden ver/editar sus propios datos
   - Acceso completo para operaciones CRUD propias

### 5. **Probar la Conexión**
1. Ejecuta la aplicación: `pnpm dev`
2. Inicia sesión con un usuario
3. Verifica que se crean los datos en la base de datos

## 🔧 Estructura de Datos

### **Tipos de Datos Soportados:**

#### **📝 Texto**
- `fecha` (DATE)
- `hora` (TIME) 
- `razon_entrada` (TEXT)
- `ratio` (TEXT)
- `beneficio` (TEXT)
- `leccion` (TEXT)
- `emociones_antes/durante/despues` (TEXT)

#### **✅ Booleanos**
- `se_cumplio_plan` (BOOLEAN)
- `visible` (BOOLEAN) - para columnas
- `connected` (BOOLEAN) - para MT5

#### **🖼️ Imágenes**
- `antes` - Imágenes antes de la operación
- `durante` - Imágenes durante la operación  
- `entradas_no_tomadas` - Imágenes de oportunidades perdidas
- `que_sucedio_entradas` - Seguimiento de oportunidades
- `screenshots` - Capturas generales

#### **🔢 Números**
- `balance`, `equity`, `margin`, `free_margin` (DECIMAL)
- `column_order`, `image_order` (INTEGER)

#### **📊 JSON**
- `custom_fields` - Campos personalizados
- `checklist` - Lista de tareas del plan de trading

## 🚀 Beneficios de la Migración

### **✅ Antes (localStorage)**
- ❌ Datos solo en el navegador
- ❌ Se pierden al cambiar dispositivo
- ❌ Sin backup automático
- ❌ Limitado a un navegador

### **✅ Ahora (Base de Datos)**
- ✅ Datos persistentes en la nube
- ✅ Acceso desde cualquier dispositivo
- ✅ Backup automático
- ✅ Sincronización en tiempo real
- ✅ Seguridad con RLS
- ✅ Escalabilidad

## 🔄 Migración Automática

La aplicación detectará automáticamente si tienes datos en `localStorage` y los migrará a la base de datos:

1. **Primera vez**: Se crea un diario por defecto
2. **Usuario existente**: Se migran todos los datos del localStorage
3. **Después de migrar**: Se limpia el localStorage

## 🛠️ Comandos Útiles

```bash
# Ejecutar la aplicación
pnpm dev

# Ver logs de la base de datos
# En Supabase Dashboard → Logs

# Verificar datos
# En Supabase Dashboard → Table Editor
```

## 📞 Soporte

Si encuentras algún problema:

1. **Verifica la consola** del navegador para errores
2. **Revisa los logs** de Supabase
3. **Confirma que las tablas** se crearon correctamente
4. **Verifica las políticas RLS** están activas

¡La migración está lista! 🎉


