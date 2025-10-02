import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDefinition } from '../types/trading';
import { Settings, Plus, Edit2, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';

interface DiaryColumnManagerProps {
  columns: ColumnDefinition[];
  onColumnsChange: (columns: ColumnDefinition[]) => void;
  onToggleColumn: (columnId: string) => void;
  onReorderColumns?: (columnId: string, direction: 'up' | 'down') => void;
}

export const DiaryColumnManager: React.FC<DiaryColumnManagerProps> = ({
  columns,
  onColumnsChange,
  onToggleColumn,
  onReorderColumns
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnDefinition | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [newColumn, setNewColumn] = useState<Partial<ColumnDefinition>>({
    key: '',
    name: '',
    type: 'text',
    visible: true,
    order: columns.length + 1
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.diary-column-manager-container')) {
        setIsOpen(false);
        setIsEditing(false);
        setEditingColumn(null);
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

  const handleAddColumn = () => {
    if (!newColumn.key || !newColumn.name) return;

    const column: ColumnDefinition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      key: newColumn.key,
      name: newColumn.name,
      type: newColumn.type || 'text',
      options: newColumn.type === 'select' ? newColumn.options || [] : undefined,
      visible: true,
      order: columns.length + 1
    };

    onColumnsChange([...columns, column]);
    setNewColumn({
      key: '',
      name: '',
      type: 'text',
      visible: true,
      order: columns.length + 2
    });
  };

  const handleEditColumn = (column: ColumnDefinition) => {
    setEditingColumn(column);
    setIsEditing(true);
  };

  const handleUpdateColumn = (updatedColumn: ColumnDefinition) => {
    const updatedColumns = columns.map(col =>
      col.id === updatedColumn.id ? updatedColumn : col
    );
    onColumnsChange(updatedColumns);
    setEditingColumn(null);
    setIsEditing(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (window.confirm(t('columnManager.confirmDelete'))) {
      onColumnsChange(columns.filter(col => col.id !== columnId));
    }
  };

  const handleMoveColumn = (columnId: string, direction: 'up' | 'down') => {
    if (onReorderColumns) {
      onReorderColumns(columnId, direction);
    } else {
      // Fallback: implementación local
      const columnIndex = columns.findIndex(col => col.id === columnId);
      if (columnIndex === -1) return;

      const newIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;
      if (newIndex < 0 || newIndex >= columns.length) return;

      const newColumns = [...columns];
      const [movedColumn] = newColumns.splice(columnIndex, 1);
      newColumns.splice(newIndex, 0, movedColumn);

      // Actualizar el orden
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index + 1
      }));

      onColumnsChange(updatedColumns);
    }
  };

  // Funciones de drag and drop
  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedColumn(null);
      return;
    }

    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, movedColumn);

    // Actualizar el orden
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index + 1
    }));

    onColumnsChange(updatedColumns);
    setDraggedColumn(null);
  };

  const columnTypes = [
    { value: 'text', label: t('columnManager.types.text') },
    { value: 'number', label: t('columnManager.types.number') },
    { value: 'boolean', label: t('columnManager.types.boolean') },
    { value: 'date', label: t('columnManager.types.date') },
    { value: 'time', label: t('columnManager.types.time') },
    { value: 'image', label: t('columnManager.types.image') },
    { value: 'select', label: t('columnManager.types.select') }
  ];

  return (
    <div className="diary-column-manager-container relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
        title={`${t('columnManager.manageColumns')} (${visibleCount}/${totalCount} ${t('columnManager.visible')})`}
      >
        <Settings className="h-4 w-4" />
        <span className="text-sm font-medium">
          {t('columnManager.columns')} {visibleCount}/{totalCount}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('columnManager.manageColumns')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Lista de columnas existentes */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {sortedColumns.map((column) => (
                <div
                  key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, column.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`flex items-center space-x-2 p-2 bg-gray-700 rounded-lg cursor-move transition-all ${draggedColumn === column.id ? 'opacity-50 scale-95' : 'hover:bg-gray-600'
                    }`}
                >
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />

                  <button
                    onClick={() => onToggleColumn(column.id)}
                    className="flex-shrink-0"
                  >
                    {column.visible ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {t(`table.${column.name}`)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {column.key} • {t(`columnManager.types.${column.type}`)}
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleMoveColumn(column.id, 'up')}
                      disabled={column.order === 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveColumn(column.id, 'down')}
                      disabled={column.order === columns.length}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleEditColumn(column)}
                      className="p-1 text-gray-400 hover:text-blue-400"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      className="p-1 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulario para nueva columna */}
            <div className="border-t border-gray-600 pt-4">
              <h4 className="text-sm font-medium text-white mb-3">
                {t('columnManager.addNewColumn')}
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    {t('columnManager.columnKey')}
                  </label>
                  <input
                    type="text"
                    value={newColumn.key || ''}
                    onChange={(e) => setNewColumn({ ...newColumn, key: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="ej: mi_campo"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    {t('columnManager.columnName')}
                  </label>
                  <input
                    type="text"
                    value={newColumn.name || ''}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Mi Campo"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    {t('columnManager.columnType')}
                  </label>
                  <select
                    value={newColumn.type || 'text'}
                    onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {columnTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {newColumn.type === 'select' && (
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">
                      {t('columnManager.options')}
                    </label>
                    <input
                      type="text"
                      value={newColumn.options?.join(', ') || ''}
                      onChange={(e) => setNewColumn({
                        ...newColumn,
                        options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Opción 1, Opción 2, Opción 3"
                    />
                  </div>
                )}

                <button
                  onClick={handleAddColumn}
                  disabled={!newColumn.key || !newColumn.name}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('columnManager.addColumn')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {isEditing && editingColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('columnManager.editColumn')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  {t('columnManager.columnName')}
                </label>
                <input
                  type="text"
                  value={editingColumn.name}
                  onChange={(e) => setEditingColumn({ ...editingColumn, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  {t('columnManager.columnType')}
                </label>
                <select
                  value={editingColumn.type}
                  onChange={(e) => setEditingColumn({ ...editingColumn, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {columnTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {editingColumn.type === 'select' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    {t('columnManager.options')}
                  </label>
                  <input
                    type="text"
                    value={editingColumn.options?.join(', ') || ''}
                    onChange={(e) => setEditingColumn({
                      ...editingColumn,
                      options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    placeholder="Opción 1, Opción 2, Opción 3"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={editingColumn.visible}
                  onChange={(e) => setEditingColumn({ ...editingColumn, visible: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="visible" className="text-sm text-gray-300">
                  {t('columnManager.visible')}
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setEditingColumn(null);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleUpdateColumn(editingColumn)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
