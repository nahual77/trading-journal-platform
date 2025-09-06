Write-Host "🚀 Iniciando Trading Journal..." -ForegroundColor Cyan

# 1. Ir al directorio frontend
Set-Location -Path "frontend"
Write-Host "✅ Cambiado al directorio frontend" -ForegroundColor Green

# 2. Matar cualquier proceso node.exe existente
Write-Host "🔄 Limpiando procesos anteriores..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Write-Host "✅ Procesos anteriores limpiados" -ForegroundColor Green

# 3. Iniciar el servidor
Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
pnpm run dev

