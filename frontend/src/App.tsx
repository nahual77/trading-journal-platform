import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import TradingJournal from './components/TradingJournal';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Detectar si es un nuevo usuario que se acaba de registrar
      if (event === 'SIGNED_IN' && session?.user) {
        // Verificar si es la primera vez que este usuario inicia sesión
        const userKey = `nagual-user-${session.user.id}`;
        const hasUsedApp = localStorage.getItem(userKey);
        
        if (!hasUsedApp) {
          setIsNewUser(true);
          localStorage.setItem(userKey, 'true');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return user ? <TradingJournal isNewUser={isNewUser} /> : <Auth />;
}

export default App;