import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface UserMenuProps {
  user: any;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleProfile = () => {
    // Aquí puedes agregar la lógica para abrir el perfil
    console.log('Abrir perfil del usuario');
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms de delay antes de cerrar
    setHoverTimeout(timeout);
  };

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div className="relative">
      {/* Botón principal del menú */}
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-all duration-200 group"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xl font-medium text-white truncate max-w-[120px]">
              {user?.email?.split('@')[0] || 'Usuario'}
            </div>
            <div className="text-lg text-gray-400">Trading Journal</div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden"
        >
          {/* Header del menú */}
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl font-medium text-white truncate">
                  {user?.email?.split('@')[0] || 'Usuario'}
                </div>
                <div className="text-lg text-gray-400 truncate">
                  {user?.email || 'usuario@ejemplo.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full flex items-center space-x-3 px-4 py-2 text-xl text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Perfil</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-xl text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Desloguearse</span>
            </button>
          </div>

          {/* Footer del menú */}
          <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/50">
            <div className="text-lg text-gray-500 text-center">
              Nagual Trader Journal v1.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
