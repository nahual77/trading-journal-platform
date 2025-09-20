import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Eye, 
  Settings, 
  Monitor,
  Smartphone,
  BarChart3,
  MessageSquare,
  BookOpen,
  Calendar,
  Shield,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const CommonAreaSection: React.FC = () => {
  const { t } = useTranslation();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Configuración del área común
  const [commonAreaConfig, setCommonAreaConfig] = useState({
    // Contenido visible
    showModules: true,
    showProgress: true,
    showStatistics: true,
    showCalendar: true,
    showResources: true,
    
    // Interacciones
    enableChat: true,
    enableForums: true,
    enableQnA: true,
    enableFileSharing: true,
    
    // Permisos por módulo
    modulePermissions: [
      { id: 1, name: 'Análisis Técnico', visible: true, canInteract: true },
      { id: 2, name: 'Gestión de Riesgo', visible: true, canInteract: true },
      { id: 3, name: 'Psicología del Trading', visible: false, canInteract: false },
      { id: 4, name: 'Estrategias Avanzadas', visible: true, canInteract: false }
    ],
    
    // Configuración de chat
    chatSettings: {
      allowPrivateMessages: true,
      allowGroupChats: true,
      moderationEnabled: true,
      messageHistory: 30 // días
    }
  });

  const handleToggleSetting = (setting: string) => {
    setCommonAreaConfig(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleModuleToggle = (moduleId: number, type: 'visible' | 'interact') => {
    setCommonAreaConfig(prev => ({
      ...prev,
      modulePermissions: prev.modulePermissions.map(module =>
        module.id === moduleId 
          ? { ...module, [type === 'visible' ? 'visible' : 'canInteract']: !module[type === 'visible' ? 'visible' : 'canInteract'] }
          : module
      )
    }));
  };

  const handlePreviewMode = () => {
    setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Área Común</h1>
          <p className="text-gray-400">Configura qué ven y cómo interactúan los estudiantes</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className={previewMode === 'desktop' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className={previewMode === 'mobile' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
          </div>
          <Button
            onClick={handlePreviewMode}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Configuración */}
        <div className="space-y-6">
          {/* Contenido Visible */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span>Contenido Visible</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Qué elementos pueden ver los estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'showModules', label: 'Módulos del Curso', icon: BookOpen },
                { key: 'showProgress', label: 'Progreso Personal', icon: BarChart3 },
                { key: 'showStatistics', label: 'Estadísticas Generales', icon: BarChart3 },
                { key: 'showCalendar', label: 'Calendario de Clases', icon: Calendar },
                { key: 'showResources', label: 'Recursos Compartidos', icon: BookOpen }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{label}</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting(key)}
                    className="flex items-center"
                  >
                    {commonAreaConfig[key as keyof typeof commonAreaConfig] ? (
                      <ToggleRight className="h-6 w-6 text-blue-400" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Interacciones */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-400" />
                <span>Interacciones</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Herramientas de comunicación disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'enableChat', label: 'Chat en Tiempo Real', icon: MessageSquare },
                { key: 'enableForums', label: 'Foros de Discusión', icon: MessageSquare },
                { key: 'enableQnA', label: 'Preguntas y Respuestas', icon: MessageSquare },
                { key: 'enableFileSharing', label: 'Compartir Archivos', icon: BookOpen }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{label}</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting(key)}
                    className="flex items-center"
                  >
                    {commonAreaConfig[key as keyof typeof commonAreaConfig] ? (
                      <ToggleRight className="h-6 w-6 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Permisos por Módulo */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <span>Permisos por Módulo</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Controla el acceso a cada módulo específico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commonAreaConfig.modulePermissions.map((module) => (
                  <div key={module.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{module.name}</h4>
                      <Badge variant={module.visible ? 'default' : 'secondary'}>
                        {module.visible ? 'Visible' : 'Oculto'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Visible para estudiantes</span>
                      <button
                        onClick={() => handleModuleToggle(module.id, 'visible')}
                        className="flex items-center"
                      >
                        {module.visible ? (
                          <ToggleRight className="h-5 w-5 text-blue-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-400">Pueden interactuar</span>
                      <button
                        onClick={() => handleModuleToggle(module.id, 'interact')}
                        className="flex items-center"
                      >
                        {module.canInteract ? (
                          <ToggleRight className="h-5 w-5 text-green-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vista Previa */}
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gold-400" />
                <span>Vista Previa del Estudiante</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Cómo ve el área común un estudiante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`bg-gray-900 rounded-lg p-4 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <div className="space-y-4">
                  {/* Header simulado */}
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <h3 className="text-white font-medium">Área Común</h3>
                    <Badge className="bg-green-600">En línea</Badge>
                  </div>

                  {/* Módulos visibles */}
                  {commonAreaConfig.showModules && (
                    <div className="space-y-2">
                      <h4 className="text-white text-sm font-medium">Módulos Disponibles</h4>
                      {commonAreaConfig.modulePermissions
                        .filter(module => module.visible)
                        .map(module => (
                          <div key={module.id} className="p-2 bg-gray-700 rounded text-white text-sm">
                            {module.name}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Progreso */}
                  {commonAreaConfig.showProgress && (
                    <div className="space-y-2">
                      <h4 className="text-white text-sm font-medium">Mi Progreso</h4>
                      <div className="p-2 bg-gray-700 rounded">
                        <div className="flex justify-between text-sm text-white mb-1">
                          <span>Análisis Técnico</span>
                          <span>75%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat */}
                  {commonAreaConfig.enableChat && (
                    <div className="space-y-2">
                      <h4 className="text-white text-sm font-medium">Chat</h4>
                      <div className="p-2 bg-gray-700 rounded text-white text-sm">
                        💬 Chat habilitado - 3 mensajes nuevos
                      </div>
                    </div>
                  )}

                  {/* Recursos */}
                  {commonAreaConfig.showResources && (
                    <div className="space-y-2">
                      <h4 className="text-white text-sm font-medium">Recursos</h4>
                      <div className="p-2 bg-gray-700 rounded text-white text-sm">
                        📁 5 archivos compartidos
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración Avanzada de Chat */}
          {commonAreaConfig.enableChat && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Configuración de Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Mensajes privados</span>
                  <button className="flex items-center">
                    {commonAreaConfig.chatSettings.allowPrivateMessages ? (
                      <ToggleRight className="h-5 w-5 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Moderación automática</span>
                  <button className="flex items-center">
                    {commonAreaConfig.chatSettings.moderationEnabled ? (
                      <ToggleRight className="h-5 w-5 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Historial: {commonAreaConfig.chatSettings.messageHistory} días</span>
                  <input
                    type="number"
                    value={commonAreaConfig.chatSettings.messageHistory}
                    className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonAreaSection;

