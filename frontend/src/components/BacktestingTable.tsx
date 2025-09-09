import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Settings, Image, Type, Calendar, Hash, ToggleLeft, ToggleRight } from 'lucide-react';

export type ColumnType = 'text' | 'image' | 'boolean' | 'number' | 'date';

export interface BacktestingColumn {
  id: string;
  name: string;
  type: ColumnType;
  visible: boolean;
}

export interface BacktestingEntry {
  id: string;
  [key: string]: any;
}

export interface BacktestingJournal {
  id: string;
  name: string;
  entries: BacktestingEntry[];
  columns: BacktestingColumn[];
  createdAt?: string;
}

interface BacktestingTableProps {
  entries: BacktestingEntry[];
  columns: BacktestingColumn[];
  onAddEntry: (entry: Omit<BacktestingEntry, 'id'>) => void;
  onUpdateEntry: (id: string, entry: Partial<BacktestingEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onAddColumn: (column: Omit<BacktestingColumn, 'id'>) => void;
  onUpdateColumn: (id: string, column: Partial<BacktestingColumn>) => void;
  onDeleteColumn: (id: string) => void;
  onAddImage: (entryId: string, imageUrl: string) => void;
  onRemoveImage: (entryId: string, imageUrl: string) => void;
}

const columnTypeIcons = {
  text: Type,
  image: Image,
  boolean: ToggleLeft,
  number: Hash,
  date: Calendar,
};

export default function BacktestingTable({
  entries,
  columns,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onAddImage,
  onRemoveImage,
}: BacktestingTableProps) {
  const { t } = useTranslation();
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<ColumnType>('text');
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Función para obtener el nombre traducido de una columna
  const getColumnDisplayName = (column: BacktestingColumn): string => {
    // Si es una columna por defecto, usar la traducción
    const defaultColumnTranslations: { [key: string]: string } = {
      'testName': t('backtesting.columns.testName'),
      'strategy': t('backtesting.columns.strategy'),
      'period': t('backtesting.columns.period'),
      'winRate': t('backtesting.columns.winRate'),
      'profit': t('backtesting.columns.profit'),
      'maxDrawdown': t('backtesting.columns.maxDrawdown'),
      'sharpeRatio': t('backtesting.columns.sharpeRatio'),
      'notes': t('backtesting.columns.notes'),
      'chart': t('backtesting.columns.chart'),
      'isProfitable': t('backtesting.columns.isProfitable'),
    };
    
    return defaultColumnTranslations[column.id] || column.name;
  };

  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible), 
    [columns]
  );

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onAddColumn({
        name: newColumnName.trim(),
        type: newColumnType,
        visible: true,
      });
      setNewColumnName('');
      setNewColumnType('text');
      setShowAddColumn(false);
    }
  };

  const handleUpdateColumn = (columnId: string) => {
    if (editingName.trim()) {
      onUpdateColumn(columnId, { name: editingName.trim() });
      setEditingColumn(null);
      setEditingName('');
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (window.confirm(t('backtesting.deleteColumn'))) {
      onDeleteColumn(columnId);
    }
  };

  const renderCellContent = (entry: BacktestingEntry, column: BacktestingColumn) => {
    const value = entry[column.id];

    switch (column.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-center">
            {value ? (
              <ToggleRight className="h-5 w-5 text-green-500" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-gray-400" />
            )}
          </div>
        );
      
      case 'image':
        return (
          <div className="flex items-center space-x-2">
            {value ? (
              <div className="relative">
                <img 
                  src={value} 
                  alt="Backtesting image" 
                  className="w-12 h-12 object-cover rounded"
                />
                <button
                  onClick={() => onRemoveImage(entry.id, value)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        onAddImage(entry.id, e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="w-12 h-12 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-400 hover:border-gray-300"
              >
                <Image className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onUpdateEntry(entry.id, { [column.id]: e.target.value })}
            className="w-full bg-transparent border-none text-sm text-white focus:outline-none"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onUpdateEntry(entry.id, { [column.id]: parseFloat(e.target.value) || 0 })}
            className="w-full bg-transparent border-none text-sm text-white focus:outline-none"
          />
        );
      
      default: // text
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onUpdateEntry(entry.id, { [column.id]: e.target.value })}
            className="w-full bg-transparent border-none text-sm text-white focus:outline-none"
            placeholder={t('backtesting.columnName')}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{t('backtesting.tests')}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddColumn(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{t('backtesting.addColumn')}</span>
          </button>
          <button
            onClick={() => onAddEntry({})}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{t('backtesting.newTest')}</span>
          </button>
        </div>
      </div>

      {/* Modal para agregar columna */}
      {showAddColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold text-white mb-4">{t('backtesting.addColumn')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('backtesting.columnName')}
                </label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('backtesting.columnName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('backtesting.columnType')}
                </label>
                <select
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value as ColumnType)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(columnTypeIcons).map(([type, Icon]) => (
                    <option key={type} value={type} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      {t(`backtesting.columnTypes.${type}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddColumn(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddColumn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                {visibleColumns.map((column) => {
                  const Icon = columnTypeIcons[column.type];
                  return (
                    <th key={column.id} className="px-4 py-3 text-left">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-400" />
                        {editingColumn === column.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleUpdateColumn(column.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateColumn(column.id)}
                            className="bg-transparent border-none text-white font-medium focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-medium">{getColumnDisplayName(column)}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingColumn(column.id);
                              setEditingName(getColumnDisplayName(column));
                            }}
                            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteColumn(column.id)}
                            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-right">
                  <span className="text-white font-medium">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t border-gray-700 hover:bg-gray-750">
                  {visibleColumns.map((column) => (
                    <td key={column.id} className="px-4 py-3">
                      {renderCellContent(entry, column)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-2 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
