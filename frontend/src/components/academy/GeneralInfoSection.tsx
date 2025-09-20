import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Building2, 
  Edit3, 
  Calendar,
  Users,
  Target,
  Image as ImageIcon
} from 'lucide-react';

const GeneralInfoSection: React.FC = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  // Datos mock de la academia
  const [academyData, setAcademyData] = useState({
    name: 'Academia de Trading Avanzado',
    description: 'Programa completo de formación en trading e inversiones para principiantes y avanzados.',
    objectives: [
      'Dominar los conceptos fundamentales del trading',
      'Aprender análisis técnico y fundamental',
      'Desarrollar estrategias de gestión de riesgo',
      'Practicar con simuladores y casos reales'
    ],
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    maxStudents: 50,
    currentStudents: 45,
    logo: null
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Implementar guardado de datos
  };

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: Revertir cambios
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Información General</h1>
          <p className="text-gray-400">Configura los datos básicos de tu academia</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Guardar
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Logo y Datos Básicos */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-400" />
            <span>Datos Básicos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
              {academyData.logo ? (
                <img 
                  src={academyData.logo} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Logo de la Academia</h3>
              <p className="text-sm text-gray-400 mb-3">
                Sube una imagen que represente tu academia
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Subir Logo
              </Button>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la Academia
            </label>
            {isEditing ? (
              <input
                type="text"
                value={academyData.name}
                onChange={(e) => setAcademyData({...academyData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-white text-lg">{academyData.name}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            {isEditing ? (
              <textarea
                value={academyData.description}
                onChange={(e) => setAcademyData({...academyData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-300">{academyData.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-400" />
            <span>Objetivos del Programa</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Define qué aprenderán los estudiantes en tu academia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {academyData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...academyData.objectives];
                      newObjectives[index] = e.target.value;
                      setAcademyData({...academyData, objectives: newObjectives});
                    }}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                + Agregar Objetivo
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {academyData.objectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                  <span className="text-gray-300">{objective}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Fechas y Capacidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <span>Fechas del Programa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Inicio
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={academyData.startDate}
                  onChange={(e) => setAcademyData({...academyData, startDate: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-white">{new Date(academyData.startDate).toLocaleDateString()}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Finalización
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={academyData.endDate}
                  onChange={(e) => setAcademyData({...academyData, endDate: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-white">{new Date(academyData.endDate).toLocaleDateString()}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-400" />
              <span>Capacidad</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Máximo de Estudiantes
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={academyData.maxStudents}
                  onChange={(e) => setAcademyData({...academyData, maxStudents: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-white text-2xl font-bold">{academyData.maxStudents}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400">
                Estudiantes actuales: <span className="text-white font-medium">{academyData.currentStudents}</span>
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{width: `${(academyData.currentStudents / academyData.maxStudents) * 100}%`}}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeneralInfoSection;

