// Script de prueba para verificar la conexión a Supabase
import { createClient } from '@supabase/supabase-js';

// Las credenciales se cargarán desde las variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son obligatorias.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 Probando conexión a Supabase...');
  console.log('📍 URL:', supabaseUrl);

  try {
    // Probar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('✅ Conexión de autenticación:', authError ? '❌ Error' : '✅ OK');
    if (authError) console.log('Error:', authError.message);

    // Probar consulta a una tabla existente (si existe)
    const { data, error } = await supabase
      .from('user_table_columns')
      .select('*')
      .limit(1);

    if (error) {
      console.log('⚠️  Tabla user_table_columns no existe aún:', error.message);
      console.log('📝 Necesitas ejecutar el SQL en Supabase para crear la tabla');
    } else {
      console.log('✅ Tabla user_table_columns existe:', data.length, 'registros');
    }

    console.log('\n🎯 Próximos pasos:');
    console.log('1. Ve a tu panel de Supabase');
    console.log('2. Ve a SQL Editor');
    console.log('3. Ejecuta el contenido del archivo user-table-columns.sql');
    console.log('4. Verifica que la tabla se creó correctamente');

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testConnection();
