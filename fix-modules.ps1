Write-Host "=== Limpiando node_modules y dist del índice de Git ==="

# 1. Eliminar node_modules y dist del índice de Git (pero no del disco)
git rm -r --cached node_modules frontend/node_modules backend/node_modules dist frontend/dist backend/dist

# 2. Actualizar .gitignore
Write-Host "=== Asegúrate de que .gitignore contiene lo siguiente: ==="
Write-Host "node_modules/"
Write-Host "frontend/node_modules/"
Write-Host "backend/node_modules/"
Write-Host "dist/"
Write-Host "frontend/dist/"
Write-Host "backend/dist/"

# 3. Hacer commit de la limpieza
git add .gitignore
git commit -m "chore: untrack node_modules y dist; update .gitignore"

# 4. Instalar dependencias con pnpm y regenerar lockfile
Write-Host "=== Instalando dependencias con pnpm... ==="
pnpm install

# 5. Commit del lockfile limpio
git add pnpm-lock.yaml
git commit -m "chore: regenerate clean pnpm-lock.yaml"

Write-Host "=== Proceso completado. Ahora puedes hacer git push. ==="
