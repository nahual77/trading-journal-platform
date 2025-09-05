# Guía de Desarrollo - Trading Journal

## 🚀 Iniciar el Proyecto

Hay tres formas de iniciar el proyecto:

### 1. Usando el Script PowerShell (Recomendado)
```powershell
./start-dev.ps1
```
Este script:
- Cambia al directorio correcto
- Limpia procesos anteriores
- Inicia el servidor

### 2. Usando npm/pnpm desde la Raíz
```bash
pnpm run dev
```
Este comando automáticamente:
- Cambia al directorio frontend
- Inicia el servidor

### 3. Manualmente desde el Directorio Frontend
```bash
cd frontend
pnpm run dev
```

## ⚠️ Solución de Problemas Comunes

### Error: "ERR_PNPM_NO_SCRIPT Missing script: dev"
Este error significa que estás en el directorio equivocado. Asegúrate de:
1. Estar en el directorio `frontend`, o
2. Usar uno de los métodos automatizados anteriores

### Error: "Port 5173 is already in use"
Significa que hay una instancia anterior corriendo. Solución:
1. Ejecuta `taskkill /F /IM node.exe`
2. Intenta iniciar el servidor nuevamente

## 🔍 Estructura del Proyecto
```
D:\Diario\Trading-Journal\          <- Directorio raíz
├── start-dev.ps1                   <- Script de inicio
├── package.json                    <- Scripts raíz
└── frontend\                       <- Aplicación principal
    ├── package.json               <- Scripts de desarrollo
    └── src\                       <- Código fuente
```
