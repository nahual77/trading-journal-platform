import { useState } from 'react';
import { supabase } from '../supabaseClient';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) alert(error.message);
    else alert('Revisa tu email para confirmar!');
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Crear Cuenta</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded"
        >
          Registrarse
        </button>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full p-2 mt-2 text-blue-500 underline"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </form>
    </div>
  );
}