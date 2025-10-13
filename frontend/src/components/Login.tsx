import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LogIn, RefreshCw, UserPlus, X } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import LanguageSelector from './LanguageSelector';

interface LoginProps {
  onSwitchToRegister?: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [loginError, setLoginError] = useState('');
  const [userType, setUserType] = useState<'individual' | 'academy'>('individual');
  const [academyRole, setAcademyRole] = useState<'educator' | 'student'>('educator');
  const [academyCode, setAcademyCode] = useState('');
  const [showLogo, setShowLogo] = useState(true);
  const [logoInCenter, setLogoInCenter] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowLogo(true), 100);
    const timer2 = setTimeout(() => setLogoInCenter(false), 400);
    const timer3 = setTimeout(() => setShowContent(true), 600);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError(error.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      setLoginError('Error inesperado al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    // Lógica de recuperación
  };

  const handleGoogleLogin = async () => {
    // Lógica de Google Login
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterMessage('');
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Las contraseñas no coinciden');
      setRegisterLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: { data: { name: registerData.name } },
      });
      if (error) {
        setRegisterError(error.message || 'Error al crear la cuenta');
      } else {
        setRegisterMessage('¡Cuenta creada! Revisa tu email para confirmar.');
        setTimeout(() => setShowRegisterModal(false), 5000);
      }
    } catch (error: any) {
      setRegisterError('Error inesperado al registrar.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #000000 20%, #111827 40%, #111827 60%, #000000 80%, #000000 100%)' }}>
      {/* ... El resto del JSX del componente Login ... */}
      {/* (Omitido por brevedad, es el mismo que ya tenías) */}
    </div>
  );
}