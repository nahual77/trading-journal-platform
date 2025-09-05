import React, { useState, useMemo } from 'react';
import { TradeEntry, ColumnDefinition, TradeImage } from '../types/trading';
import { Search, Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import TradingTable from './TradingTable';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from './ui/pagination';

interface TradingTableWithFiltersProps {
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

interface FilterState {
  searchText: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'fecha' | 'beneficio' | 'simbolo';
  sortOrder: 'asc' | 'desc';
  pageSize: 10 | 20 | 50 | 100;
  currentPage: number;
}

export function TradingTableWithFilters(props: TradingTableWithFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'fecha',
    sortOrder: 'desc',
    pageSize: 20,
    currentPage: 1
  });


  // Filtrar y ordenar entradas
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...props.entries];

    // Filtro por texto de búsqueda
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(entry => 
        entry.simbolo?.toLowerCase().includes(searchLower) ||
        entry.fecha?.toLowerCase().includes(searchLower) ||
        entry.hora?.toLowerCase().includes(searchLower) ||
        entry.beneficio?.toString().includes(searchLower) ||
        entry.comentarios?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rango de fechas
    if (filters.dateFrom) {
      result = result.filter(entry => entry.fecha >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter(entry => entry.fecha <= filters.dateTo);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let aValue: any = a[filters.sortBy];
      let bValue: any = b[filters.sortBy];

      // Manejo especial para fechas
      if (filters.sortBy === 'fecha') {
        aValue = new Date(`${a.fecha} ${a.hora}`).getTime();
        bValue = new Date(`${b.fecha} ${b.hora}`).getTime();
      }
      // Manejo especial para números
      else if (filters.sortBy === 'beneficio') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      // Manejo para strings
      else {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [props.entries, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedEntries.length / filters.pageSize);
  const startIndex = (filters.currentPage - 1) * filters.pageSize;
  const endIndex = startIndex + filters.pageSize;
  const paginatedEntries = filteredAndSortedEntries.slice(startIndex, endIndex);

  // Funciones para actualizar filtros
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      // Resetear página cuando se cambian los filtros (excepto pageSize y currentPage)
      currentPage: key === 'pageSize' || key === 'currentPage' ? prev.currentPage : 1
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      searchText: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'fecha',
      sortOrder: 'desc',
      pageSize: 20,
      currentPage: 1
    });
  };

  // Filtros rápidos de fecha
  const setQuickDateFilter = (days: number) => {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - days);
    
    updateFilter('dateFrom', fromDate.toISOString().split('T')[0]);
    updateFilter('dateTo', today.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">

      {/* Información de resultados */}
      <div className="text-xl text-gray-400">
        <span>
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedEntries.length)} de {filteredAndSortedEntries.length} operaciones
          {props.entries.length !== filteredAndSortedEntries.length && (
            <span className="text-blue-400"> (filtradas de {props.entries.length} total)</span>
          )}
        </span>
      </div>

      {/* Tabla */}
      <TradingTable 
        {...props}
        entries={paginatedEntries}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => updateFilter('currentPage', Math.max(1, filters.currentPage - 1))}
                  className={filters.currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {/* Páginas */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (filters.currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (filters.currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = filters.currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => updateFilter('currentPage', pageNumber)}
                      isActive={filters.currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => updateFilter('currentPage', Math.min(totalPages, filters.currentPage + 1))}
                  className={filters.currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
