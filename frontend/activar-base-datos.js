// =============================================
// SCRIPT PARA ACTIVAR LA BASE DE DATOS
// =============================================
// Ejecuta este script después de crear las tablas en Supabase

const fs = require('fs');
const path = require('path');

console.log('🚀 Activando base de datos en la aplicación...');

// Ruta al archivo TradingJournal.tsx
const filePath = path.join(__dirname, 'src', 'components', 'TradingJournal.tsx');

try {
  // Leer el archivo
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Cambiar el import
  content = content.replace(
    "import { useTradingJournalState } from '../hooks/useTradingJournalState';",
    "import { useDatabaseTradingJournal } from '../hooks/useDatabaseTradingJournal';"
  );
  
  // Cambiar el hook
  content = content.replace(
    "} = useTradingJournalState();",
    "} = useDatabaseTradingJournal();"
  );
  
  // Escribir el archivo modificado
  fs.writeFileSync(filePath, content);
  
  console.log('✅ Base de datos activada correctamente!');
  console.log('🔄 Reinicia el servidor de desarrollo (Ctrl+C y luego pnpm dev)');
  console.log('📊 Los datos se migrarán automáticamente desde localStorage');
  
} catch (error) {
  console.error('❌ Error activando la base de datos:', error.message);
  console.log('📝 Puedes hacer los cambios manualmente:');
  console.log('   1. En TradingJournal.tsx línea 2, cambiar:');
  console.log('      import { useTradingJournalState } por import { useDatabaseTradingJournal }');
  console.log('   2. En TradingJournal.tsx línea 45, cambiar:');
  console.log('      } = useTradingJournalState(); por } = useDatabaseTradingJournal();');
}


