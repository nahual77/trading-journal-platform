# 🔌 Conexión REAL a Deriv - Sin Simulación

## 📋 Resumen
La aplicación Nagual Trader ahora implementa **conexión VERDADERA** a la cuenta 80340837 de Deriv **SIN FALLBACK A SIMULACIÓN** cuando se proporciona un token de API real. 

⚠️ **IMPORTANTE**: Para conexión real se requiere obligatoriamente el token de API de Deriv.

## 🚀 Tipos de Conexión

### 🔥 MODO REAL (Con Token de API)
**Estado**: ✅ Implementado - **SIN SIMULACIÓN**
- **Requiere**: Token de API real de Deriv
- **Comportamiento**: Conexión exclusivamente real o falla
- **Datos**: 100% auténticos desde servidores de Deriv
- **Sin fallback**: No se usan datos simulados

#### Orden de Prioridad (Solo con Token):
1. **🌐 Deriv API Real**: WebSocket directo con autenticación
2. **⚠️ ERROR**: Si falla, muestra error claro (sin simulación)

### 📊 MODO SIMULADO (Sin Token de API)
**Estado**: ✅ Disponible para pruebas
- **Comportamiento**: Datos realistas pero simulados
- **Para**: Pruebas y cuentas sin token de API
- **Advertencia**: Se muestra claramente que son datos simulados

## ⚙️ Configuración para Conexión Real

### 🔑 Paso 1: Obtener Token de API de Deriv
1. Ve a **https://app.deriv.com/api-token**
2. Inicia sesión con tu cuenta de Deriv
3. Crea un nuevo token con permisos de **lectura** (read)
4. **Copia el token completo** (ejemplo: `abc123def456...`)

### 📝 Paso 2: Configurar en la Aplicación
En la pestaña "Conexión MT5" → Configuración:
- **Broker**: `Deriv (SVG) LLC`
- **Servidor**: `DerivSVG-Server-02`
- **ID de acceso**: `80340837`
- **Contraseña**: Tu contraseña real de Deriv
- **🔑 Token de API**: **Pegar aquí tu token real**

### 🚀 Paso 3: Conectar
1. **Con Token**: Conexión real o error claro
2. **Sin Token**: Datos simulados con advertencia

### ⚠️ IMPORTANTE: Validación de Token
- Token inválido = Error específico
- Token válido = Datos reales de tu cuenta
- Sin token = Datos simulados claramente marcados

## 🔍 Identificar Tipo de Conexión

La aplicación muestra el tipo de conexión actual:
- 🌐 **Deriv API**: Conexión real via WebSocket
- ☁️ **MetaApi**: Conexión real via MetaApi Cloud  
- 🖥️ **Local MT5**: Conexión real con terminal local
- 🔄 **Modo Demo**: Datos simulados (pero realistas)

## ⚠️ Troubleshooting

### "Todos los campos son requeridos"
✅ **Solución**: Llenar Broker, Servidor, ID de acceso y Contraseña

### "Servidor debe ser compatible con Deriv"
✅ **Solución**: Usar servidor de Deriv (ej: `DerivSVG-Server-02`)

### "MetaApi no configurado"
✅ **Solución**: Agregar token en `.env` o usar conexión Deriv directa

### "MT5 local no disponible"  
✅ **Solución**: Instalar EA bridge en MT5 o usar otras conexiones

### Conexión cae en modo demo
✅ **Normal**: Si credenciales reales no están disponibles, usa demo inteligente

## 🛡️ Seguridad

- ✅ Contraseñas nunca se almacenan en localStorage
- ✅ Tokens de API se manejan como variables de entorno
- ✅ Conexiones WebSocket encriptadas (WSS)
- ✅ Validación de credenciales antes de envío

## 📊 Datos en Tiempo Real

Cuando está conectado con datos reales:
- Balance, Equity, Margin se actualizan cada 5-8 segundos
- Modo demo se actualiza cada 8-12 segundos
- Indicador visual del tipo de conexión
- Timestamp de última actualización

## 🔧 Para Desarrolladores

### Estructura de Servicios
```
src/services/
├── derivAPI.ts          # Conexión Deriv WebSocket
├── metaAPI.ts           # Conexión MetaApi Cloud
├── localMT5.ts          # Conexión MT5 Local
└── realMT5Connection.ts # Servicio principal con fallbacks
```

### Hook Principal
```typescript
// src/hooks/useMT5Connection.ts
// Reemplaza simulación con conexiones reales
const { mt5Data, connect, disconnect } = useMT5Connection();
```

### Agregar Nuevo Método de Conexión
1. Crear servicio en `src/services/`
2. Implementar interface `ConnectionResult`
3. Agregar a `connectionStrategies` en `realMT5Connection.ts`

## 📝 Próximas Mejoras

- [ ] Soporte para más brokers (IC Markets, FTMO, etc.)
- [ ] Trading automático via API
- [ ] Notificaciones de estado de cuenta
- [ ] Historial de operaciones real
- [ ] Múltiples cuentas simultáneas

---

**💡 Nota**: La aplicación está diseñada para funcionar aunque no tengas APIs configuradas. En ese caso, usará modo demo con datos muy realistas basados en tus credenciales.
