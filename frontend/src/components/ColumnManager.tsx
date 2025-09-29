import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDefinition } from '../types/trading';
import { Settings, ChevronUp, ChevronDown, Edit2, Trash2, Plus } from 'lucide-react';

interface ColumnManagerProps {
  columns: ColumnDefinition[];
  onToggleColumn: (columnId: string) => void;
  onUpdateColumn?: (columnId: string, updates: Partial<ColumnDefinition>) => void;
  onRemoveColumn?: (columnId: string) => void;
  onAddColumn?: (column: Omit<ColumnDefinition, 'id' | 'order'>) => void;
  onReorderColumns?: (columns: ColumnDefinition[]) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({ 
  columns, 
  onToggleColumn,
  onUpdateColumn,
  onRemoveColumn,
  onAddColumn,
  onReorderColumns
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'text' as const });

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.column-manager')) {
        setIsOpen(false);
        setEditingColumn(null);
        setEditingName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (column: ColumnDefinition) => {
    setEditingColumn(column.id);
    setEditingName(column.name);
  };

  const handleSaveEdit = () => {
    if (editingColumn && editingName.trim() && onUpdateColumn) {
      onUpdateColumn(editingColumn, { name: editingName.trim() });
    }
    setEditingColumn(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingColumn(null);
    setEditingName('');
  };

  const handleDelete = (columnId: string) => {
    if (onRemoveColumn && window.confirm(t('table.confirmDeleteColumn'))) {
      onRemoveColumn(columnId);
    }
  };

  const handleAddColumn = () => {
    if (newColumn.name.trim() && onAddColumn) {
      onAddColumn({
        name: newColumn.name.trim(),
        type: newColumn.type,
        visible: true
      });
      setNewColumn({ name: '', type: 'text' });
    }
  };

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
    
    if (!draggedColumn || !onReorderColumns) return;
    
    const draggedIndex = columns.findIndex(col => col.id === draggedColumn);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);
    
    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      setDraggedColumn(null);
      return;
    }
    
    const newColumns = [...columns];
    const [draggedItem] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedItem);
    
    // Actualizar el orden
    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index
    }));
    
    onReorderColumns(reorderedColumns);
    setDraggedColumn(null);
  };

  const handleMoveColumn = (columnId: string, direction: 'up' | 'down') => {
    if (!onReorderColumns) return;
    
    const currentIndex = columns.findIndex(col => col.id === columnId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;
    
    const newColumns = [...columns];
    [newColumns[currentIndex], newColumns[newIndex]] = [newColumns[newIndex], newColumns[currentIndex]];
    
    // Actualizar el orden
    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index
    }));
    
    onReorderColumns(reorderedColumns);
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <div className="relative column-manager">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Settings className="w-4 h-4" />
        {t('table.manageColumns')}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{t('table.manageColumns')}</h3>
            
            {/* Lista de columnas existentes */}
            <div className="space-y-2 mb-4">
              {sortedColumns.map((column, index) => (
                <div
                key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, column.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`flex items-center gap-2 p-2 border rounded-lg ${
                    draggedColumn === column.id ? 'opacity-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => onToggleColumn(column.id)}
                      className="w-4 h-4"
                    />
                    
                    {editingColumn === column.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 text-sm">
                        {t(`table.${column.name}`)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Botones de movimiento */}
                    <button
                      onClick={() => handleMoveColumn(column.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('table.moveUp')}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveColumn(column.id, 'down')}
                      disabled={index === sortedColumns.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('table.moveDown')}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {/* Botones de edición */}
                    {editingColumn === column.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title={t('common.save')}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title={t('common.cancel')}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(column)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(column.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
            ))}
          </div>

            {/* Formulario para agregar nueva columna */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">{t('table.addNewColumn')}</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={t('table.columnName')}
                  value={newColumn.name}
                  onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={newColumn.type}
                  onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value as 'text' | 'number' | 'date' | 'boolean' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="text">{t('table.textType')}</option>
                  <option value="number">{t('table.numberType')}</option>
                  <option value="date">{t('table.dateType')}</option>
                  <option value="boolean">{t('table.booleanType')}</option>
                </select>
                <button
                  onClick={handleAddColumn}
                  disabled={!newColumn.name.trim()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t('table.addColumn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};