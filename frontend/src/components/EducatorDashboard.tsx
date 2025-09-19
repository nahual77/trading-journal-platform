import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import EducatorProfile from './EducatorProfile';
import LanguageSelector from './LanguageSelector';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  MessageSquare, 
  Plus, 
  Settings,
  BarChart3,
  Clock,
  Star,
  ArrowRight,
  LogOut,
  User,
  ChevronDown,
  Building2,
  BookOpen,
  MessageCircle
} from 'lucide-react';

interface EducatorStats {
  totalStudents: number;
  totalModules: number;
  activeStudents: number;
  monthlyGrowth: number;
}

interface EducatorDashboardProps {
  onLogout: () => void | Promise<void>;
}

interface Module {
  id: string;
  name: string;
  description: string;
  studentCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastActivity: string;
  order: number; // Para el orden de progresión
}

interface Student {
  id: string;
  name: string;
  email: string;
  module: string;
  lastLogin: string;
  status: 'active' | 'inactive';
  performance: 'excellent' | 'good' | 'needs_improvement';
  progress: number; // Porcentaje de progreso en el módulo
}

const EducatorDashboard: React.FC<EducatorDashboardProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<EducatorStats>({
    totalStudents: 0,
    totalModules: 0,
    activeStudents: 0,
    monthlyGrowth: 0
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  // Cargar avatar desde localStorage
  useEffect(() => {
    const savedAvatar = localStorage.getItem('educator-avatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  // Simular carga de datos
  useEffect(() => {
    // TODO: Implementar carga real de datos desde la API
    setStats({
      totalStudents: 45,
      totalModules: 3,
      activeStudents: 38,
      monthlyGrowth: 12.5
    });

    setModules([
      {
        id: '1',
        name: 'Trading Básico',
        description: 'Fundamentos del trading y conceptos básicos',
        studentCount: 25,
        status: 'active',
        createdAt: '2024-01-15',
        lastActivity: '2024-01-18',
        order: 1
      },
      {
        id: '2',
        name: 'Análisis Técnico',
        description: 'Indicadores técnicos y análisis de gráficos',
        studentCount: 15,
        status: 'active',
        createdAt: '2024-01-10',
        lastActivity: '2024-01-17',
        order: 2
      },
      {
        id: '3',
        name: 'Gestión de Riesgo',
        description: 'Control de riesgo y gestión de capital',
        studentCount: 5,
        status: 'active',
        createdAt: '2024-01-05',
        lastActivity: '2024-01-16',
        order: 3
      }
    ]);

    setRecentStudents([
      {
        id: '1',
        name: 'María González',
        email: 'maria@email.com',
        module: 'Trading Básico',
        lastLogin: '2024-01-18',
        status: 'active',
        performance: 'excellent',
        progress: 85
      },
      {
        id: '2',
        name: 'Carlos Rodríguez',
        email: 'carlos@email.com',
        module: 'Análisis Técnico',
        lastLogin: '2024-01-17',
        status: 'active',
        performance: 'good',
        progress: 60
      },
      {
        id: '3',
        name: 'Ana Martínez',
        email: 'ana@email.com',
        module: 'Trading Básico',
        lastLogin: '2024-01-16',
        status: 'inactive',
        performance: 'needs_improvement',
        progress: 30
      }
    ]);
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isUserMenuOpen && !target.closest('.educator-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (isSettingsMenuOpen && !target.closest('.settings-menu-container')) {
        setIsSettingsMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isSettingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isUserMenuOpen, isSettingsMenuOpen]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'needs_improvement': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceText = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bueno';
      case 'needs_improvement': return 'Necesita mejorar';
      default: return 'Sin evaluar';
    }
  };

  const handleCommonArea = () => {
    // TODO: Implementar navegación al área común con estudiantes
    alert('Área común con estudiantes - Próximamente');
  };

  const handleSettings = () => {
    // TODO: Implementar configuración del educador
    alert('Configuración del educador - Próximamente');
  };

  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen(!isSettingsMenuOpen);
    setIsUserMenuOpen(false); // Cerrar menú de usuario si está abierto
  };

  const handleAcademySettings = () => {
    setIsSettingsMenuOpen(false);
    alert('Configuración de Academia - Próximamente');
  };

  const handleModulesSettings = () => {
    setIsSettingsMenuOpen(false);
    alert('Configuración de Módulos - Próximamente');
  };

  const handleStudentsSettings = () => {
    setIsSettingsMenuOpen(false);
    alert('Configuración de Estudiantes - Próximamente');
  };

  const handleCommunicationSettings = () => {
    setIsSettingsMenuOpen(false);
    alert('Configuración de Comunicación - Próximamente');
  };

  const handleProfile = () => {
    setShowProfile(true);
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      try {
        await onLogout();
        console.log('✅ Logout exitoso desde EducatorDashboard');
      } catch (error) {
        console.error('❌ Error en logout desde EducatorDashboard:', error);
      }
    }
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Layout móvil */}
          <div className="lg:hidden">
            <div className="flex flex-col space-y-4 py-4">
              {/* Logo y título en móvil */}
              <div className="flex items-center justify-center space-x-4">
                <img 
                  src="/logo-growjou.png" 
                  alt="Growjou" 
                  className="h-10 w-auto"
                />
                <div className="text-center">
                  <h1 className="text-lg font-bold text-white">Dashboard del Educador</h1>
                  <p className="text-gray-400 text-xs">Gestiona tus módulos y estudiantes</p>
                </div>
              </div>
              
              {/* Botones en móvil */}
              <div className="flex flex-wrap justify-center gap-2">
                <LanguageSelector />
                
                {/* Menú desplegable de configuración para móvil - invisible pero en el header */}
                <div className="relative settings-menu-container" style={{ display: 'none' }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:bg-gray-700 text-xs"
                    onClick={toggleSettingsMenu}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configuración
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isSettingsMenuOpen ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* Menú desplegable de configuración para móvil */}
                  {isSettingsMenuOpen && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
                      style={{ 
                        zIndex: 99999,
                        position: 'absolute',
                        pointerEvents: 'auto'
                      }}
                    >
                      <div className="py-2">
                        <button
                          onClick={handleAcademySettings}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                        >
                          <Building2 className="h-3 w-3" />
                          <span>Academia</span>
                        </button>
                        
                        <button
                          onClick={handleModulesSettings}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>Módulos</span>
                        </button>
                        
                        <button
                          onClick={handleStudentsSettings}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                        >
                          <Users className="h-3 w-3" />
                          <span>Estudiantes</span>
                        </button>
                        
                        <button
                          onClick={handleCommunicationSettings}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>Comunicación</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Menú desplegable del usuario para móvil */}
                <div className="relative educator-menu-container">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-all duration-200 group"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Menú desplegable para móvil */}
                  {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
                    style={{ 
                      zIndex: '999999 !important',
                      position: 'absolute',
                      pointerEvents: 'auto'
                    }}
                    >
                      <div className="py-2">
                        <button
                          onClick={handleProfile}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                        >
                          <User className="h-3 w-3" />
                          <span>Mi Perfil</span>
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
                        >
                          <LogOut className="h-3 w-3" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Layout desktop */}
          <div className="hidden lg:flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <img 
                src="/logo-growjou.png" 
                alt="Growjou" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Título centrado */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-2xl font-bold text-white">Dashboard del Educador</h1>
              <p className="text-gray-400 text-sm">Gestiona tus módulos y estudiantes</p>
            </div>
            
            {/* Botones de acción */}
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              
              {/* Menú desplegable de configuración para desktop - invisible pero en el header */}
              <div className="relative settings-menu-container" style={{ display: 'none' }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 hover:bg-gray-700"
                  onClick={toggleSettingsMenu}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${isSettingsMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {/* Menú desplegable de configuración para desktop */}
                {isSettingsMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
                    style={{ 
                      zIndex: 99999,
                      position: 'absolute',
                      pointerEvents: 'auto'
                    }}
                  >
                    <div className="py-2">
                      <button
                        onClick={handleAcademySettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <Building2 className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Academia</span>
                      </button>
                      
                      <button
                        onClick={handleModulesSettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <BookOpen className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Módulos</span>
                      </button>
                      
                      <button
                        onClick={handleStudentsSettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <Users className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Estudiantes</span>
                      </button>
                      
                      <button
                        onClick={handleCommunicationSettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <MessageCircle className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Comunicación</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Menú desplegable del usuario */}
              <div className="relative educator-menu-container">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-all duration-200 group hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50"
                >
                  <div className="flex items-center space-x-2">
                    {avatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                        <img 
                          src={avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                        <User className="h-4 w-4 text-white transition-transform duration-200 group-hover:scale-110" />
                      </div>
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">
                        Educador
                      </div>
                      <div className="text-xs text-gray-400">Mi Perfil</div>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Menú desplegable */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
                    style={{ 
                      zIndex: '999999 !important',
                      position: 'absolute',
                      pointerEvents: 'auto'
                    }}
                  >
                    {/* Header del menú */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {avatar ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-600 flex-shrink-0">
                              <img 
                                src={avatar} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white truncate">
                              Educador
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              Dashboard del Educador
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Opciones del menú */}
                    <div className="py-2">
                      <button
                        onClick={handleProfile}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <User className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Mi Perfil</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Botones de acción para móvil */}
      <div className="lg:hidden bg-gray-800/30 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-end">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-300 hover:bg-gray-700 text-xs"
                onClick={handleCommonArea}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Área Común
              </Button>
              {/* Menú desplegable de configuración para móvil */}
              <div className="relative settings-menu-container">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 hover:bg-gray-700 text-xs"
                  onClick={toggleSettingsMenu}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Configuración
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isSettingsMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {/* Menú desplegable de configuración para móvil */}
                {isSettingsMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
                    style={{ 
                      zIndex: 99999,
                      position: 'absolute',
                      pointerEvents: 'auto'
                    }}
                  >
                    <div className="py-2">
                      <button
                        onClick={handleAcademySettings}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                      >
                        <Building2 className="h-3 w-3" />
                        <span>Academia</span>
                      </button>
                      
                      <button
                        onClick={handleModulesSettings}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>Módulos</span>
                      </button>
                      
                      <button
                        onClick={handleStudentsSettings}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                      >
                        <Users className="h-3 w-3" />
                        <span>Estudiantes</span>
                      </button>
                      
                      <button
                        onClick={handleCommunicationSettings}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>Comunicación</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción debajo del header - Desktop */}
      <div className="hidden lg:block bg-gray-800/30 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-end">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-300 hover:bg-gray-700"
                onClick={handleCommonArea}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Área Común
              </Button>
              {/* Menú desplegable de configuración para desktop */}
              <div className="relative settings-menu-container">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 hover:bg-gray-700"
                  onClick={toggleSettingsMenu}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${isSettingsMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {/* Menú desplegable de configuración para desktop */}
                {isSettingsMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
                    style={{ 
                      zIndex: 99999,
                      position: 'absolute',
                      pointerEvents: 'auto'
                    }}
                  >
                    <div className="py-2">
                      <button
                        onClick={handleAcademySettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <Building2 className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Academia</span>
                      </button>
                      
                      <button
                        onClick={handleModulesSettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <BookOpen className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Módulos</span>
                      </button>
                      
                      <button
                        onClick={handleStudentsSettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <Users className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Estudiantes</span>
                      </button>
                      
                      <button
                        onClick={handleCommunicationSettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                      >
                        <MessageCircle className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                        <span>Comunicación</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
              <p className="text-xs text-gray-400">
                +{stats.monthlyGrowth}% este mes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Módulos</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalModules}</div>
              <p className="text-xs text-gray-400">
                {modules.filter(m => m.status === 'active').length} activos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Estudiantes Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeStudents}</div>
              <p className="text-xs text-gray-400">
                {Math.round((stats.activeStudents / stats.totalStudents) * 100)}% del total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Crecimiento</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+{stats.monthlyGrowth}%</div>
              <p className="text-xs text-gray-400">
                vs mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-700">
            <TabsTrigger value="modules" className="data-[state=active]:bg-blue-600">
              Mis Módulos
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-blue-600">
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
              Analíticas
            </TabsTrigger>
          </TabsList>

          {/* Módulos Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Mis Módulos</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Crear Módulo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.sort((a, b) => a.order - b.order).map((module) => (
                <Card key={module.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{module.name}</CardTitle>
                      <Badge 
                        variant={module.status === 'active' ? 'default' : 'secondary'}
                        className={module.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
                      >
                        {module.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {module.description}
                    </CardDescription>
                    <div className="text-xs text-gray-500">
                      Creado el {new Date(module.createdAt).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Estudiantes:</span>
                        <span className="text-white font-medium">{module.studentCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Orden:</span>
                        <span className="text-white text-sm">#{module.order}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Última actividad:</span>
                        <span className="text-white text-sm">{new Date(module.lastActivity).toLocaleDateString()}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        onClick={() => setSelectedModule(module.id)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Ver Módulo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Estudiantes Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Estudiantes Recientes</h2>
              <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                Ver Todos
              </Button>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-medium">Estudiante</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Módulo</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Progreso</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Último Acceso</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Rendimiento</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentStudents.map((student) => (
                        <tr key={student.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                          <td className="p-4">
                            <div>
                              <div className="text-white font-medium">{student.name}</div>
                              <div className="text-gray-400 text-sm">{student.email}</div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{student.module}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-300 text-sm">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{new Date(student.lastLogin).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getPerformanceColor(student.performance)}`}></div>
                              <span className="text-gray-300 text-sm">
                                {getPerformanceText(student.performance)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant={student.status === 'active' ? 'default' : 'secondary'}
                              className={student.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
                            >
                              {student.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analíticas Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Analíticas</h2>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Próximamente</CardTitle>
                <CardDescription className="text-gray-400">
                  Gráficos y estadísticas detalladas estarán disponibles pronto
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Perfil */}
      {showProfile && (
        <EducatorProfile 
          onClose={() => setShowProfile(false)} 
          onAvatarChange={setAvatar}
        />
      )}
    </div>
  );
};

export default EducatorDashboard;
