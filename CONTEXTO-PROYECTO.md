# CONTEXTO DEL PROYECTO - TRADING JOURNAL

## ⚠️ IMPORTANTE - LECTURA OBLIGATORIA ANTES DE EJECUTAR COMANDOS

### 🎯 DIRECTORIO CORRECTO
- **SIEMPRE ejecutar comandos desde:** `D:\Diario\Trading-Journal` (directorio raíz)
- **NUNCA ejecutar desde:** `D:\Diario\Trading-Journal\frontend`

### 🚀 COMANDOS CORRECTOS
```bash
# ✅ CORRECTO - Desde directorio raíz
npm run dev

# ❌ INCORRECTO - Desde frontend
cd frontend && pnpm run dev
```

### 📁 ESTRUCTURA DEL PROYECTO
```
D:\Diario\Trading-Journal\
├── package.json (scripts configurados)
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
└── CONTEXTO-PROYECTO.md (este archivo)
```

### 🔧 CONFIGURACIÓN DE SCRIPTS
El `package.json` del directorio raíz tiene:
```json
{
  "scripts": {
    "dev": "cd frontend && pnpm run dev",
    "build": "cd frontend && pnpm run build",
    "preview": "cd frontend && pnpm run preview"
  }
}
```

### 🎨 LOGO INTEGRADO
- **Archivo:** `frontend/public/logo-growjou.png`
- **Ubicación en app:** Header superior izquierdo
- **Componente:** `TradingJournal.tsx` línea 370-374

### 🌐 URL DEL SITIO
- **Desarrollo:** http://localhost:5173/
- **Puerto:** 5173
- **Servidor:** Vite

### ⚡ VERIFICACIÓN RÁPIDA
Antes de ejecutar cualquier comando:
1. Verificar que estoy en `D:\Diario\Trading-Journal`
2. Usar `npm run dev` (NO pnpm directamente)
3. Verificar que el puerto 5173 esté activo

### 🚨 SI EL SITIO NO CARGA
1. Verificar directorio actual
2. Detener procesos Node.js: `taskkill /f /im node.exe`
3. Ejecutar: `npm run dev` desde directorio raíz
4. Verificar puerto: `netstat -an | findstr :5173`

---
**Última actualización:** 6 de septiembre de 2025
**Estado:** Logo GrowJou integrado correctamente

