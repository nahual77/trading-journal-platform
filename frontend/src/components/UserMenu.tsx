import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserMenuProps {
  user: any;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    console.log('🔄 Iniciando logout...');
    onLogout();
    setIsOpen(false);
    console.log('✅ Logout completado');
  };

  const handleProfile = () => {
    console.log('👤 Abrir perfil del usuario');
    setIsOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ Toggle menu clicked, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.user-menu-container')) {
        console.log('🖱️ Click outside detected, closing menu');
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative user-menu-container">
      {/* Botón principal del menú - SIN clases problemáticas */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg my-2"
        style={{ 
          transform: window.innerWidth <= 640 ? 'scale(0.8)' : 'scale(1)',
          transformOrigin: 'center'
        }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-white truncate max-w-[120px]">
              {user?.email?.split('@')[0] || 'Usuario'}
            </div>
            <div className="text-xs text-gray-400">{t('userMenu.tradingJournal')}</div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-[9999] overflow-hidden">
          {/* Header del menú */}
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white truncate">
                    {user?.email?.split('@')[0] || 'Usuario'}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {user?.email || 'usuario@ejemplo.com'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white flex-shrink-0"
                title="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              <span>{t('userMenu.profile')}</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('userMenu.logout')}</span>
            </button>
          </div>

          {/* Footer del menú */}
          <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/50">
            <div className="text-xs text-gray-500 text-center">
              {t('userMenu.version')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}