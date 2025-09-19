import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import TwoFactorModal from './TwoFactorModal';
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
  Camera,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

interface EducatorProfileProps {
  onClose: () => void;
  onAvatarChange?: (avatar: string | null) => void;
}

export default function EducatorProfile({ onClose, onAvatarChange }: EducatorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Cargar avatar desde localStorage al abrir el perfil
  React.useEffect(() => {
    const savedAvatar = localStorage.getItem('educator-avatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

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
    setShowPasswordModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors([]);
  };

  const validatePassword = () => {
    const errors: string[] = [];
    
    if (!passwordData.currentPassword) {
      errors.push('La contraseña actual es requerida');
    }
    
    if (!passwordData.newPassword) {
      errors.push('La nueva contraseña es requerida');
    } else if (passwordData.newPassword.length < 8) {
      errors.push('La nueva contraseña debe tener al menos 8 caracteres');
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('Las contraseñas nuevas no coinciden');
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('La nueva contraseña debe ser diferente a la actual');
    }
    
    return errors;
  };

  const handlePasswordSubmit = async () => {
    const errors = validatePassword();
    
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordErrors([]);
    
    try {
      // Importar supabase dinámicamente para evitar problemas de importación
      const { supabase } = await import('../supabaseClient');
      
      console.log('Cambiando contraseña...');
      
      // Llamar a la API de Supabase para cambiar la contraseña
      const { data, error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) {
        console.error('Error al cambiar contraseña:', error);
        setPasswordErrors([error.message || 'Error al cambiar la contraseña']);
        return;
      }
      
      console.log('Contraseña actualizada exitosamente:', data);
      alert('Contraseña actualizada correctamente');
      
      // Cerrar modal y limpiar datos
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors([]);
      
    } catch (error) {
      console.error('Error inesperado:', error);
      setPasswordErrors(['Error inesperado al cambiar la contraseña']);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors([]);
  };

  const handle2FAToggle = () => {
    if (profileData.twoFactorEnabled) {
      // Desactivar 2FA
      if (confirm('¿Estás seguro de que quieres desactivar la autenticación de dos factores? Esto reduce la seguridad de tu cuenta.')) {
        // TODO: Implementar desactivación 2FA
        console.log('Desactivando 2FA...');
        setProfileData({...profileData, twoFactorEnabled: false});
        alert('2FA desactivado correctamente');
      }
    } else {
      // Activar 2FA
      setShow2FAModal(true);
    }
  };

  const handle2FASuccess = () => {
    setProfileData({...profileData, twoFactorEnabled: true});
    setShow2FAModal(false);
    alert('2FA activado correctamente');
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    // Crear URL temporal para previsualización
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatar(result);
      localStorage.setItem('educator-avatar', result);
      onAvatarChange?.(result);
      setIsUploadingAvatar(false);
      alert('Avatar actualizado correctamente');
    };
    reader.onerror = () => {
      alert('Error al cargar la imagen');
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    localStorage.removeItem('educator-avatar');
    onAvatarChange?.(null);
    alert('Avatar eliminado correctamente');
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
                      {avatar ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-600">
                          <img 
                            src={avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-white" />
                        </div>
                      )}
                      
                      {isEditing && (
                        <div className="absolute -bottom-1 -right-1 flex space-x-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            id="avatar-upload"
                            disabled={isUploadingAvatar}
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                            title="Cambiar avatar"
                          >
                            {isUploadingAvatar ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <Camera className="h-3 w-3 text-white" />
                            )}
                          </label>
                          
                          {avatar && (
                            <button
                              onClick={handleRemoveAvatar}
                              className="w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                              title="Eliminar avatar"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          )}
                        </div>
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

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Cambiar Contraseña</h3>
                    <p className="text-gray-400 text-sm">Actualiza tu contraseña de forma segura</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePasswordCancel}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Errores de validación */}
                {passwordErrors.length > 0 && (
                  <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3">
                    <ul className="text-red-300 text-sm space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contraseña actual */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-300">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Nueva contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-300">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Confirmar nueva contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                      placeholder="Repite la nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePasswordCancel}
                    className="text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handlePasswordSubmit}
                    disabled={isChangingPassword}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de 2FA */}
      <TwoFactorModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onSuccess={handle2FASuccess}
      />
    </div>
  );
}
