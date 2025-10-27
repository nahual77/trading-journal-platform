import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import TradingJournal from './components/TradingJournal';
import EducatorDashboard from './components/EducatorDashboard';

function App() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
          <p className="text-gray-400 text-sm mt-2">Verificando sesión</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Aquí se podría añadir la lógica para diferenciar entre tipos de usuario
  // if (userType === 'educator') {
  //   return <EducatorDashboard onLogout={handleLogout} />;
  // }

  // Pasamos el objeto 'user' directamente al TradingJournal.
  // El hook useTradingJournalState dentro de TradingJournal lo usará para cargar los datos.
  return <TradingJournal user={user} />;
}

export default App;
