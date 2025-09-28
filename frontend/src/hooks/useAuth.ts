import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState({
          user: session?.user || null,
          loading: false
        });
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          loading: false
        });
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user || null,
          loading: false
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: authState.user,
    loading: authState.loading
  };
};
