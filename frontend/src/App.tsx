import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import TradingJournal from './components/TradingJournal';
import EducatorDashboard from './components/EducatorDashboard';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userType, setUserType] = useState<'individual' | 'educator' | null>(null);

  useEffect(() => {
    const session = supabase.auth.getSession();

    const loadSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);

        // El tipo de usuario se obtendrá del perfil en la base de datos.
        // Por ahora, todos los usuarios son 'individual'.
        if (session?.user) {
            setUserType('individual');
        } else {
            setUserType(null);
        }
    };
    
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (userType === 'educator') {
    return <EducatorDashboard onLogout={handleLogout} />;
  }

  return <TradingJournal isNewUser={isNewUser} user={user} />;
}

export default App;