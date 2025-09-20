import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Mail,
  Clock,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

const AccessManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const [showCodes, setShowCodes] = useState(true);

  // Datos mock
  const [accessCodes, setAccessCodes] = useState([
    {
      id: 1,
      code: 'ACAD2024-001',
      created: '2024-01-15',
      expires: '2024-02-15',
      used: 12,
      maxUses: 50,
      status: 'active'
    },
    {
      id: 2,
      code: 'ACAD2024-002',
      created: '2024-01-20',
      expires: '2024-02-20',
      used: 8,
      maxUses: 25,
      status: 'active'
    },
    {
      id: 3,
      code: 'ACAD2024-003',
      created: '2024-01-10',
      expires: '2024-01-25',
      used: 25,
      maxUses: 25,
      status: 'expired'
    }
  ]);

  const handleGenerateCode = () => {
    // TODO: Implementar generación de código
    alert('Generar nuevo código de acceso - Próximamente');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // TODO: Mostrar notificación de éxito
  };

  const handleRevokeCode = (id: number) => {
    // TODO: Implementar revocación de código
    alert(`Revocar código ${id} - Próximamente`);
  };

  const handleSendInvitation = () => {
    // TODO: Implementar envío de invitación
    alert('Enviar invitación por email - Próximamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Gestión de Acceso</h1>
          <p className="text-gray-400">Gestiona códigos de acceso e invitaciones para estudiantes</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleSendInvitation}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Mail className="h-4 w-4 mr-2" />
            Enviar Invitación
          </Button>
          <Button
            onClick={handleGenerateCode}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generar Código
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Códigos Activos</p>
                <p className="text-2xl font-bold text-white">
                  {accessCodes.filter(code => code.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Usos Totales</p>
                <p className="text-2xl font-bold text-white">
                  {accessCodes.reduce((sum, code) => sum + code.used, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Próximos a Vencer</p>
                <p className="text-2xl font-bold text-white">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Codes List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Códigos de Acceso</CardTitle>
              <CardDescription className="text-gray-400">
                Gestiona los códigos de acceso para estudiantes
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodes(!showCodes)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {showCodes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showCodes ? 'Ocultar' : 'Mostrar'} Códigos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accessCodes.map((code) => (
              <div key={code.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <code className="text-white font-mono text-lg">
                      {showCodes ? code.code : '••••••••••••'}
                    </code>
                    <Badge 
                      variant={code.status === 'active' ? 'default' : 'secondary'}
                      className={code.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
                    >
                      {code.status === 'active' ? 'Activo' : 'Expirado'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span>Creado: {new Date(code.created).toLocaleDateString()}</span>
                    <span>Expira: {new Date(code.expires).toLocaleDateString()}</span>
                    <span>Usos: {code.used}/{code.maxUses}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${(code.used / code.maxUses) * 100}%`}}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(code.code)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeCode(code.id)}
                    className="border-red-600 text-red-300 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generar Nuevo Código</CardTitle>
            <CardDescription className="text-gray-400">
              Crea un código de acceso personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateCode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generar Código
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Enviar Invitación</CardTitle>
            <CardDescription className="text-gray-400">
              Invita estudiantes directamente por email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSendInvitation}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Invitación
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessManagementSection;

