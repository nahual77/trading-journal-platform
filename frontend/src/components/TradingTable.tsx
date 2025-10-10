import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TradeEntry, ColumnDefinition, TradeImage } from '../types/trading';
import { Plus, Trash2, Search, Calendar, RotateCcw } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { DiaryColumnManager } from './DiaryColumnManager';
import { TranslatableDatePicker } from './TranslatableDatePicker';

interface TradingTableProps {
  entries: TradeEntry[];
  columns: ColumnDefinition[];
  onAddEntry: () => void;
  onUpdateEntry: (entryId: string, updates: Partial<TradeEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
  onAddImage: (entryId: string, image: TradeImage) => void;
  onRemoveImage: (entryId: string, imageId: string) => void;
  onColumnsChange: (columns: ColumnDefinition[]) => void;
  onToggleColumn: (columnId: string) => void;
  onReorderColumns?: (columnId: string, direction: 'up' | 'down') => void;
}

// Simple Image Field Component - MINIMALISTA
const SimpleImageField = ({
  images,
  onAdd,
  onRemove,
  onImageClick,
  fieldName,
  entryId,
  onActivateField,
  activeImageField
}: {
  images: TradeImage[] | undefined;
  onAdd: (image: TradeImage) => void;
  onRemove: (imageId: string) => void;
  onImageClick: (imageUrl: string, imageName: string) => void;
  fieldName: string;
  entryId: string;
  onActivateField: (entryId: string, fieldKey: string) => void;
  activeImageField: { entryId: string, fieldKey: string } | null;
}) => {
  // SAFE ARRAY - garantizar que siempre sea un array
  const safeImages = Array.isArray(images) ? images : [];

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🖼️ Paste event detected in SimpleImageField');

    const items = e.clipboardData.items;
    console.log('📋 Clipboard items:', items.length);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log('📄 Item type:', item.type);

      if (item.type.startsWith('image/')) {
        console.log('✅ Image detected, processing...');
        const blob = item.getAsFile();
        if (blob) {
          console.log('📁 Blob size:', blob.size);
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              console.log('✅ Image converted to base64, length:', result.length);
              const newImage: TradeImage = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: `${fieldName}-${Date.now()}.png`,
                url: result,
                thumbnail: result, // Simplified - same as original
              };
              console.log('🖼️ Replacing image:', newImage.name);

              // Si ya hay una imagen, removerla primero
              if (safeImages.length > 0) {
                onRemove(safeImages[0].id);
              }

              // Agregar la nueva imagen
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
    <div
      className={`simple-image-field h-20 overflow-hidden cursor-pointer border-2 rounded ${activeImageField?.entryId === entryId && activeImageField?.fieldKey === fieldName
        ? 'border-blue-500 bg-blue-500/10'
        : 'border-transparent hover:border-gray-500'
        }`}
      onPaste={handlePaste}
      onClick={() => {
        console.log('🎯 Activating image field:', entryId, fieldName);
        onActivateField(entryId, fieldName);
      }}
      tabIndex={0}
      onFocus={(e) => e.target.focus()}
      style={{ outline: 'none' }}
    >
      <div className="flex flex-wrap gap-1 h-full">
        {safeImages.length > 0 ? (
          <div className="relative">
            <img
              src={safeImages[0].thumbnail}
              alt={safeImages[0].name}
              className="w-16 h-16 object-cover rounded border border-gray-600 cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => onImageClick(safeImages[0].url, safeImages[0].name)}
              title="Clic para ver en tamaño completo"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(safeImages[0].id);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            className="w-16 h-16 border-2 border-dashed border-gray-600 rounded flex flex-col items-center justify-center text-gray-400 text-xs cursor-pointer hover:border-gray-500 transition-colors"
            title="Pegar imagen con Ctrl+V"
          >
            <Plus className="h-4 w-4 mb-1" />
            <span className="text-xs text-gray-500">Ctrl+V</span>
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
  onColumnsChange,
  onToggleColumn,
  onReorderColumns,
}: TradingTableProps) {
  const { t } = useTranslation();
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
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Estado para el campo de imagen activo
  const [activeImageField, setActiveImageField] = useState<{ entryId: string, fieldKey: string } | null>(null);

  // Ajustar página actual cuando cambie el pageSize
  useEffect(() => {
    const totalPages = Math.ceil(entries.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, entries.length, currentPage]);

  // Listener global para pegado de imágenes
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      console.log('🌍 Global paste event detected');

      if (activeImageField) {
        console.log('🎯 Active image field found:', activeImageField);

        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
              console.log('✅ Image detected in global paste');
              e.preventDefault();
              e.stopPropagation();

              const blob = item.getAsFile();
              if (blob) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const result = event.target?.result as string;
                  if (result) {
                    const newImage: TradeImage = {
                      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                      name: `${activeImageField.fieldKey}-${Date.now()}.png`,
                      url: result,
                      thumbnail: result,
                    };
                    console.log('🖼️ Replacing image in field:', activeImageField.fieldKey);
                    // Usar onUpdateEntry directamente - REEMPLAZAR en lugar de agregar
                    const entry = entries.find(e => e.id === activeImageField.entryId);
                    if (entry) {
                      // Solo mantener una imagen (reemplazar la existente)
                      onUpdateEntry(activeImageField.entryId, {
                        [activeImageField.fieldKey]: [newImage]
                      });
                    }
                  }
                };
                reader.readAsDataURL(blob);
              }
              break;
            }
          }
        }
      }
    };

    // Agregar listener con capture: true para capturar antes que otros elementos
    document.addEventListener('paste', handleGlobalPaste, true);
    return () => document.removeEventListener('paste', handleGlobalPaste, true);
  }, [activeImageField, entries, onUpdateEntry]);

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
    const headerHeight = 50; // Altura del header
    const rowHeight = 100; // Altura de cada fila (reducida)
    const padding = 30; // Padding adicional para evitar cortes
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
          return entryDate >= dateFrom && entryDate <= dateTo;
        }

        if (dateFrom) {
          return entryDate >= dateFrom;
        }

        if (dateTo) {
          return entryDate <= dateTo;
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
          entryId={entry.id}
          onActivateField={(entryId, fieldKey) => setActiveImageField({ entryId, fieldKey })}
          activeImageField={activeImageField}
        />
      );
    }

    // Handle tipo operacion field - 3 estados: neutro, compra, venta
    if (column.key === 'tipoOperacion') {
      const getNextState = (currentValue: string) => {
        if (!currentValue || currentValue === '') return 'compra';
        if (currentValue === 'compra') return 'venta';
        if (currentValue === 'venta') return '';
        return 'compra';
      };

      const getButtonStyles = (currentValue: string) => {
        if (!currentValue || currentValue === '') {
          return 'bg-blue-900 text-blue-200 border border-blue-500/30 hover:bg-blue-800 hover:border-blue-400/50 shadow-lg shadow-blue-500/20';
        }
        if (currentValue === 'compra') {
          return 'bg-green-600 text-green-100 hover:bg-green-700 border border-green-500/30 shadow-lg shadow-green-500/20';
        }
        if (currentValue === 'venta') {
          return 'bg-red-600 text-red-100 hover:bg-red-700 border border-red-500/30 shadow-lg shadow-red-500/20';
        }
        return 'bg-blue-900 text-blue-200 border border-blue-500/30 hover:bg-blue-800 hover:border-blue-400/50 shadow-lg shadow-blue-500/20';
      };

      const getButtonText = (currentValue: string) => {
        if (!currentValue || currentValue === '') {
          return t('table.buyOrSell');
        }
        if (currentValue === 'compra') {
          return t('table.buy').toUpperCase();
        }
        if (currentValue === 'venta') {
          return t('table.sell').toUpperCase();
        }
        return t('table.buyOrSell');
      };

      return (
        <button
          onClick={() => onUpdateEntry(entry.id, { [column.key]: getNextState(value) })}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-all transform hover:scale-105 ${getButtonStyles(value)}`}
        >
          {getButtonText(value)}
        </button>
      );
    }

    // Handle boolean field
    if (column.type === 'boolean') {
      return (
        <button
          onClick={() => onUpdateEntry(entry.id, { [column.key]: !value })}
          className={`px-3 py-1 rounded text-xs font-medium ${value
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
            }`}
        >
          {value ? t('common.yes') : t('common.no')}
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
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white resize-none"
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
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
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
        className="cursor-pointer hover:bg-gray-700/50 p-1 rounded min-h-[20px] text-sm"
      >
        {value ? (
          textareaFields.includes(column.key) ? (
            // Para campos de texto con posibles saltos de línea, preservar formato
            <span className="whitespace-pre-wrap text-sm">{value}</span>
          ) : (
            // Para campos normales
            <span className="text-sm">{value}</span>
          )
        ) : (
          <span className="text-gray-500 italic text-sm">{t('table.clickToEdit')}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4" style={{ overflow: 'hidden' }}>
      {/* Simple controls */}
      <div className="flex items-center justify-between">
        {/* Botón Nueva Operación */}
        <button
          onClick={onAddEntry}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{t('tradingJournal.newOperation')}</span>
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
                placeholder=""
                className="pl-6 pr-2 py-1 bg-gray-700 border border-gray-600 rounded-l text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm w-32"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-2 py-1 bg-blue-600 text-white rounded-r text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Search className="h-3 w-3" />
              {t('filters.search')}
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
            <TranslatableDatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder={t('filters.dateFrom')}
              className="h-8 text-sm"
            />
            <span className="text-gray-400 text-sm">-</span>
            <TranslatableDatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder={t('filters.dateTo')}
              className="h-8 text-sm"
            />
          </div>

          {/* Ordenar compacto */}
          <button
            onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-2 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors flex items-center gap-1"
            title={sortDirection === 'desc' ? t('filters.sortOldestFirst') : t('filters.sortNewestFirst')}
          >
            {sortDirection === 'desc' ? t('filters.recent') : t('filters.oldest')}
          </button>

          {/* Filtros rápidos compactos */}
          <div className="flex items-center gap-1">
            <button className="px-1 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors" title={t('filters.today')}>
              {t('filters.today')}
            </button>
            <button className="px-1 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors" title={t('filters.7days')}>
              {t('filters.7days')}
            </button>
            <button className="px-1 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors" title={t('filters.30days')}>
              {t('filters.30days')}
            </button>
          </div>

          {/* Cantidad por página compacta */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-400">{t('filters.show')}:</span>
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
              <option value={9999}>{t('filters.all')}</option>
            </select>
          </div>

          {/* Limpiar filtros compacto */}
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFrom(undefined);
              setDateTo(undefined);
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
            <span className="text-sm">{t('filters.clearFilters')}</span>
          </button>
        </div>

        <DiaryColumnManager
          columns={columns}
          onColumnsChange={onColumnsChange}
          onToggleColumn={onToggleColumn}
          onReorderColumns={onReorderColumns}
        />
      </div>

      {/* Simple table */}
      <div
        className="table-container"
        style={{
          height: `${tableHeight}px`,
          overflowX: 'auto',
          overflowY: 'hidden'
        }}
      >
        <table className="w-full bg-gray-900 rounded-lg" style={{ minWidth: '1800px' }}>
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-3 py-2 text-left text-xs font-medium text-gold-300 uppercase tracking-wider w-16">
                #
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`px-3 py-2 text-left text-xs font-medium text-gold-300 uppercase tracking-wider table-header-multiline ${column.key === 'fecha' ? 'col-fecha' :
                    column.key === 'hora' ? 'col-hora' :
                      isImageField(column.key) ? 'col-image' : ''
                    }`}
                  style={{
                    whiteSpace: 'pre-line',
                    wordWrap: 'break-word',
                    lineHeight: '1.2',
                    maxWidth: '120px',
                    height: 'auto',
                    minHeight: '60px',
                    padding: '8px 12px',
                    textAlign: 'left',
                    verticalAlign: 'top'
                  }}
                >
                  {t(`table.${column.name.replace(/^table\./, '').replace(/^TABLE\./, '')}`)
                    .replace('Tipo Operación', 'Tipo\nOperación')
                    .replace('Razón de entrada', 'Razón\nde entrada')
                    .replace('Se cumplió el plan?', 'Se cumplió\nel plan?')
                    .replace('Emociones (antes)', 'Emociones\n(antes)')
                    .replace('Emociones (durante)', 'Emociones\n(durante)')
                    .replace('Emociones (después)', 'Emociones\n(después)')
                    .replace('Entry Reason', 'Razón\nde entrada')
                    .replace('Plan Followed', 'Se cumplió\nel plan?')
                    .replace('Emotions Before', 'Emociones\n(antes)')
                    .replace('Emotions During', 'Emociones\n(durante)')
                    .replace('Emotions After', 'Emociones\n(después)')
                    .replace('Entries Not Taken', 'Entradas\nno tomadas')
                    .replace('What Happened With Entries', 'Qué pasó\ncon entradas')
                  }
                </th>
              ))}
              <th className="px-3 py-2 text-left text-xs font-medium text-gold-300 uppercase tracking-wider w-16">
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="px-4 py-8 text-center text-sm text-gray-400"
                >
                  {t('table.noOperations')}
                </td>
              </tr>
            ) : (
              displayEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-800/50 transition-colors"
                  style={{ height: '100px' }}
                >
                  <td className="px-3 py-2 text-xs text-gray-300">
                    {entry.operationNumber}
                  </td>
                  {visibleColumns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-3 py-2 text-xs text-gray-300 ${column.key === 'fecha' ? 'col-fecha' :
                        column.key === 'hora' ? 'col-hora' :
                          isImageField(column.key) ? 'col-image' : ''
                        }`}
                      style={{ height: '100px', maxHeight: '100px', overflow: 'hidden' }}
                    >
                      {renderCellContent(entry, column)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-xs" style={{ height: '100px', maxHeight: '100px' }}>
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
              className={`px-2 py-1 text-sm rounded ${currentPage === 1
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
            >
              {t('table.first')}
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 text-sm rounded ${currentPage === 1
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
            >
              {t('table.previous')}
            </button>
            <span className="text-sm text-gray-400">
              {t('table.page')} {currentPage} {t('table.of')} {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 text-sm rounded ${currentPage === totalPages
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
            >
              {t('table.next')}
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 text-sm rounded ${currentPage === totalPages
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
            >
              {t('table.last')}
            </button>
          </div>
          <div className="text-sm text-gray-400">
            {t('table.showing')} {displayEntries.length} {t('table.of')} {entries.length} {t('table.operations')}
          </div>
        </div>
      )}

      {/* Simple statistics */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">{t('tradingJournal.totalOperations')}</div>
            <div className="text-sm font-bold text-white">{entries.length}</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">{t('table.planFollowed')}</div>
            <div className="text-sm font-bold text-green-400">
              {entries.filter(e => e.seCumplioElPlan).length}
            </div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">{t('table.planNotFollowed')}</div>
            <div className="text-sm font-bold text-red-400">
              {entries.filter(e => !e.seCumplioElPlan).length}
            </div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">{t('table.buysVsSells')}</div>
            <div className="flex gap-2 items-center">
              <div>
                <div className="text-sm text-green-400">{t('table.buy')}</div>
                <div className="text-sm font-bold text-green-400">
                  {entries.filter(e => e.tipoOperacion === 'compra').length}
                </div>
              </div>
              <div className="text-gray-500">vs</div>
              <div>
                <div className="text-sm text-red-400">{t('table.sell')}</div>
                <div className="text-sm font-bold text-red-400">
                  {entries.filter(e => e.tipoOperacion === 'venta').length}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('table.neutralOperations')}: {entries.filter(e => !e.tipoOperacion || (e.tipoOperacion as string) === '').length}
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
