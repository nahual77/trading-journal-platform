import { createClient } from '@supabase/supabase-js';

// Configuración híbrida: desarrollo vs producción
const isDevelopment = process.env.NODE_ENV === 'development';

const supabaseUrl = isDevelopment 
  ? process.env.SUPABASE_URL_DEV || process.env.SUPABASE_URL
  : process.env.SUPABASE_URL;

const supabaseKey = isDevelopment 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY_DEV || process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Log para verificar qué base de datos estamos usando
console.log(`🔗 Conectado a Supabase ${isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
console.log(`📍 URL: ${supabaseUrl}`);