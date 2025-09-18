// supabaseClient.ts
// Temporalmente comentado para solucionar error de Vite
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = 'https://qxofbcfindfglcbkckxs.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4b2ZiY2ZpbmRmZ2xjYmtja3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzI5NjUsImV4cCI6MjA3MjM0ODk2NX0.mc0Ifyk44qviQS6WJQDA2M7i0AYkWaCITPYMjSeaQ0A'

// export const supabase = createClient(supabaseUrl, supabaseKey)

// Mock temporal para que funcione el frontend
let currentUser = null;
let currentSession = null;
let authCallbacks = [];

// Almacén de contraseñas de usuarios (en un proyecto real esto estaría en la base de datos)
const getUserPasswords = () => {
  try {
    const stored = localStorage.getItem('mock-user-passwords');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveUserPassword = (email: string, password: string) => {
  const passwords = getUserPasswords();
  passwords[email] = password;
  localStorage.setItem('mock-user-passwords', JSON.stringify(passwords));
  console.log('Mock: Contraseña guardada para', email);
};

// Cargar sesión persistente desde localStorage
const loadPersistedSession = () => {
  try {
    const storedUser = localStorage.getItem('supabase-mock-user');
    const storedSession = localStorage.getItem('supabase-mock-session');
    
    if (storedUser && storedSession) {
      currentUser = JSON.parse(storedUser);
      currentSession = JSON.parse(storedSession);
      console.log('Mock: Sesión cargada desde localStorage', { currentUser, currentSession });
    }
  } catch (error) {
    console.error('Mock: Error cargando sesión persistente:', error);
  }
};

// Cargar sesión al inicializar
loadPersistedSession();

export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: currentSession }, error: null }),
    onAuthStateChange: (callback: any) => {
      authCallbacks.push(callback);
      // Simular cambio de estado inmediatamente si hay usuario
      if (currentUser) {
        setTimeout(() => callback('SIGNED_IN', { user: currentUser, session: currentSession }), 100);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signIn: () => Promise.resolve({ data: null, error: null }),
    signOut: () => {
      console.log('🔄 Cerrando sesión...');
      currentUser = null;
      currentSession = null;
      
      // Limpiar sesión de localStorage
      localStorage.removeItem('supabase-mock-user');
      localStorage.removeItem('supabase-mock-session');
      console.log('Mock: Sesión eliminada de localStorage');
      
      // Notificar a todos los callbacks del cambio de estado
      authCallbacks.forEach(callback => {
        setTimeout(() => callback('SIGNED_OUT', { user: null, session: null }), 100);
      });
      
      return Promise.resolve({ error: null });
    },
    signInWithPassword: (credentials: any) => {
      console.log('Intentando iniciar sesión:', credentials.email);
      
      const passwords = getUserPasswords();
      const storedPassword = passwords[credentials.email];
      
      // Si no existe el usuario, crear uno con la contraseña proporcionada
      if (!storedPassword) {
        console.log('Mock: Usuario nuevo, creando cuenta');
        saveUserPassword(credentials.email, credentials.password);
      } else if (storedPassword !== credentials.password) {
        console.log('Mock: Contraseña incorrecta');
        return Promise.resolve({ 
          data: { user: null, session: null }, 
          error: { message: 'Contraseña incorrecta' } 
        });
      }
      
      // Login exitoso
      const user = { 
        id: 'mock-user-id', 
        email: credentials.email,
        created_at: new Date().toISOString()
      };
      const session = { 
        access_token: 'mock-token',
        user: user
      };
      
      currentUser = user;
      currentSession = session;
      
      // Guardar sesión en localStorage para persistencia
      localStorage.setItem('supabase-mock-user', JSON.stringify(user));
      localStorage.setItem('supabase-mock-session', JSON.stringify(session));
      console.log('Mock: Sesión guardada en localStorage');
      
      // Notificar a todos los callbacks del cambio de estado
      authCallbacks.forEach(callback => {
        setTimeout(() => callback('SIGNED_IN', { user, session }), 100);
      });
      
      return Promise.resolve({ 
        data: { user, session }, 
        error: null 
      });
    },
    signUp: (credentials: any) => {
      console.log('Intentando crear cuenta:', credentials.email);
      
      // Guardar la contraseña del nuevo usuario
      saveUserPassword(credentials.email, credentials.password);
      
      // Simular registro exitoso
      const user = { 
        id: 'mock-user-id', 
        email: credentials.email,
        created_at: new Date().toISOString()
      };
      const session = { 
        access_token: 'mock-token',
        user: user
      };
      
      currentUser = user;
      currentSession = session;
      
      // Guardar sesión en localStorage para persistencia
      localStorage.setItem('supabase-mock-user', JSON.stringify(user));
      localStorage.setItem('supabase-mock-session', JSON.stringify(session));
      console.log('Mock: Sesión guardada en localStorage');
      
      // Notificar a todos los callbacks del cambio de estado
      authCallbacks.forEach(callback => {
        setTimeout(() => callback('SIGNED_IN', { user, session }), 100);
      });
      
      return Promise.resolve({ 
        data: { user, session }, 
        error: null 
      });
    },
    updateUser: (updates: any) => {
      console.log('Mock: Actualizando usuario:', updates);
      
      if (updates.password && currentUser) {
        // Actualizar la contraseña del usuario actual
        saveUserPassword(currentUser.email, updates.password);
        console.log('Mock: Contraseña actualizada para', currentUser.email);
        
        // Actualizar timestamp del usuario
        currentUser.updated_at = new Date().toISOString();
        localStorage.setItem('supabase-mock-user', JSON.stringify(currentUser));
        console.log('Mock: Usuario actualizado en localStorage');
        
        return Promise.resolve({ 
          data: { user: currentUser }, 
          error: null 
        });
      }
      
      return Promise.resolve({ 
        data: { user: currentUser }, 
        error: null 
      });
    },
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
}
