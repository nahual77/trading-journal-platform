import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Login from './Login';
import Register from './Register';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    // Verificar si hay un token de reset en la URL
    const handleResetPassword = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session) {
        // Si hay una sesión activa, verificar si es un reset de contraseña
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        
        if (type === 'recovery') {
          setIsResettingPassword(true);
          setResetMessage('Por favor, actualiza tu contraseña en la configuración de tu perfil.');
        }
      }
    };

    handleResetPassword();
  }, []);

  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Reset de Contraseña
          </h2>
          <p className="text-gray-300 text-center mb-6">
            {resetMessage}
          </p>
          <button
            onClick={() => {
              setIsResettingPassword(false);
              setResetMessage('');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
}