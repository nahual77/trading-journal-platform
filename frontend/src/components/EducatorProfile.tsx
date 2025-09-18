import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award,
  Shield,
  Key,
  Smartphone,
  Activity,
  History,
  Save,
  Edit,
  Camera
} from 'lucide-react';

interface EducatorProfileProps {
  onClose: () => void;
}

export default function EducatorProfile({ onClose }: EducatorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Datos del perfil (en un futuro vendrán de la API)
  const [profileData, setProfileData] = useState({
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@tradingacademy.com',
    phone: '+1 234 567 8900',
    location: 'Madrid, España',
    bio: 'Experto en trading con más de 10 años de experiencia en mercados financieros. Especializado en análisis técnico y gestión de riesgo.',
    experience: '10+ años',
    specialization: 'Análisis Técnico, Gestión de Riesgo',
    certifications: ['CFA', 'FRM', 'Trading Professional'],
    joinDate: '2020-01-15',
    lastLogin: '2024-01-15 14:30'
  });

  const [securityData, setSecurityData] = useState({
    passwordLastChanged: '2023-12-01',
    twoFactorEnabled: false,
    activeSessions: 2,
    lastPasswordChange: 'Hace 2 meses'
  });

  const handleSave = () => {
    // TODO: Implementar guardado en API
    console.log('Guardando perfil:', profileData);
    alert('Perfil actualizado correctamente');
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    // TODO: Implementar cambio de contraseña
    alert('Funcionalidad de cambio de contraseña - Próximamente');
  };

  const handle2FAToggle = () => {
    // TODO: Implementar 2FA
    alert('Funcionalidad de 2FA - Próximamente');
  };

  const handleViewSessions = () => {
    // TODO: Implementar vista de sesiones
    alert('Funcionalidad de sesiones activas - Próximamente');
  };

  const handleViewHistory = () => {
    // TODO: Implementar historial
    alert('Funcionalidad de historial - Próximamente');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mi Perfil</h2>
                <p className="text-gray-400 text-sm">Gestiona tu información personal y seguridad</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Seguridad</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Perfil */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Información Personal</CardTitle>
                      <CardDescription>Actualiza tu información de perfil</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mensaje de modo edición */}
                  {isEditing && (
                    <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Edit className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-300 text-sm font-medium">
                          Modo edición activo - Puedes modificar los campos resaltados
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Foto de perfil */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      {isEditing && (
                        <Button
                          size="sm"
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0"
                        >
                          <Camera className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{profileData.name}</h3>
                      <p className="text-gray-400 text-sm">Educador desde {new Date(profileData.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Nombre completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                        className={`bg-gray-700 border-gray-600 text-white ${
                          isEditing 
                            ? 'border-blue-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20' 
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className={`bg-gray-700 border-gray-600 text-white ${
                          isEditing 
                            ? 'border-blue-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20' 
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300">Teléfono</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className={`bg-gray-700 border-gray-600 text-white ${
                          isEditing 
                            ? 'border-blue-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20' 
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-300">Ubicación</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        disabled={!isEditing}
                        className={`bg-gray-700 border-gray-600 text-white ${
                          isEditing 
                            ? 'border-blue-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20' 
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Biografía */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-300">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!isEditing}
                      className={`bg-gray-700 border-gray-600 text-white min-h-[100px] ${
                        isEditing 
                          ? 'border-blue-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      placeholder="Cuéntanos sobre tu experiencia en trading..."
                    />
                  </div>

                  {/* Información profesional */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Experiencia</Label>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>{profileData.experience}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Especialización</Label>
                      <div className="text-gray-300 text-sm">
                        {profileData.specialization}
                      </div>
                    </div>
                  </div>

                  {/* Certificaciones */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Certificaciones</Label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center space-x-1 bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                          <Award className="h-3 w-3" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="text-gray-300 border-gray-600 hover:bg-gray-700"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar cambios
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Seguridad */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Configuración de Seguridad</CardTitle>
                  <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cambiar contraseña */}
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5 text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">Contraseña</h3>
                        <p className="text-gray-400 text-sm">
                          Última actualización: {securityData.lastPasswordChange}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handlePasswordChange}
                      variant="outline"
                      size="sm"
                      className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      Cambiar
                    </Button>
                  </div>

                  {/* 2FA */}
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">Autenticación de dos factores</h3>
                        <p className="text-gray-400 text-sm">
                          {securityData.twoFactorEnabled ? 'Activada' : 'Desactivada'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handle2FAToggle}
                      variant="outline"
                      size="sm"
                      className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      {securityData.twoFactorEnabled ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>

                  {/* Sesiones activas */}
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">Sesiones activas</h3>
                        <p className="text-gray-400 text-sm">
                          {securityData.activeSessions} dispositivos conectados
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleViewSessions}
                      variant="outline"
                      size="sm"
                      className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      Ver sesiones
                    </Button>
                  </div>

                  {/* Historial de accesos */}
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <History className="h-5 w-5 text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">Historial de accesos</h3>
                        <p className="text-gray-400 text-sm">
                          Último acceso: {profileData.lastLogin}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleViewHistory}
                      variant="outline"
                      size="sm"
                      className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      Ver historial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
