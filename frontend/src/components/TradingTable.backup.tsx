import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { TradeEntry, ColumnDefinition, TradeImage } from '../types/trading';
import { ImageManager } from './ImageManager';
import { InlineImageField } from './InlineImageField';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save,
  X,
  Settings,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';

interface TradingTableProps {
  entries: TradeEntry[];
  columns: ColumnDefinition[];
  onAddEntry: () => void;
  onUpdateEntry: (entryId: string, updates: Partial<TradeEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
  onAddImage: (entryId: string, image: TradeImage) => void;
  onRemoveImage: (entryId: string, imageId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<ColumnDefinition>) => void;
  onAddColumn: (column: Omit<ColumnDefinition, 'id' | 'order'>) => void;
  onRemoveColumn: (columnId: string) => void;
}

const TradingTableComponent = ({
  entries,
  columns,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onAddImage,
  onRemoveImage,
  onUpdateColumn,
  onAddColumn,
  onRemoveColumn,
}: TradingTableProps) => {
  // DEBUG LOGGING (REDUCED)
  // console.log('[DEBUG] TradingTable render start - entries:', entries.length);
  
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<ColumnDefinition['type']>('text');
  const [expandedImageRow, setExpandedImageRow] = useState<string | null>(null);
  
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // DEBUG: Monitor entries changes (REDUCED)
  useEffect(() => {
    if (entries.length > 0) {
      console.log('[DEBUG] Entries count:', entries.length);
    }
  }, [entries.length]);

  // DEBUG: Monitor re-renders (FIXED - removed infinite loop)
  // useEffect(() => {
  //   console.log('[DEBUG] TradingTable component re-rendered');
  // }); // ❌ CAUSABA BUCLE INFINITO - ELIMINADO

  // Optimized Add Entry Handler (SIMPLIFIED LOGGING)
  const handleAddEntry = useCallback(() => {
    console.log('[DEBUG] Adding new entry...');
    try {
      onAddEntry();
      console.log('[DEBUG] Entry added successfully');
    } catch (error) {
      console.error('[DEBUG] ERROR in handleAddEntry:', error);
    }
  }, [onAddEntry]);

  // Filtrar columnas visibles y ordenarlas
  const visibleColumns = columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  // Función para manejar imágenes en campos específicos (OPTIMIZADA)
  const handleFieldImageAdd = useCallback((entryId: string, fieldKey: string, image: TradeImage) => {
    try {
      const entry = entries.find(e => e.id === entryId);
      if (!entry) return;

      const currentImages = (entry as any)[fieldKey] as TradeImage[] || [];
      onUpdateEntry(entryId, { 
        [fieldKey]: [...currentImages, image] 
      });
    } catch (error) {
      console.error('[DEBUG] Error adding image:', error);
    }
  }, [entries, onUpdateEntry]);

  const handleFieldImageRemove = useCallback((entryId: string, fieldKey: string, imageId: string) => {
    try {
      const entry = entries.find(e => e.id === entryId);
      if (!entry) return;

      const currentImages = (entry as any)[fieldKey] as TradeImage[] || [];
      onUpdateEntry(entryId, { 
        [fieldKey]: currentImages.filter(img => img.id !== imageId) 
      });
    } catch (error) {
      console.error('[DEBUG] Error removing image:', error);
    }
  }, [entries, onUpdateEntry]);



  const startEditing = useCallback((entryId: string, columnKey: string, currentValue: any) => {
    console.log('[DEBUG] startEditing called:', entryId, columnKey);
    try {
      const cellId = `${entryId}-${columnKey}`;
      setEditingCell(cellId);
      setEditingValue(String(currentValue || ''));
      
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
          if (editInputRef.current instanceof HTMLInputElement) {
            editInputRef.current.select();
        }
      }
    }, 0);
      console.log('[DEBUG] startEditing completed successfully');
    } catch (error) {
      console.error('[DEBUG] Error in startEditing:', error);
    }
  }, []);

  const saveEdit = useCallback((entryId: string, columnKey: string, columnType: ColumnDefinition['type']) => {
    console.log('[DEBUG] saveEdit called:', entryId, columnKey, editingValue);
    try {
      let processedValue: any = editingValue;
      
      // Procesar valor según tipo de columna
      switch (columnType) {
        case 'boolean':
          processedValue = editingValue.toLowerCase() === 'true' || editingValue === '1';
          break;
        case 'number':
          processedValue = parseFloat(editingValue) || 0;
          break;
        default:
          processedValue = editingValue;
      }

      onUpdateEntry(entryId, { [columnKey]: processedValue });
      setEditingCell(null);
      setEditingValue('');
      console.log('[DEBUG] saveEdit completed successfully');
    } catch (error) {
      console.error('[DEBUG] Error in saveEdit:', error);
    }
  }, [editingValue, onUpdateEntry]);

  const cancelEdit = useCallback(() => {
    console.log('[DEBUG] cancelEdit called');
    setEditingCell(null);
    setEditingValue('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, entryId: string, columnKey: string, columnType: ColumnDefinition['type']) => {
    console.log('[DEBUG] handleKeyDown called:', e.key);
    try {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveEdit(entryId, columnKey, columnType);
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    } catch (error) {
      console.error('[DEBUG] Error in handleKeyDown:', error);
    }
  }, [saveEdit, cancelEdit]);

  const addNewColumn = () => {
    if (!newColumnName.trim()) return;
    
    onAddColumn({
      key: newColumnName.toLowerCase().replace(/\s+/g, '_'),
      name: newColumnName,
      type: newColumnType,
      visible: true,
    });
    
    setNewColumnName('');
    setNewColumnType('text');
  };

  const renderCellContent = (entry: TradeEntry, column: ColumnDefinition) => {
    const cellId = `${entry.id}-${column.key}`;
    const isEditing = editingCell === cellId;
    const value = (entry as any)[column.key];

    if (column.type === 'image') {
      // Campo screenshots especial (expandible)
      if (column.key === 'screenshots') {
        return (
          <div>
            <button
              onClick={() => setExpandedImageRow(expandedImageRow === entry.id ? null : entry.id)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
            >
              <span>{entry.screenshots.length} imagen(es)</span>
              {expandedImageRow === entry.id ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
            
            {expandedImageRow === entry.id && (
              <div className="mt-2">
                <ImageManager
                  images={entry.screenshots}
                  onAddImage={(image) => onAddImage(entry.id, image)}
                  onRemoveImage={(imageId) => onRemoveImage(entry.id, imageId)}
                  maxImages={10}
                />
              </div>
            )}
          </div>
        );
      } else {
        // Campos de imagen inline (antes, durante, entradasNoTomadas, queSucedioConEntradasNoTomadas)
        const images = value as TradeImage[] || [];
        return (
          <InlineImageField
            images={images}
            onAddImage={(image) => handleFieldImageAdd(entry.id, column.key, image)}
            onRemoveImage={(imageId) => handleFieldImageRemove(entry.id, column.key, imageId)}
            maxImages={3}
          />
        );
      }
    }

    if (isEditing) {
      const commonProps = {
        ref: editInputRef as any,
        value: editingValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditingValue(e.target.value),
        onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, entry.id, column.key, column.type),
        onBlur: () => saveEdit(entry.id, column.key, column.type),
        className: "w-full bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400",
      };

      if (column.type === 'text' && column.key.includes('leccion') || column.key.includes('notas') || column.key.includes('observaciones')) {
        return <textarea {...commonProps} rows={2} />;
      }

      return <input {...commonProps} type={column.type === 'number' ? 'number' : 'text'} />;
    }

    // Mostrar valor según tipo
    switch (column.type) {
      case 'boolean':
        return (
          <button
            onClick={() => onUpdateEntry(entry.id, { [column.key]: !value })}
            className={`px-3 py-1 rounded text-xs font-medium ${
              value 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
          >
            {value ? 'SÍ' : 'NO'}
          </button>
        );
      case 'date':
        return <span className="text-blue-300">{value || '-'}</span>;
      case 'time':
        return <span className="text-green-300">{value || '-'}</span>;
      default:
        return (
          <div
            onClick={() => startEditing(entry.id, column.key, value)}
            className="cursor-pointer hover:bg-gray-700/50 p-1 rounded min-h-[24px] text-sm"
          >
            {value || <span className="text-gray-500 italic">Clic para editar</span>}
          </div>
        );
    }
  };



  return (
    <div className="space-y-4">
      {/* Controles de la tabla */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleAddEntry}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Operación</span>
        </button>

        <button
          onClick={() => setShowColumnSettings(!showColumnSettings)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Columnas</span>
        </button>
      </div>

      {/* Configuración de columnas */}
      {showColumnSettings && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gold-300 mb-4">Configuración de Columnas</h3>
          
          {/* Agregar nueva columna */}
          <div className="mb-4 p-3 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Agregar Nueva Columna</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nombre de la columna"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
              <select
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value as ColumnDefinition['type'])}
                className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="boolean">Sí/No</option>
                <option value="date">Fecha</option>
                <option value="time">Hora</option>
              </select>
              <button
                onClick={addNewColumn}
                disabled={!newColumnName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Lista de columnas existentes */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Columnas Existentes</h4>
            {columns.map((column) => (
              <div key={column.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div className="flex items-center space-x-3">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <span className="text-white text-sm">{column.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                    {column.type}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateColumn(column.id, { visible: !column.visible })}
                    className={`p-1 rounded ${
                      column.visible 
                        ? 'text-green-400 hover:text-green-300' 
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {column.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  
                  {!column.key.includes('fecha') && !column.key.includes('hora') && (
                    <button
                      onClick={() => onRemoveColumn(column.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto bg-gray-900 border border-gray-700 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider w-16">
                #
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider min-w-[120px]"
                >
                  {column.name}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider w-16">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {entries.length === 0 ? (
              <tr>
                <td 
                  colSpan={visibleColumns.length + 2} 
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No hay operaciones registradas. Haz clic en "Nueva Operación" para comenzar.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <React.Fragment key={entry.id}>
                  <tr className="hover:bg-gray-800/50 transition-colors table-row-fixed">
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {index + 1}
                    </td>
                    {visibleColumns.map((column) => (
                      <td 
                        key={column.id} 
                        className="px-4 py-3 text-sm text-gray-300 table-cell-fixed"
                      >
                        {renderCellContent(entry, column)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm table-cell-fixed">
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Eliminar operación"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Fila expandida para imágenes */}
                  {expandedImageRow === entry.id && (
                    <tr>
                      <td colSpan={visibleColumns.length + 2} className="px-4 py-4 bg-gray-800/30">
                        <div className="max-w-4xl">
                          <h4 className="text-sm font-medium text-gold-300 mb-3">
                            Screenshots de la Operación
                          </h4>
                          <ImageManager
                            images={entry.screenshots}
                            onAddImage={(image) => onAddImage(entry.id, image)}
                            onRemoveImage={(imageId) => onRemoveImage(entry.id, imageId)}
                            maxImages={10}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Estadísticas rápidas */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Total Operaciones</div>
            <div className="text-xl font-bold text-white">{entries.length}</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Plan Cumplido</div>
            <div className="text-xl font-bold text-green-400">
              {entries.filter(e => e.seCumplioElPlan).length}
            </div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Plan No Cumplido</div>
            <div className="text-xl font-bold text-red-400">
              {entries.filter(e => !e.seCumplioElPlan).length}
            </div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Con Screenshots</div>
            <div className="text-xl font-bold text-blue-400">
              {entries.filter(e => e.screenshots.length > 0).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export optimized component with React.memo for performance
export const TradingTable = memo(TradingTableComponent);
