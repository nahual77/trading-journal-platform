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
      // Simular login exitoso
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
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
}
