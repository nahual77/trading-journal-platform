import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

interface Section {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

interface AcademySidebarProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const AcademySidebar: React.FC<AcademySidebarProps> = ({
  sections,
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Configuración</h2>
        
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive 
                      ? "text-white" 
                      : "text-gray-400 group-hover:text-white group-hover:rotate-12"
                  )} 
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {section.name}
                  </div>
                  <div className={cn(
                    "text-xs truncate",
                    isActive 
                      ? "text-blue-100" 
                      : "text-gray-500 group-hover:text-gray-300"
                  )}>
                    {section.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AcademySidebar;

