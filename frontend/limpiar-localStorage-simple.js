// Script simple para limpiar localStorage
console.log('🧹 Limpiando localStorage...');

// Lista de claves a limpiar
const clavesParaLimpiar = [
  'nagual-user-',
  'trading-journal-',
  'backtesting-',
  'supabase.auth.token',
  'sb-',
  'nagual-'
];

let limpiados = 0;

// Limpiar claves específicas
clavesParaLimpiar.forEach(patron => {
  Object.keys(localStorage).forEach(clave => {
    if (clave.includes(patron)) {
      localStorage.removeItem(clave);
      console.log(`✅ Eliminado: ${clave}`);
      limpiados++;
    }
  });
});

// Limpiar todo el localStorage (descomenta si quieres borrar TODO)
// localStorage.clear();
// console.log('🧹 localStorage completamente limpiado');

console.log(`🎉 Proceso completado: ${limpiados} elementos eliminados del localStorage`);

// Mostrar claves restantes
console.log('\n📋 Claves restantes en localStorage:');
Object.keys(localStorage).forEach(clave => {
  console.log(`  - ${clave}`);
});
