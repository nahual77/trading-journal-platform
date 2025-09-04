import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LogIn, RefreshCw, UserPlus } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister?: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      alert(error.message);
    }
    
    setLoading(false);
  };

  const handlePasswordRecovery = async () => {
    if (!email) {
      alert('Por favor ingresa tu email primero');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert(error.message);
    } else {
      setRecoveryMessage('Se ha enviado un enlace de recuperación a tu email');
    }

    setRecoveryLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-md w-full mx-4">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gold-300 mb-2">Nagual Trader</h1>
          <p className="text-gray-400">Inicia sesión en tu diario de trading</p>
        </div>

        {/* Formulario de login */}
        <div className="card-premium">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="max-w-sm mx-auto">
              <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium pl-10 w-full"
                  required
                />
              </div>
            </div>

            <div className="max-w-sm mx-auto">
              <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-10 w-full"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
            </button>
          </form>

          {/* Opciones adicionales */}
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
            {/* Botón de registro */}
            {onSwitchToRegister && (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3">
                  ¿No tienes cuenta?
                </p>
                <button
                  onClick={onSwitchToRegister}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600/10 border border-green-600/30 text-green-400 rounded-lg hover:bg-green-600/20 hover:border-green-600/50 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Crear Cuenta</span>
                </button>
              </div>
            )}

            {/* Recuperar contraseña */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">
                ¿Olvidaste tu contraseña?
              </p>
              <button
                onClick={handlePasswordRecovery}
                disabled={recoveryLoading || !email}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recoveryLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>
                  {recoveryLoading ? 'Enviando...' : 'Recuperar Contraseña'}
                </span>
              </button>
              
              {recoveryMessage && (
                <div className="mt-3 p-3 bg-green-900/30 border border-green-600/30 rounded-lg">
                  <p className="text-sm text-green-400">{recoveryMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Nagual Trader Journal. Diseñado para traders profesionales.
          </p>
        </div>
      </div>
    </div>
  );
}