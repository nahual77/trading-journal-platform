import { supabase } from './config/supabase';

async function testSupabase() {
  try {
    console.log('🔍 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Conexión exitosa!', data);
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}

testSupabase();