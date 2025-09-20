import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Info, 
  Key, 
  Users, 
  Settings, 
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import AcademySidebar from '../components/academy/AcademySidebar';
import AcademyDashboard from '../components/academy/AcademyDashboard';
import GeneralInfoSection from '../components/academy/GeneralInfoSection';
import AccessManagementSection from '../components/academy/AccessManagementSection';
import CommonAreaSection from '../components/academy/CommonAreaSection';
import AdvancedSettingsSection from '../components/academy/AdvancedSettingsSection';

type AcademySection = 'dashboard' | 'general' | 'access' | 'common' | 'advanced';

interface AcademyPageProps {
  onBack: () => void;
}

const AcademyPage: React.FC<AcademyPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<AcademySection>('dashboard');

  const sections = [
    {
      id: 'dashboard' as AcademySection,
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Vista general de la academia'
    },
    {
      id: 'general' as AcademySection,
      name: 'Información General',
      icon: Info,
      description: 'Datos básicos de la academia'
    },
    {
      id: 'access' as AcademySection,
      name: 'Gestión de Acceso',
      icon: Key,
      description: 'Códigos y invitaciones'
    },
    {
      id: 'common' as AcademySection,
      name: 'Área Común',
      icon: Users,
      description: 'Configuración para estudiantes'
    },
    {
      id: 'advanced' as AcademySection,
      name: 'Configuración Avanzada',
      icon: Settings,
      description: 'Políticas y configuraciones'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AcademyDashboard />;
      case 'general':
        return <GeneralInfoSection />;
      case 'access':
        return <AccessManagementSection />;
      case 'common':
        return <CommonAreaSection />;
      case 'advanced':
        return <AdvancedSettingsSection />;
      default:
        return <AcademyDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-gold-400 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Academia</h1>
                  <p className="text-sm text-gray-400">Configuración y gestión</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AcademySidebar
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyPage;
