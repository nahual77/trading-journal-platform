// Script para limpiar usuarios de prueba de Supabase
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function limpiarUsuarios() {
  try {
    console.log('🔍 Obteniendo lista de usuarios...');
    
    // Obtener todos los usuarios
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('❌ Error al obtener usuarios:', fetchError);
      return;
    }

    console.log(`📊 Encontrados ${users.users.length} usuarios`);

    // Filtrar usuarios de prueba (puedes ajustar estos criterios)
    const usuariosPrueba = users.users.filter(user => {
      // Borrar usuarios que:
      // 1. Tengan email que contenga "test", "prueba", "demo"
      // 2. O que no tengan email verificado
      // 3. O que hayan sido creados en las últimas 24 horas
      const email = user.email?.toLowerCase() || '';
      const esPrueba = email.includes('test') || 
                      email.includes('prueba') || 
                      email.includes('demo') ||
                      !user.email_confirmed_at ||
                      (new Date() - new Date(user.created_at)) < 24 * 60 * 60 * 1000;
      
      return esPrueba;
    });

    console.log(`🎯 ${usuariosPrueba.length} usuarios marcados para borrar:`);
    usuariosPrueba.forEach(user => {
      console.log(`  - ${user.email} (${user.created_at})`);
    });

    if (usuariosPrueba.length === 0) {
      console.log('✅ No hay usuarios de prueba para borrar');
      return;
    }

    // Confirmar antes de borrar
    console.log('\n⚠️  ¿Estás seguro de que quieres borrar estos usuarios?');
    console.log('   Presiona Ctrl+C para cancelar, o Enter para continuar...');
    
    // Esperar confirmación (en un entorno real, usarías readline)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Borrar usuarios uno por uno
    let borrados = 0;
    for (const user of usuariosPrueba) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id);
        if (error) {
          console.error(`❌ Error al borrar ${user.email}:`, error.message);
        } else {
          console.log(`✅ Usuario borrado: ${user.email}`);
          borrados++;
        }
      } catch (err) {
        console.error(`❌ Error al borrar ${user.email}:`, err.message);
      }
    }

    console.log(`\n🎉 Proceso completado: ${borrados} usuarios borrados`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
limpiarUsuarios();
