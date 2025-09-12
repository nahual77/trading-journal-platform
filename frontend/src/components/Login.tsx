import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LogIn, RefreshCw, UserPlus, X } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

interface LoginProps {
  onSwitchToRegister?: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Detectar orientación
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth <= 1024);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  
  // Sin animaciones - layout simple

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRegisterError(''); // Limpiar errores previos

    try {
      console.log('🔄 Intentando iniciar sesión:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

      console.log('📊 Respuesta de login:', { data, error });

      if (error) {
        console.error('Error al iniciar sesión:', error);
        
        // Manejar errores específicos de login
        if (error.message.includes('Invalid login credentials') ||
            error.message.includes('Invalid email or password') ||
            error.message.includes('Invalid credentials')) {
          setRegisterError('Email o contraseña incorrectos. Verifica tus datos.');
        } else if (error.message.includes('Email not confirmed')) {
          setRegisterError('Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
        } else {
          setRegisterError(error.message || 'Error al iniciar sesión');
        }
      } else if (data.user) {
        console.log('✅ Login exitoso:', data.user);
        // El usuario será redirigido automáticamente por el App.tsx
        // Limpiar errores previos
        setRegisterError('');
      }
    } catch (error: any) {
      console.error('Error general en login:', error);
      setRegisterError('Error inesperado al iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
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
      console.error('Error al enviar email de recuperación:', error);
      setRecoveryMessage('Error al enviar email de recuperación. Intenta nuevamente.');
    } else {
      setRecoveryMessage('Email de recuperación enviado. Revisa tu bandeja de entrada.');
    }

    setRecoveryLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterMessage('');

    console.log('🔄 Iniciando registro:', registerData);

    // Validaciones básicas
    if (!registerData.name.trim()) {
      console.log('❌ Nombre vacío');
      setRegisterError('El nombre es requerido');
      setRegisterLoading(false);
      return;
    }

    if (!registerData.email.trim()) {
      console.log('❌ Email vacío');
      setRegisterError('El email es requerido');
      setRegisterLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      console.log('❌ Contraseñas no coinciden');
      setRegisterError('Las contraseñas no coinciden');
      setRegisterLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      console.log('❌ Contraseña muy corta');
      setRegisterError('La contraseña debe tener al menos 6 caracteres');
      setRegisterLoading(false);
      return;
    }

    console.log('✅ Validaciones pasadas, procediendo con Supabase');

    // Proceder directamente con el registro - Supabase manejará si el email ya existe
    try {
      console.log('🔄 Creando usuario en Supabase...');
      
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            full_name: registerData.name
          }
        }
      });

      console.log('📊 Respuesta de registro:', { data, error });

      if (error) {
        console.error('❌ Error en registro:', error);
        
        if (error.message.includes('User already registered')) {
          setRegisterError('Este email ya está registrado. Intenta iniciar sesión.');
        } else if (error.message.includes('Invalid email')) {
          setRegisterError('El email no es válido. Verifica el formato.');
        } else {
          setRegisterError(error.message || 'Error al crear la cuenta');
        }
        setRegisterLoading(false);
        return;
      }

      // Usuario creado exitosamente (ya verificamos que no existe)
      if (data.user && data.user.id) {
        console.log('✅ Usuario registrado exitosamente:', data.user);
        setRegisterError('');
        setRegisterMessage('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.');
        
        // Cerrar modal después de 8 segundos
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
          setRegisterMessage('');
        }, 8000);
      } else {
        // Si no hay error pero tampoco hay usuario válido
        console.log('❌ No se creó usuario');
        console.log('❌ data.user es:', data.user);
        setRegisterError('Error al crear la cuenta. Intenta nuevamente.');
        setRegisterLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      setRegisterError(error.message || 'Error al crear la cuenta');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🔄 Iniciando login con Google');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173'
        }
      });

      if (error) {
        console.error('Error en login con Google:', error);
        setRegisterError('Error al iniciar sesión con Google. Intenta nuevamente.');
      } else {
        console.log('✅ Redirigiendo a Google:', data);
      }
    } catch (error) {
      console.error('Error general en Google login:', error);
      setRegisterError('Error al iniciar sesión con Google. Intenta nuevamente.');
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #000000 0%, #000000 20%, #111827 40%, #111827 60%, #000000 80%, #000000 100%)'
    }}>
      {/* Logo */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-4 lg:pt-6">
        <img 
          src="/logo-growjou.png" 
          alt="GrowJou" 
          className="h-8 w-8 lg:h-10 lg:w-10"
        />
      </div>

      {/* Contenido principal */}
      <div className="h-full flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Formulario de Login */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-500 border-opacity-50 rounded-xl p-6 lg:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Iniciar Sesión
              </h1>
            </div>

            {/* Mensaje de error */}
            {registerError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-600/30 rounded-lg">
                <p className="text-sm text-red-400">{registerError}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tu contraseña"
                    required
                  />
                </div>
              </div>

              {/* Botón de Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 lg:py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                <span>
                  {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                </span>
              </button>

              {/* Recuperar contraseña */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handlePasswordRecovery}
                  disabled={recoveryLoading}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {recoveryLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Enviando...</span>
                    </span>
                  ) : (
                    '¿Olvidaste tu contraseña?'
                  )}
                </button>

                {recoveryMessage && (
                  <div className="mt-2 p-2 bg-green-900/30 border border-green-600/30 rounded-lg">
                    <p className="text-xs text-green-400">{recoveryMessage}</p>
                  </div>
                )}
              </div>

              {/* Crear cuenta */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-2 py-2 lg:py-2 text-xs lg:text-sm bg-green-600/10 border border-green-600/30 text-green-400 rounded-lg hover:bg-green-600/20 hover:border-green-600/50 transition-colors"
                >
                  <UserPlus className="h-3 w-3" />
                  <span>Crear Cuenta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 text-center py-2 lg:py-4">
        <p className="text-xs lg:text-sm text-gray-500 px-4">
          © 2025 GrowJou. Diseñado para todos los traders.
        </p>
      </div>

      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-500 border-opacity-50 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Crear Cuenta</h3>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegisterError('');
                  setRegisterMessage('');
                  setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Mensaje de error */}
              {registerError && (
                <div className="p-3 bg-red-900/30 border border-red-600/30 rounded-lg">
                  <p className="text-sm text-red-400">{registerError}</p>
                </div>
              )}

              {/* Mensaje de éxito */}
              {registerMessage && (
                <div className="p-3 bg-green-900/30 border border-green-600/30 rounded-lg">
                  <p className="text-sm text-green-400">{registerMessage}</p>
                </div>
              )}

              {/* Nombre */}
              <div>
                <label htmlFor="registerName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre completo
                </label>
                <input
                  id="registerName"
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="registerEmail"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  id="registerPassword"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="registerConfirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  id="registerConfirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>

              {/* Botón de registro */}
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {registerLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span>
                  {registerLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </span>
              </button>

              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium py-2 px-4 rounded-lg border border-gray-500 border-opacity-50 hover:border-gray-400 hover:border-opacity-70 transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar con Google</span>
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
