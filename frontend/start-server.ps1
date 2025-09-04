# Script para iniciar el servidor de desarrollo de manera estable
Write-Host "🔄 Limpiando procesos anteriores..." -ForegroundColor Yellow

# Detener todos los procesos de Node.js
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Esperar un momento
Start-Sleep -Seconds 2

# Verificar que el puerto esté libre
$portInUse = netstat -an | Select-String ":5173"
if ($portInUse) {
    Write-Host "⚠️ Puerto 5173 en uso, intentando liberar..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}

Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Green
Write-Host "📱 El sitio estará disponible en: http://localhost:5173" -ForegroundColor Cyan

# Iniciar el servidor
npx vite --port 5173 --host

