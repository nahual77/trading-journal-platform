import React, { useState, useMemo } from 'react';
import { TradeEntry, ColumnDefinition, TradeImage } from '../types/trading';
import { Plus, Trash2, Search, Calendar, RotateCcw } from 'lucide-react';
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
function TradingTable({
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
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TradeEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Get visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columns]);

  // Check if field is one of the 4 specific image fields
  const isImageField = (fieldKey: string) => {
    return ['antes', 'durante', 'entradasNoTomadas', 'queSucedioConEntradasNoTomadas'].includes(fieldKey);
  };

  // Función para comparar valores de cualquier tipo
  const compareValues = (a: any, b: any, direction: 'asc' | 'desc', columnKey?: string): number => {
    // Si alguno de los valores es undefined o null, ponerlo al final
    if (a === undefined || a === null) return direction === 'desc' ? 1 : -1;
    if (b === undefined || b === null) return direction === 'desc' ? -1 : 1;

    // Manejar campos especiales
    if (columnKey) {
      // Para campos de imágenes, comparar por cantidad de imágenes
      if (Array.isArray(a) && Array.isArray(b) && isImageField(columnKey)) {
        return direction === 'desc'
          ? b.length - a.length
          : a.length - b.length;
      }

      // Para el campo tipoOperacion
      if (columnKey === 'tipoOperacion') {
        const aValue = a === 'compra' ? 1 : 0;
        const bValue = b === 'compra' ? 1 : 0;
        return direction === 'desc'
          ? bValue - aValue
          : aValue - bValue;
      }

      // Para campos booleanos como seCumplioElPlan
      if (typeof a === 'boolean' && typeof b === 'boolean') {
        return direction === 'desc'
          ? (a === b ? 0 : a ? -1 : 1)
          : (a === b ? 0 : a ? 1 : -1);
      }
    }

    // Convertir fechas si los valores tienen formato de fecha
    if (typeof a === 'string' && a.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return direction === 'desc' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    }

    // Comparar números
    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'desc' ? b - a : a - b;
    }

    // Comparar strings (case insensitive)
    if (typeof a === 'string' && typeof b === 'string') {
      const aStr = a.toLowerCase();
      const bStr = b.toLowerCase();
      if (aStr < bStr) return direction === 'desc' ? 1 : -1;
      if (aStr > bStr) return direction === 'desc' ? -1 : 1;
      return 0;
    }

    return 0;
  };

  // Ordenar y paginar entradas
  const { displayEntries, totalPages, tableHeight } = useMemo(() => {
    const entriesToSort = isSearching ? searchResults : entries;
    const sorted = [...entriesToSort].sort((a, b) => {
      // Primero ordenar por fecha y hora
      const dateA = new Date(`${a.fecha} ${a.hora}`);
      const dateB = new Date(`${b.fecha} ${b.hora}`);
      const dateCompare = sortDirection === 'desc' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
      
      return dateCompare;
    });

    // Asignar números de operación después del ordenamiento
    const numberedEntries = sorted.map((entry, index) => ({
      ...entry,
      operationNumber: sortDirection === 'desc' 
        ? sorted.length - index 
        : index + 1
    }));

    // Calcular paginación
    const totalPages = Math.ceil(numberedEntries.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, numberedEntries.length);
    const displayEntries = numberedEntries.slice(startIndex, endIndex);

    // Calcular altura de la tabla basada en la cantidad de entradas
    const headerHeight = 60; // Altura del header
    const rowHeight = 120; // Altura de cada fila (aumentada)
    const padding = 40; // Padding adicional para evitar cortes
    const tableHeight = headerHeight + (displayEntries.length * rowHeight) + padding;

    return { displayEntries, totalPages, tableHeight };
  }, [entries, searchResults, isSearching, sortDirection, pageSize, currentPage]);

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

  // Función de búsqueda y filtrado
  const handleSearch = () => {
    // Si no hay término de búsqueda ni fechas, limpiar resultados
    if (!searchTerm.trim() && !dateFrom && !dateTo) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    let results = [...entries];

    // Filtrar por texto si existe
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(entry => {
        return Object.entries(entry).some(([key, value]) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(term);
          }
          if (typeof value === 'number') {
            return value.toString().includes(term);
          }
          return false;
        });
      });
    }

    // Filtrar por fecha si existe
    if (dateFrom || dateTo) {
      results = results.filter(entry => {
        const entryDate = new Date(entry.fecha);
        
        if (dateFrom && dateTo) {
          const from = new Date(dateFrom);
          const to = new Date(dateTo);
          return entryDate >= from && entryDate <= to;
        }
        
        if (dateFrom) {
          const from = new Date(dateFrom);
          return entryDate >= from;
        }
        
        if (dateTo) {
          const to = new Date(dateTo);
          return entryDate <= to;
        }

        return true;
      });
    }
    
    setSearchResults(results);
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

    // Handle tipo operacion field
    if (column.key === 'tipoOperacion') {
      const isCompra = value === 'compra';
      return (
        <button
          onClick={() => onUpdateEntry(entry.id, { [column.key]: isCompra ? 'venta' : 'compra' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
            isCompra 
              ? 'bg-green-600 text-green-100 hover:bg-green-700' 
              : 'bg-red-600 text-red-100 hover:bg-red-700'
          }`}
        >
          {isCompra ? 'COMPRA' : 'VENTA'}
        </button>
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
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-lg text-white resize-none"
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
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-lg text-white"
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
        className="cursor-pointer hover:bg-gray-700/50 p-1 rounded min-h-[24px] text-lg"
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
    <div className="space-y-4" style={{ overflow: 'hidden' }}>
      {/* Simple controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleAddNewOperation}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Operación</span>
        </button>
        
        {/* Filtros centrados */}
        <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700">
          {/* Búsqueda compacta */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar..."
                className="pl-6 pr-2 py-1 bg-gray-700 border border-gray-600 rounded-l text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm w-32"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-2 py-1 bg-blue-600 text-white rounded-r text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Search className="h-3 w-3" />
              Buscar
            </button>
            {isSearching && searchResults.length > 0 && (
              <span className="text-sm text-gray-400">
                ({searchResults.length} resultados)
              </span>
            )}
          </div>

          {/* Filtros de fecha compactos */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              title="Fecha desde"
            />
            <span className="text-gray-400 text-sm">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              title="Fecha hasta"
            />
          </div>

          {/* Ordenar compacto */}
          <button
            onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-2 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors flex items-center gap-1"
            title={sortDirection === 'desc' ? 'Ordenar más antiguo primero' : 'Ordenar más reciente primero'}
          >
            {sortDirection === 'desc' ? '↓ Reciente' : '↑ Antiguo'}
          </button>

          {/* Filtros rápidos compactos */}
          <div className="flex items-center gap-1">
            <button className="px-1 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors" title="Hoy">
              Hoy
            </button>
            <button className="px-1 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors" title="7 días">
              7d
            </button>
            <button className="px-1 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors" title="30 días">
              30d
            </button>
          </div>

          {/* Cantidad por página compacta */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-400">Mostrar:</span>
            <select 
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // Reset a la primera página al cambiar el tamaño
              }}
              className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={9999}>Todas</option>
            </select>
          </div>

          {/* Limpiar filtros compacto */}
          <button 
            onClick={() => {
              setSearchTerm('');
              setDateFrom('');
              setDateTo('');
              setSearchResults([]);
              setIsSearching(false);
              setSortDirection('desc');
              setCurrentPage(1);
              setPageSize(10);
            }} 
            className="p-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition-colors flex items-center gap-1" 
            title="Limpiar filtros"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="text-sm">Limpiar</span>
          </button>
        </div>
        
        <ColumnManager
          columns={columns}
          onToggleColumn={onToggleColumn}
        />
      </div>

      {/* Simple table */}
      <div 
        className="table-container"
        style={{ 
          height: `${tableHeight}px`,
          overflow: 'hidden'
        }}
      >
        <table className="w-full bg-gray-900 rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gold-300 uppercase tracking-wider w-16">
                #
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`px-4 py-3 text-left text-sm font-medium text-gold-300 uppercase tracking-wider ${
                    column.key === 'fecha' ? 'col-fecha' : 
                    column.key === 'hora' ? 'col-hora' : ''
                  }`}
                >
                  {column.name}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-medium text-gold-300 uppercase tracking-wider w-16">
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
              displayEntries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className="hover:bg-gray-800/50 transition-colors"
                  style={{ height: '120px' }}
                >
                  <td className="px-4 py-3 text-lg text-gray-300">
                    {entry.operationNumber}
                  </td>
                  {visibleColumns.map((column) => (
                    <td 
                      key={column.id} 
                      className={`px-4 py-3 text-lg text-gray-300 ${
                        column.key === 'fecha' ? 'col-fecha' : 
                        column.key === 'hora' ? 'col-hora' : ''
                      }`}
                      style={{ height: '120px', maxHeight: '120px', overflow: 'hidden' }}
                    >
                      {renderCellContent(entry, column)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-lg" style={{ height: '120px', maxHeight: '120px' }}>
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 text-sm rounded ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Primera
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 text-sm rounded ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 text-sm rounded ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Siguiente
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 text-sm rounded ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Última
            </button>
          </div>
          <div className="text-sm text-gray-400">
            Mostrando {displayEntries.length} de {entries.length} operaciones
          </div>
        </div>
      )}

      {/* Simple statistics */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Total Operaciones</div>
            <div className="text-xl font-bold text-white">{entries.length}</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Plan Cumplido</div>
            <div className="text-xl font-bold text-green-400">
              {entries.filter(e => e.seCumplioElPlan).length}
            </div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Plan No Cumplido</div>
            <div className="text-xl font-bold text-red-400">
              {entries.filter(e => !e.seCumplioElPlan).length}
            </div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Compras vs Ventas</div>
            <div className="flex gap-2 items-center">
              <div>
                <div className="text-sm text-green-400">Compras</div>
                <div className="text-lg font-bold text-green-400">
                  {entries.filter(e => e.tipoOperacion === 'compra').length}
                </div>
              </div>
              <div className="text-gray-500">vs</div>
              <div>
                <div className="text-sm text-red-400">Ventas</div>
                <div className="text-lg font-bold text-red-400">
                  {entries.filter(e => e.tipoOperacion === 'venta').length}
                </div>
              </div>
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

export default TradingTable;
