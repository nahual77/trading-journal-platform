import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  GraduationCap, 
  Key, 
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  Star
} from 'lucide-react';

const AcademyDashboard: React.FC = () => {
  const { t } = useTranslation();

  // Datos mock para el dashboard
  const stats = {
    totalStudents: 45,
    activeStudents: 38,
    totalModules: 8,
    completedModules: 3,
    accessCodes: 12,
    activeCodes: 8,
    monthlyGrowth: 15.2,
    averageRating: 4.7
  };

  const recentActivity = [
    {
      id: 1,
      type: 'student_joined',
      message: 'María García se unió a la academia',
      time: 'Hace 2 horas',
      icon: Users
    },
    {
      id: 2,
      type: 'module_completed',
      message: 'Carlos López completó "Análisis Técnico"',
      time: 'Hace 4 horas',
      icon: GraduationCap
    },
    {
      id: 3,
      type: 'code_generated',
      message: 'Nuevo código de acceso generado',
      time: 'Ayer',
      icon: Key
    },
    {
      id: 4,
      type: 'feedback_received',
      message: 'Nueva evaluación recibida',
      time: 'Ayer',
      icon: Star
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard de Academia</h1>
        <p className="text-gray-400">Vista general de tu academia y estadísticas clave</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Estudiantes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
            <p className="text-xs text-gray-400">
              {stats.activeStudents} activos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Módulos
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalModules}</div>
            <p className="text-xs text-gray-400">
              {stats.completedModules} completados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Códigos de Acceso
            </CardTitle>
            <Key className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.accessCodes}</div>
            <p className="text-xs text-gray-400">
              {stats.activeCodes} activos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Crecimiento Mensual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gold-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+{stats.monthlyGrowth}%</div>
            <p className="text-xs text-gray-400">
              vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Últimas acciones en tu academia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.message}</p>
                      <p className="text-xs text-gray-400 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Acciones Rápidas</CardTitle>
            <CardDescription className="text-gray-400">
              Accesos directos a funciones comunes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
                <Key className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                <div className="text-left">
                  <div className="text-sm font-medium text-white">Generar Código de Acceso</div>
                  <div className="text-xs text-gray-400">Crear nuevo código para estudiantes</div>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
                <Users className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                <div className="text-left">
                  <div className="text-sm font-medium text-white">Invitar Estudiantes</div>
                  <div className="text-xs text-gray-400">Enviar invitaciones por email</div>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
                <Calendar className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
                <div className="text-left">
                  <div className="text-sm font-medium text-white">Configurar Horarios</div>
                  <div className="text-xs text-gray-400">Establecer días y horarios de clase</div>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
                <Star className="h-5 w-5 text-gold-400 group-hover:text-gold-300" />
                <div className="text-left">
                  <div className="text-sm font-medium text-white">Ver Evaluaciones</div>
                  <div className="text-xs text-gray-400">Revisar feedback de estudiantes</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademyDashboard;
