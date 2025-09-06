import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDefinition } from '../types/trading';
import { Settings } from 'lucide-react';

interface ColumnManagerProps {
  columns: ColumnDefinition[];
  onToggleColumn: (columnId: string) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({ 
  columns, 
  onToggleColumn 
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.column-manager-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Ordenar columnas por su orden definido
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  
  // Contar columnas visibles
  const visibleCount = columns.filter(col => col.visible).length;
  const totalCount = columns.length;

  return (
    <div className="column-manager-container relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
        title={`Gestionar columnas (${visibleCount}/${totalCount} visibles)`}
      >
        <Settings className="h-4 w-4" />
        <span>{t('table.columns')}</span>
        <span className="text-xs bg-gray-600 px-2 py-1 rounded">
          {visibleCount}/{totalCount}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-40 min-w-[280px]">
          <div className="p-3 border-b border-gray-600">
            <h3 className="text-sm font-medium text-white">{t('table.manageColumns')}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {t('table.selectColumnsToShow')}
            </p>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {sortedColumns.map((column) => (
              <label
                key={column.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => onToggleColumn(column.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm text-white">{t(`table.${column.name.replace(/^table\./, '').replace(/^TABLE\./, '')}`)}</div>
                  <div className="text-xs text-gray-400">
                    {t(`table.columnType.${column.type}`)}
                  </div>
                </div>
                {column.type === 'image' && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    IMG
                  </span>
                )}
              </label>
            ))}
          </div>

          <div className="p-3 border-t border-gray-600 bg-gray-750">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{t('table.total')}: {totalCount} {t('table.columns')}</span>
              <span>{t('table.visible')}: {visibleCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
