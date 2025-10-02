# Configuración de Supabase para Gestión de Columnas

## 📋 Pasos para completar la configuración

### 1. Ejecutar SQL en Supabase

1. Ve a tu panel de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral
4. Copia y pega el contenido completo del archivo `user-table-columns.sql`
5. Haz clic en **Run** para ejecutar el SQL

### 2. Verificar que la tabla se creó

Después de ejecutar el SQL, deberías ver:
- ✅ Tabla `user_table_columns` creada
- ✅ Función `update_updated_at_column` creada
- ✅ Índices creados
- ✅ Políticas RLS configuradas
- ✅ Trigger configurado

### 3. Probar la conexión

Ejecuta el script de prueba:
```bash
node test-supabase-connection.js
```

Deberías ver:
```
✅ Conexión de autenticación: ✅ OK
✅ Tabla user_table_columns existe: 0 registros
```

### 4. Estructura de la tabla

La tabla `user_table_columns` tiene la siguiente estructura:

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key a auth.users)
- table_type: VARCHAR(50) ('diary' o 'backtesting')
- column_config: JSONB (Array de ColumnDefinition)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 5. Funcionalidades implementadas

- ✅ **Gestión de columnas**: Crear, editar, eliminar columnas
- ✅ **Tipos de columna**: text, number, boolean, date, time, image, select
- ✅ **Reordenamiento**: Mover columnas arriba/abajo
- ✅ **Visibilidad**: Mostrar/ocultar columnas
- ✅ **Persistencia**: Guardar en Supabase o localStorage
- ✅ **Migración**: Migrar desde localStorage a Supabase
- ✅ **RLS**: Seguridad a nivel de fila por usuario

### 6. Próximos pasos

Una vez que la tabla esté creada:
1. Integrar el `DiaryColumnManager` en la tabla de diarios
2. Probar la funcionalidad completa
3. Hacer commit y push de los cambios

## 🔧 Archivos creados

- `user-table-columns.sql` - Script SQL para crear la tabla
- `src/services/columnService.ts` - Servicio para manejar columnas
- `src/components/DiaryColumnManager.tsx` - Componente de gestión
- `src/hooks/useDiaryColumns.ts` - Hook personalizado
- `src/hooks/useAuth.ts` - Hook de autenticación
- `test-supabase-connection.js` - Script de prueba



