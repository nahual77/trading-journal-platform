// Script para ejecutar en la consola del navegador
// Copia y pega este código en la consola de tu navegador

console.log('🧹 Limpiando datos de autenticación...');

// Limpiar localStorage
localStorage.clear();
console.log('✅ localStorage limpiado');

// Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// Limpiar cookies relacionadas con Supabase
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies limpiadas');

// Recargar la página
console.log('🔄 Recargando página...');
location.reload();

