import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserMenuProps {
  user: any;
  onLogout: () => void | Promise<void>;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    console.log('🔄 LOGOUT INICIADO');
    try {
      await onLogout();
      console.log('✅ LOGOUT EXITOSO');
    } catch (error) {
      console.error('❌ ERROR EN LOGOUT:', error);
    }
    setIsOpen(false);
  };

  const handleProfile = () => {
    console.log('👤 PROFILE CLICKED');
    setIsOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ TOGGLE CLICKED, isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Botón principal - SIN CLASES CSS */}
      <button
        onClick={toggleMenu}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#1f2937',
          border: '1px solid #4b5563',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          margin: '8px 0',
          transform: window.innerWidth <= 640 ? 'scale(0.8)' : 'scale(1)',
          transformOrigin: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1f2937';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(to right, #2563eb, #f59e0b)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={16} color="white" />
          </div>
          <div style={{ display: window.innerWidth > 640 ? 'block' : 'none' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>
              {user?.email?.split('@')[0] || 'Usuario'}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              {t('userMenu.tradingJournal')}
            </div>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          color="#9ca3af" 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} 
        />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '8px',
          width: '256px',
          backgroundColor: '#1f2937',
          border: '1px solid #4b5563',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(to right, #2563eb, #f59e0b)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={20} color="white" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email?.split('@')[0] || 'Usuario'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email || 'usuario@ejemplo.com'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px',
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Opciones */}
          <div style={{ padding: '8px 0' }}>
            <button
              onClick={handleProfile}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#d1d5db',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#d1d5db';
              }}
            >
              <Settings size={16} />
              <span>{t('userMenu.profile')}</span>
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#d1d5db',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#d1d5db';
              }}
            >
              <LogOut size={16} />
              <span>{t('userMenu.logout')}</span>
            </button>
          </div>

          {/* Footer */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid #374151', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              {t('userMenu.version')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}