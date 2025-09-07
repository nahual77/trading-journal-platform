import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';

interface DownloadBacktestingDropdownProps {
  onExportBacktestingCSV: () => void;
  onExportAllBacktestingCSV: () => void;
  onExportBacktestingData: () => void;
  activeBacktestingName: string;
}

export default function DownloadBacktestingDropdown({
  onExportBacktestingCSV,
  onExportAllBacktestingCSV,
  onExportBacktestingData,
  activeBacktestingName
}: DownloadBacktestingDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportBacktesting = () => {
    onExportBacktestingCSV();
    setIsOpen(false);
  };

  const handleExportAll = () => {
    onExportAllBacktestingCSV();
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    onExportBacktestingData();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
        title={t('downloadBacktestingDropdown.title')}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">{t('downloadBacktestingDropdown.title')}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {/* Exportar backtesting actual CSV */}
            <button
              onClick={handleExportBacktesting}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Download className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">{t('downloadBacktestingDropdown.exportCSV')}</div>
                <div className="text-xs text-gray-400">{t('downloadBacktestingDropdown.currentJournal', { name: activeBacktestingName })}</div>
              </div>
            </button>

            {/* Exportar todos los backtesting CSV */}
            <button
              onClick={handleExportAll}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Download className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">{t('downloadBacktestingDropdown.exportAllCSV')}</div>
                <div className="text-xs text-gray-400">{t('downloadBacktestingDropdown.allJournals')}</div>
              </div>
            </button>

            {/* Exportar JSON (backup completo) */}
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <Download className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">{t('downloadBacktestingDropdown.exportJSON')}</div>
                <div className="text-xs text-gray-400">{t('downloadBacktestingDropdown.fullBackup')}</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
