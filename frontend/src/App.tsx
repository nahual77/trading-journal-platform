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
    
    // Función para cargar sesión
    const loadSession = () => {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        console.log('App: getSession result', { session, error, hasUser: !!session?.user });
        
        setUser(session?.user ?? null);
        setLoading(false);
        
        // El tipo de usuario se obtendrá del perfil en la base de datos.
        // Por ahora, todos los usuarios son 'individual'.
        if (session?.user) {
          setUserType('individual');
        } else {
          setUserType(null);
        }
      });
    };
    
    // Cargar sesión inicial
    loadSession();
    
    // Escuchar cambios de autenticación solo para logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('App: Auth state change', { event, session, user: session?.user, hasUser: !!session?.user });
      
      // Solo procesar logout explícito
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserType(null);
        setLoading(false);
      }
      // Para login, recargar la sesión
      else if (event === 'SIGNED_IN') {
        loadSession();
      }
      
      // La lógica de "nuevo usuario" se basará en si existe un perfil en la BD.
      if (event === 'SIGNED_IN' && session?.user) {
        setIsNewUser(false); // Asumir que no es nuevo por ahora.
      }
      
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