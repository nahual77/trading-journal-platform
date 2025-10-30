// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Cargar las variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén presentes
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Anon Key are required. Make sure to set them in your .env file.");
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
