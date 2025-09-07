# Script para iniciar el servidor de desarrollo correctamente
# Ejecutar desde: D:\Diario\Trading-Journal

Write-Host "🚀 Iniciando Trading Journal..." -ForegroundColor Green
Write-Host "📁 Directorio: $(Get-Location)" -ForegroundColor Yellow

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: No estás en el directorio raíz del proyecto" -ForegroundColor Red
    Write-Host "📁 Cambia a: D:\Diario\Trading-Journal" -ForegroundColor Yellow
    exit 1
}

# Verificar que el frontend existe
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ ERROR: No se encuentra el directorio frontend" -ForegroundColor Red
    exit 1
}

# Detener procesos Node.js existentes
Write-Host "🛑 Deteniendo procesos Node.js existentes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Iniciar el servidor
Write-Host "▶️ Iniciando servidor de desarrollo..." -ForegroundColor Green
Write-Host "🌐 URL: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "⏹️ Presiona Ctrl+C para detener" -ForegroundColor Gray

npm run dev