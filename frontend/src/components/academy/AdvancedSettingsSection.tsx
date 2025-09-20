import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Settings, 
  Clock, 
  Shield, 
  Mail,
  Bell,
  Calendar,
  FileText,
  Globe,
  Save
} from 'lucide-react';

const AdvancedSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  // Configuraciones avanzadas
  const [advancedConfig, setAdvancedConfig] = useState({
    // Políticas
    policies: {
      attendance: {
        required: true,
        minAttendance: 80,
        excusePolicy: 'medical_only'
      },
      conduct: {
        enabled: true,
        rules: [
          'Respeto mutuo entre estudiantes',
          'No compartir contenido inapropiado',
          'Participación constructiva en debates'
        ]
      },
      evaluation: {
        enabled: true,
        passingGrade: 70,
        retakePolicy: 'unlimited',
        feedbackRequired: true
      }
    },
    
    // Horarios
    schedule: {
      timezone: 'America/Mexico_City',
      classDays: ['monday', 'wednesday', 'friday'],
      classTime: '19:00',
      duration: 120, // minutos
      breakTime: 15
    },
    
    // Notificaciones
    notifications: {
      email: {
        enabled: true,
        newStudent: true,
        moduleComplete: true,
        upcomingClass: true,
        systemUpdates: true
      },
      sms: {
        enabled: false,
        urgentOnly: true
      },
      inApp: {
        enabled: true,
        allEvents: true
      }
    },
    
    // Integraciones
    integrations: {
      calendar: {
        enabled: true,
        provider: 'google',
        syncFrequency: 'daily'
      },
      email: {
        enabled: true,
        provider: 'gmail',
        templates: true
      }
    }
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Implementar guardado
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
          <h1 className="text-2xl font-bold text-white mb-2">Configuración Avanzada</h1>
          <p className="text-gray-400">Políticas, horarios y configuraciones del sistema</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
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
              <Settings className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Políticas y Reglas */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <span>Políticas y Reglas</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Define las reglas y políticas de tu academia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Política de Asistencia */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Política de Asistencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Asistencia Requerida
                </label>
                {isEditing ? (
                  <select
                    value={advancedConfig.policies.attendance.required ? 'true' : 'false'}
                    onChange={(e) => setAdvancedConfig(prev => ({
                      ...prev,
                      policies: {
                        ...prev.policies,
                        attendance: {
                          ...prev.policies.attendance,
                          required: e.target.value === 'true'
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <p className="text-white">{advancedConfig.policies.attendance.required ? 'Sí' : 'No'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Asistencia Mínima (%)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={advancedConfig.policies.attendance.minAttendance}
                    onChange={(e) => setAdvancedConfig(prev => ({
                      ...prev,
                      policies: {
                        ...prev.policies,
                        attendance: {
                          ...prev.policies.attendance,
                          minAttendance: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                ) : (
                  <p className="text-white">{advancedConfig.policies.attendance.minAttendance}%</p>
                )}
              </div>
            </div>
          </div>

          {/* Política de Conducta */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Política de Conducta</h4>
            <div className="space-y-3">
              {advancedConfig.policies.conduct.rules.map((rule, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => {
                        const newRules = [...advancedConfig.policies.conduct.rules];
                        newRules[index] = e.target.value;
                        setAdvancedConfig(prev => ({
                          ...prev,
                          policies: {
                            ...prev.policies,
                            conduct: {
                              ...prev.policies.conduct,
                              rules: newRules
                            }
                          }
                        }));
                      }}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  ) : (
                    <span className="text-gray-300">{rule}</span>
                  )}
                </div>
              ))}
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  + Agregar Regla
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horarios y Calendario */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-400" />
            <span>Horarios y Calendario</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configura los horarios de clases y eventos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Zona Horaria
              </label>
              {isEditing ? (
                <select
                  value={advancedConfig.schedule.timezone}
                  onChange={(e) => setAdvancedConfig(prev => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      timezone: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                </select>
              ) : (
                <p className="text-white">México (GMT-6)</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Hora de Clase
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={advancedConfig.schedule.classTime}
                  onChange={(e) => setAdvancedConfig(prev => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      classTime: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              ) : (
                <p className="text-white">{advancedConfig.schedule.classTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Duración (minutos)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={advancedConfig.schedule.duration}
                  onChange={(e) => setAdvancedConfig(prev => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      duration: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              ) : (
                <p className="text-white">{advancedConfig.schedule.duration} minutos</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Días de Clase
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={advancedConfig.schedule.classDays.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...advancedConfig.schedule.classDays, day]
                            : advancedConfig.schedule.classDays.filter(d => d !== day);
                          setAdvancedConfig(prev => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              classDays: newDays
                            }
                          }));
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600"
                      />
                      <span className="text-white capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-white">
                  {advancedConfig.schedule.classDays.map(day => 
                    day.charAt(0).toUpperCase() + day.slice(1)
                  ).join(', ')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            <span>Notificaciones</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configura cómo y cuándo recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </h4>
              <div className="space-y-3">
                {Object.entries(advancedConfig.notifications.email).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => setAdvancedConfig(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          email: {
                            ...prev.notifications.email,
                            [key]: e.target.checked
                          }
                        }
                      }))}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <span className="text-gray-300 text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* SMS */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">SMS</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={advancedConfig.notifications.sms.enabled}
                    onChange={(e) => setAdvancedConfig(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        sms: {
                          ...prev.notifications.sms,
                          enabled: e.target.checked
                        }
                      }
                    }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <span className="text-gray-300 text-sm">Habilitado</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={advancedConfig.notifications.sms.urgentOnly}
                    onChange={(e) => setAdvancedConfig(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        sms: {
                          ...prev.notifications.sms,
                          urgentOnly: e.target.checked
                        }
                      }
                    }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <span className="text-gray-300 text-sm">Solo urgentes</span>
                </label>
              </div>
            </div>

            {/* In-App */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">En la App</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={advancedConfig.notifications.inApp.enabled}
                    onChange={(e) => setAdvancedConfig(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        inApp: {
                          ...prev.notifications.inApp,
                          enabled: e.target.checked
                        }
                      }
                    }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <span className="text-gray-300 text-sm">Habilitado</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={advancedConfig.notifications.inApp.allEvents}
                    onChange={(e) => setAdvancedConfig(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        inApp: {
                          ...prev.notifications.inApp,
                          allEvents: e.target.checked
                        }
                      }
                    }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <span className="text-gray-300 text-sm">Todos los eventos</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSettingsSection;
