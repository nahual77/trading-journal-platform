import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import TradingJournal from './components/TradingJournal';
import EducatorDashboard from './components/EducatorDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userType, setUserType] = useState<'individual' | 'educator' | null>(null);

  useEffect(() => {
    console.log('App: Iniciando useEffect');
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('App: getSession result', { session, error });
      setUser(session?.user ?? null);
      
      // Detectar tipo de usuario desde localStorage
      if (session?.user) {
        const storedUserType = localStorage.getItem(`user-type-${session.user.id}`);
        setUserType(storedUserType as 'individual' | 'educator' || 'individual');
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('App: Error en getSession', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('App: Auth state change', { event, session, user: session?.user });
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Detectar tipo de usuario
      if (session?.user) {
        const storedUserType = localStorage.getItem(`user-type-${session.user.id}`);
        setUserType(storedUserType as 'individual' | 'educator' || 'individual');
      } else {
        setUserType(null);
      }
      
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
      
      // Limpiar isNewUser cuando se cierra sesión
      if (event === 'SIGNED_OUT') {
        setIsNewUser(false);
        setUserType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log('App: Render state', { loading, user, isNewUser, userType });

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  // Mostrar dashboard según el tipo de usuario
  if (userType === 'educator') {
    return <EducatorDashboard />;
  }

  return <TradingJournal isNewUser={isNewUser} user={user} />;
}

export default App;