// Script para borrar TODOS los usuarios de Supabase
import { createClient } from '@supabase/supabase-js';

// IMPORTANTE: Reemplaza estos valores con los de tu proyecto
const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseServiceKey = 'tu-service-key-aqui'; // Necesitas la service key, no la anon key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function borrarTodosLosUsuarios() {
  try {
    console.log('🔍 Obteniendo lista de usuarios...');
    
    // Obtener todos los usuarios (necesita service key)
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('❌ Error al obtener usuarios:', fetchError);
      console.log('💡 Asegúrate de usar la SERVICE KEY, no la anon key');
      return;
    }

    console.log(`📊 Encontrados ${users.users.length} usuarios`);

    if (users.users.length === 0) {
      console.log('✅ No hay usuarios para borrar');
      return;
    }

    // Mostrar usuarios que se van a borrar
    console.log('\n🎯 Usuarios que se van a borrar:');
    users.users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
    });

    // Confirmar antes de borrar
    console.log('\n⚠️  ¿Estás seguro de que quieres borrar TODOS estos usuarios?');
    console.log('   Esta acción NO se puede deshacer!');
    console.log('   Presiona Ctrl+C para cancelar, o Enter para continuar...');
    
    // Esperar confirmación
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Borrar usuarios uno por uno
    let borrados = 0;
    let errores = 0;

    for (const user of users.users) {
      try {
        console.log(`🗑️  Borrando: ${user.email}...`);
        
        const { error } = await supabase.auth.admin.deleteUser(user.id);
        
        if (error) {
          console.error(`❌ Error al borrar ${user.email}:`, error.message);
          errores++;
        } else {
          console.log(`✅ Usuario borrado: ${user.email}`);
          borrados++;
        }

        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`❌ Error al borrar ${user.email}:`, err.message);
        errores++;
      }
    }

    console.log(`\n🎉 Proceso completado:`);
    console.log(`   ✅ Usuarios borrados: ${borrados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesados: ${users.users.length}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
borrarTodosLosUsuarios();

