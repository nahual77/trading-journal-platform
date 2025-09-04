import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Conexión
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function main() {
  // Insertar un nuevo registro en la tabla "profiles"
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { name: 'Juan Pérez', email: 'juanperez@example.com' }
    ])
    .select();

  if (error) {
    console.error('❌ Error al insertar:', error);
    return;
  }

  console.log('✅ Datos insertados:', data);
}

main();

