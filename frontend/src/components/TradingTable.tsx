import React, { useState } from 'react';
import { TradeEntry, ColumnDefinition, TradeImage } from '../types/trading';
import { Plus, Trash2 } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { ColumnManager } from './ColumnManager';

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
  onToggleColumn: (columnId: string) => void;
}

// Simple Image Field Component - MINIMALISTA
const SimpleImageField = ({ 
  images, 
  onAdd, 
  onRemove, 
  onImageClick,
  fieldName 
}: { 
  images: TradeImage[] | undefined; 
  onAdd: (image: TradeImage) => void; 
  onRemove: (imageId: string) => void;
  onImageClick: (imageUrl: string, imageName: string) => void;
  fieldName: string;
}) => {
  // SAFE ARRAY - garantizar que siempre sea un array
  const safeImages = Array.isArray(images) ? images : [];
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              const newImage: TradeImage = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: `${fieldName}-${Date.now()}.png`,
                url: result,
                thumbnail: result, // Simplified - same as original
              };
              onAdd(newImage);
            }
          };
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  };

  return (
    <div className="simple-image-field h-20 overflow-hidden" onPaste={handlePaste}>
      <div className="flex flex-wrap gap-1 h-full">
        {safeImages.slice(0, 3).map((image) => (
          <div key={image.id} className="relative">
            <img
              src={image.thumbnail}
              alt={image.name}
              className="w-14 h-14 object-cover rounded border border-gray-600 cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => onImageClick(image.url, image.name)}
              title="Clic para ver en tamaño completo"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(image.id);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        {safeImages.length < 3 && (
          <div 
            className="w-14 h-14 border-2 border-dashed border-gray-600 rounded flex items-center justify-center text-gray-400 text-xs cursor-pointer"
            title="Pegar imagen con Ctrl+V"
          >
            <Plus className="h-3 w-3" />
          </div>
        )}
        {safeImages.length === 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Ctrl+V para pegar
          </div>
        )}
      </div>
    </div>
  );
};

// Main TradingTable Component - COMPLETAMENTE NUEVO Y MINIMALISTA
export function TradingTable({
  entries,
  columns,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onAddImage,
  onRemoveImage,
  onToggleColumn,
}: TradingTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  
  // Estados para el modal de imágenes
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalImageName, setModalImageName] = useState<string | null>(null);

  // Simple add entry handler - NO useCallback, NO optimizations
  const handleAddNewOperation = () => {
    onAddEntry();
  };

  // Simple edit handlers - NO useCallback, NO optimizations
  const startEdit = (entryId: string, field: string, currentValue: any) => {
    setEditingCell(`${entryId}-${field}`);
    setEditingValue(String(currentValue || ''));
  };

  const saveEdit = (entryId: string, field: string) => {
    onUpdateEntry(entryId, { [field]: editingValue });
    setEditingCell(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, entryId: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(entryId, field);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Simple image handlers for specific fields
  const handleImageAdd = (entryId: string, fieldKey: string, image: TradeImage) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    const currentImages = (entry as any)[fieldKey] as TradeImage[] || [];
    onUpdateEntry(entryId, { 
      [fieldKey]: [...currentImages, image] 
    });
  };

  const handleImageRemove = (entryId: string, fieldKey: string, imageId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    const currentImages = (entry as any)[fieldKey] as TradeImage[] || [];
    onUpdateEntry(entryId, { 
      [fieldKey]: currentImages.filter(img => img.id !== imageId) 
    });
  };

  // Funciones para el modal de imágenes
  const handleImageClick = (imageUrl: string, imageName: string) => {
    setModalImageUrl(imageUrl);
    setModalImageName(imageName);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setModalImageUrl(null);
    setModalImageName(null);
  };

  // Get visible columns
  const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);

  // Check if field is one of the 4 specific image fields
  const isImageField = (fieldKey: string) => {
    return ['antes', 'durante', 'entradasNoTomadas', 'queSucedioConEntradasNoTomadas'].includes(fieldKey);
  };

  // Render cell content
  const renderCellContent = (entry: TradeEntry, column: ColumnDefinition) => {
    const value = (entry as any)[column.key];
    const cellId = `${entry.id}-${column.key}`;
    const isEditing = editingCell === cellId;

    // Handle specific image fields
    if (isImageField(column.key)) {
      const images = value as TradeImage[] || [];
      return (
        <SimpleImageField
          images={images}
          onAdd={(image) => handleImageAdd(entry.id, column.key, image)}
          onRemove={(imageId) => handleImageRemove(entry.id, column.key, imageId)}
          onImageClick={handleImageClick}
          fieldName={column.key}
        />
      );
    }

    // Handle boolean field
    if (column.type === 'boolean') {
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
    }

    // Handle editing state
    if (isEditing) {
      // Campos específicos que requieren textarea para saltos de línea
      const textareaFields = ['razonEntrada', 'leccion', 'emocionesAntes', 'emocionesDurante', 'emocionesDespues', 'ratio', 'beneficio'];
      
      if (textareaFields.includes(column.key)) {
        return (
          <textarea
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={(e) => {
              // Solo Enter sin Shift para saltar línea, Enter con Shift para guardar
              if (e.key === 'Enter' && !e.shiftKey) {
                return; // Permitir salto de línea
              } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                saveEdit(entry.id, column.key);
              } else if (e.key === 'Escape') {
                cancelEdit();
              }
            }}
            onBlur={() => saveEdit(entry.id, column.key)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white resize-none"
            rows={3}
            placeholder="Presiona Enter para nueva línea, Shift+Enter para guardar"
            autoFocus
          />
        );
      } else {
        return (
          <input
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, entry.id, column.key)}
            onBlur={() => saveEdit(entry.id, column.key)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            autoFocus
          />
        );
      }
    }

    // Handle normal display
    const textareaFields = ['razonEntrada', 'leccion', 'emocionesAntes', 'emocionesDurante', 'emocionesDespues', 'ratio', 'beneficio'];
    
    return (
      <div
        onClick={() => startEdit(entry.id, column.key, value)}
        className="cursor-pointer hover:bg-gray-700/50 p-1 rounded min-h-[24px] text-sm"
      >
        {value ? (
          textareaFields.includes(column.key) ? (
            // Para campos de texto con posibles saltos de línea, preservar formato
            <span className="whitespace-pre-wrap">{value}</span>
          ) : (
            // Para campos normales
            value
          )
        ) : (
          <span className="text-gray-500 italic">Clic para editar</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Simple controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleAddNewOperation}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Operación</span>
        </button>
        
        <ColumnManager
          columns={columns}
          onToggleColumn={onToggleColumn}
        />
      </div>

      {/* Simple table */}
      <div className="table-container overflow-x-auto overflow-y-auto">
        <table className="w-full bg-gray-900 rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider w-16">
                #
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`px-4 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider ${
                    column.key === 'fecha' ? 'col-fecha' : 
                    column.key === 'hora' ? 'col-hora' : ''
                  }`}
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
                <tr 
                  key={entry.id} 
                  className="hover:bg-gray-800/50 transition-colors"
                  style={{ height: '100px', maxHeight: '100px' }} // ALTURA FIJA APLICADA DIRECTAMENTE
                >
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {index + 1}
                  </td>
                  {visibleColumns.map((column) => (
                    <td 
                      key={column.id} 
                      className={`px-4 py-3 text-sm text-gray-300 ${
                        column.key === 'fecha' ? 'col-fecha' : 
                        column.key === 'hora' ? 'col-hora' : ''
                      }`}
                      style={{ height: '100px', maxHeight: '100px', overflow: 'hidden' }}
                    >
                      {renderCellContent(entry, column)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm" style={{ height: '100px', maxHeight: '100px' }}>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      title="Eliminar operación"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple statistics */}
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

      {/* Modal de imagen */}
      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={modalImageUrl}
        imageName={modalImageName}
        onClose={handleCloseImageModal}
      />
    </div>
  );
}
