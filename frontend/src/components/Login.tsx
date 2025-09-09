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
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  
  // Estados para animaciones
  const [showLogo, setShowLogo] = useState(true);
  const [logoInCenter, setLogoInCenter] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Control de animaciones
  useEffect(() => {
    // 1. Logo aparece en fade
    const timer1 = setTimeout(() => setShowLogo(true), 300);
    
    // 2. Logo se mantiene en el centro por 3 segundos
    const timer2 = setTimeout(() => setLogoInCenter(false), 3500);
    
    // 3. Contenido aparece desde los lados
    const timer3 = setTimeout(() => setShowContent(true), 4000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

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
      alert(error.message);
    } else {
      setRecoveryMessage('Se ha enviado un enlace de recuperación a tu email');
    }

    setRecoveryLoading(false);
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
    } catch (error: any) {
      console.error('Error general en login con Google:', error);
      setRegisterError('Error inesperado al iniciar sesión con Google.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    console.log('🚀 INICIANDO handleRegister');
    e.preventDefault();
    console.log('🚀 Formulario enviado, datos:', registerData);
    
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterMessage('');

    // Validaciones básicas
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

    // Verificar si el email ya existe antes de intentar crear
    try {
      console.log('🔍 Verificando si el email ya existe:', registerData.email);
      
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: registerData.email,
        password: 'dummy_password_to_check_if_exists'
      });

      console.log('🔍 Resultado de verificación:', { existingUser, checkError });

      // Si hay error de "invalid credentials", significa que el email existe pero la contraseña es incorrecta
      if (checkError && checkError.message.includes('Invalid login credentials')) {
        console.log('❌ Email ya existe - bloqueando registro');
        setRegisterError('Este email ya está registrado. Usa otro email o intenta iniciar sesión.');
        setRegisterLoading(false);
        return;
      }

      console.log('✅ Email disponible, procediendo con registro');
      
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
          },
        },
      });

      console.log('📊 Respuesta de Supabase:', { data, error });
      console.log('📊 data.user:', data.user);
      console.log('📊 data.session:', data.session);

      if (error) {
        console.log('❌ Error de Supabase:', error);
        
        // Manejar errores específicos de Supabase
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('already registered') || 
            errorMessage.includes('user already registered') ||
            errorMessage.includes('already been registered') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('duplicate') ||
            errorMessage.includes('already in use') ||
            errorMessage.includes('email already') ||
            errorMessage.includes('user exists') ||
            errorMessage.includes('email address is already') ||
            errorMessage.includes('user with this email') ||
            errorMessage.includes('email is already taken') ||
            errorMessage.includes('email has already been registered')) {
          setRegisterError('Este email ya está registrado. Usa otro email o intenta iniciar sesión.');
        } else {
          setRegisterError(error.message || 'Error al crear la cuenta');
        }
        setRegisterLoading(false);
        return;
      }

      // Usuario creado exitosamente (ya verificamos que no existe)
      if (data.user && data.user.id) {
        console.log('✅ Usuario registrado exitosamente:', data.user);
        
        // Verificar si el usuario necesita confirmación de email
        if (data.user.email_confirmed_at) {
          setRegisterMessage('¡Cuenta creada y confirmada exitosamente!');
        } else {
          setRegisterMessage('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.');
        }
        
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

  return (
    <div className="h-screen w-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #000000 0%, #000000 20%, #111827 40%, #111827 60%, #000000 80%, #000000 100%)'
    }}>
      {/* Logo con animaciones - Responsive */}
      <img
        src="/logo-growjou.png"
        alt="GrowJou - My Trading Journal"
        className={`block opacity-100 transition-all duration-1000 ease-out ${
          logoInCenter ? 'fixed' : 'absolute'
        }`}
        style={{ 
          height: isMobile ? '80px' : '200px',
          width: 'auto',
          maxWidth: isMobile ? '85%' : '90%',
          objectFit: 'contain',
          position: logoInCenter ? 'fixed' : 'absolute',
          top: logoInCenter ? '50%' : '15px',
          left: '50%',
          transform: logoInCenter 
            ? 'translate(-50%, -50%) scale(1.1)' 
            : 'translate(-50%, 0) scale(1)',
          zIndex: logoInCenter ? 20 : 10,
          transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      />

      {/* Contenido principal responsive */}
      <div className="h-full flex flex-col lg:flex-row">
        {/* Contenido en móvil: vertical, en desktop: horizontal */}
        <div className={`flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between p-2 lg:p-8 transition-all duration-800 ease-out ${
          showContent 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-8'
        } ${logoInCenter ? 'pt-24 lg:pt-64' : 'pt-16 lg:pt-32'}`}>
        {/* Panel izquierdo - Información de la empresa */}
        <div className={`flex-1 lg:flex-1 flex items-center justify-center transition-all duration-600 ease-out delay-300 ${
          showContent 
            ? 'opacity-100 transform translate-x-0' 
            : 'opacity-0 transform -translate-x-12'
        }`}>
          <div className="text-center max-w-lg lg:max-w-xl flex items-center justify-center h-full px-2 lg:px-4">
            {/* Texto descriptivo */}
            <div className="space-y-3 lg:space-y-8 text-gray-300">
              <div className="space-y-2 lg:space-y-6">
                <p className="text-sm lg:text-2xl leading-relaxed text-center font-light">
                  La plataforma profesional para traders que buscan
                  <span className="text-yellow-400 font-semibold"> crecer consistentemente</span> en los mercados.
                </p>
                <p className="text-xs lg:text-xl text-center leading-relaxed font-light">
                  Registra, analiza y optimiza tus operaciones con herramientas
                  avanzadas de análisis y seguimiento de rendimiento.
                </p>
                <p className="text-sm lg:text-2xl text-center leading-relaxed font-bold text-yellow-400">
                  ¡Crea una cuenta gratuita y regístra tu operativa como un pro!
                </p>
              </div>

              {/* Estadísticas - Responsive */}
              <div className="flex justify-center space-x-4 lg:space-x-16 mt-4 lg:mt-16">
                <div className="text-center">
                  <div className="text-xl lg:text-5xl font-bold text-yellow-400 mb-1 lg:mb-2">100%</div>
                  <div className="text-xs lg:text-lg text-gray-400 font-medium">Gratuito</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-5xl font-bold text-yellow-400 mb-1 lg:mb-2">∞</div>
                  <div className="text-xs lg:text-lg text-gray-400 font-medium">Operaciones</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-5xl font-bold text-yellow-400 mb-1 lg:mb-2">24/7</div>
                  <div className="text-xs lg:text-lg text-gray-400 font-medium">Disponible</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de acceso */}
        <div className={`flex-1 lg:flex-1 flex items-center justify-center transition-all duration-600 ease-out delay-500 ${
          showContent 
            ? 'opacity-100 transform translate-x-0' 
            : 'opacity-0 transform translate-x-12'
        }`}>
          <div className="w-full max-w-xs lg:max-w-sm mx-2 lg:mx-0">
            {/* Formulario de login */}
            <div className="card-premium">
              <h2 className="text-base lg:text-xl font-bold text-white mb-3 lg:mb-5 text-center">Iniciar Sesión</h2>

              <form onSubmit={handleLogin} className="space-y-2 lg:space-y-4">
                <div className="w-full mx-auto">
                  <label className="block text-xs font-medium text-gray-300 mb-1 text-center">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium pl-8 w-full text-xs lg:text-sm py-2 lg:py-2"
                      required
                    />
                  </div>
                </div>

                <div className="w-full mx-auto">
                  <label className="block text-xs font-medium text-gray-300 mb-1 text-center">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-premium pl-8 w-full text-xs lg:text-sm py-2 lg:py-2"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-2 lg:py-2 text-xs lg:text-sm"
                >
                  {loading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <LogIn className="h-3 w-3" />
                  )}
                  <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
                </button>
              </form>

              {/* Opciones adicionales */}
              <div className="mt-3 lg:mt-5 pt-3 lg:pt-5 border-t border-gray-700 space-y-2 lg:space-y-3">
                {/* Botón de registro */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2">
                    ¿No tienes cuenta?
                  </p>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-2 py-2 lg:py-2 bg-green-600/10 border border-green-600/30 text-green-400 rounded-lg hover:bg-green-600/20 hover:border-green-600/50 transition-colors text-xs lg:text-sm"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>Crear Cuenta</span>
                  </button>
                </div>

                {/* Recuperar contraseña */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2">
                    ¿Olvidaste tu contraseña?
                  </p>
                  <button
                    onClick={handlePasswordRecovery}
                    disabled={recoveryLoading || !email}
                    className="w-full flex items-center justify-center space-x-2 px-2 py-2 lg:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs lg:text-sm"
                  >
                    {recoveryLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Mail className="h-3 w-3" />
                    )}
                    <span>
                      {recoveryLoading ? 'Enviando...' : 'Recuperar Contraseña'}
                    </span>
                  </button>

                  {recoveryMessage && (
                    <div className="mt-2 p-2 bg-green-900/30 border border-green-600/30 rounded-lg">
                      <p className="text-xs text-green-400">{recoveryMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:border-opacity-70 focus:bg-gray-700 focus:bg-opacity-70 transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:border-opacity-70 focus:bg-gray-700 focus:bg-opacity-70 transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:border-opacity-70 focus:bg-gray-700 focus:bg-opacity-70 transition-all duration-200 backdrop-blur-sm"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 border-opacity-50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:border-opacity-70 focus:bg-gray-700 focus:bg-opacity-70 transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                onClick={() => console.log('🖱️ Botón Crear Cuenta clickeado')}
                className="w-full bg-blue-600 bg-opacity-50 hover:bg-blue-600 hover:bg-opacity-70 text-white font-medium py-2 px-4 rounded-lg border border-blue-500 border-opacity-50 hover:border-blue-400 hover:border-opacity-70 transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500 hover:shadow-opacity-20"
              >
                {registerLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              {/* Separador */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-600"></div>
                <span className="px-3 text-sm text-gray-400">o</span>
                <div className="flex-1 border-t border-gray-600"></div>
              </div>

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
    </div>
  );
}