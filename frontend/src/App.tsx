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
    
    // Agregar timeout para evitar cierre prematuro en móviles
    const timeoutId = setTimeout(() => {
      console.log('App: Timeout alcanzado, estableciendo loading=false');
      setLoading(false);
    }, 5000);
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('App: getSession result', { session, error, hasUser: !!session?.user });
      clearTimeout(timeoutId);
      setUser(session?.user ?? null);
      
      // Detectar tipo de usuario desde localStorage
      if (session?.user) {
        const storedUserType = localStorage.getItem(`user-type-${session.user.id}`);
        console.log('App: UserType desde localStorage:', storedUserType);
        setUserType(storedUserType as 'individual' | 'educator' || 'individual');
      } else {
        console.log('App: No hay sesión, estableciendo userType=null');
        setUserType(null);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('App: Error en getSession', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('App: Auth state change', { event, session, user: session?.user, hasUser: !!session?.user });
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Detectar tipo de usuario
      if (session?.user) {
        const storedUserType = localStorage.getItem(`user-type-${session.user.id}`);
        console.log('App: onAuthStateChange - UserType desde localStorage:', storedUserType);
        setUserType(storedUserType as 'individual' | 'educator' || 'individual');
      } else {
        console.log('App: onAuthStateChange - No hay sesión, estableciendo userType=null');
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

  // Función para manejar logout
  const handleLogout = async () => {
    console.log('🔄 App: Iniciando logout...');
    try {
      console.log('🔄 App: Llamando a supabase.auth.signOut()...');
      const result = await supabase.auth.signOut();
      console.log('🔄 App: Resultado de signOut:', result);
      // El estado del usuario se maneja a través de onAuthStateChange
    } catch (error) {
      console.error('❌ App: Error al cerrar sesión:', error);
    }
  };

  console.log('App: Render state', { loading, user, isNewUser, userType });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
          <p className="text-gray-400 text-sm mt-2">Verificando autenticación</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Mostrar dashboard según el tipo de usuario
  if (userType === 'educator') {
    return <EducatorDashboard onLogout={handleLogout} />;
  }

  return <TradingJournal isNewUser={isNewUser} user={user} />;
}

export default App;