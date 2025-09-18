import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  ArrowRight
} from 'lucide-react';

interface EducatorStats {
  totalStudents: number;
  totalAcademies: number;
  activeStudents: number;
  monthlyGrowth: number;
}

interface Academy {
  id: string;
  name: string;
  studentCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastActivity: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  academy: string;
  lastLogin: string;
  status: 'active' | 'inactive';
  performance: 'excellent' | 'good' | 'needs_improvement';
}

const EducatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<EducatorStats>({
    totalStudents: 0,
    totalAcademies: 0,
    activeStudents: 0,
    monthlyGrowth: 0
  });

  const [academies, setAcademies] = useState<Academy[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);

  // Simular carga de datos
  useEffect(() => {
    // TODO: Implementar carga real de datos desde la API
    setStats({
      totalStudents: 45,
      totalAcademies: 3,
      activeStudents: 38,
      monthlyGrowth: 12.5
    });

    setAcademies([
      {
        id: '1',
        name: 'Academia de Trading Avanzado',
        studentCount: 25,
        status: 'active',
        createdAt: '2024-01-15',
        lastActivity: '2024-01-18'
      },
      {
        id: '2',
        name: 'Curso de Análisis Técnico',
        studentCount: 15,
        status: 'active',
        createdAt: '2024-01-10',
        lastActivity: '2024-01-17'
      },
      {
        id: '3',
        name: 'Trading para Principiantes',
        studentCount: 5,
        status: 'inactive',
        createdAt: '2024-01-05',
        lastActivity: '2024-01-12'
      }
    ]);

    setRecentStudents([
      {
        id: '1',
        name: 'María González',
        email: 'maria@email.com',
        academy: 'Academia de Trading Avanzado',
        lastLogin: '2024-01-18',
        status: 'active',
        performance: 'excellent'
      },
      {
        id: '2',
        name: 'Carlos Rodríguez',
        email: 'carlos@email.com',
        academy: 'Curso de Análisis Técnico',
        lastLogin: '2024-01-17',
        status: 'active',
        performance: 'good'
      },
      {
        id: '3',
        name: 'Ana Martínez',
        email: 'ana@email.com',
        academy: 'Trading para Principiantes',
        lastLogin: '2024-01-16',
        status: 'inactive',
        performance: 'needs_improvement'
      }
    ]);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo-growjou.png" 
                alt="Growjou" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard del Educador</h1>
                <p className="text-gray-400 text-sm">Gestiona tus academias y estudiantes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="text-gray-300 border-gray-600 hover:bg-gray-700">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Academia
              </Button>
            </div>
          </div>
        </div>
      </header>

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
              <CardTitle className="text-sm font-medium text-gray-300">Academias</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalAcademies}</div>
              <p className="text-xs text-gray-400">
                {academies.filter(a => a.status === 'active').length} activas
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
        <Tabs defaultValue="academies" className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-700">
            <TabsTrigger value="academies" className="data-[state=active]:bg-blue-600">
              Mis Academias
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-blue-600">
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
              Analíticas
            </TabsTrigger>
          </TabsList>

          {/* Academias Tab */}
          <TabsContent value="academies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Mis Academias</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Crear Academia
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {academies.map((academy) => (
                <Card key={academy.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{academy.name}</CardTitle>
                      <Badge 
                        variant={academy.status === 'active' ? 'default' : 'secondary'}
                        className={academy.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
                      >
                        {academy.status === 'active' ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      Creada el {new Date(academy.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Estudiantes:</span>
                        <span className="text-white font-medium">{academy.studentCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Última actividad:</span>
                        <span className="text-white text-sm">{new Date(academy.lastActivity).toLocaleDateString()}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-gray-300 border-gray-600 hover:bg-gray-700"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Ver Academia
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
              <Button variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700">
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
                        <th className="text-left p-4 text-gray-300 font-medium">Academia</th>
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
                          <td className="p-4 text-gray-300">{student.academy}</td>
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
    </div>
  );
};

export default EducatorDashboard;
