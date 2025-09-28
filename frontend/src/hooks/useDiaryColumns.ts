import { useState, useEffect, useCallback } from 'react';
import { ColumnDefinition, DEFAULT_COLUMNS } from '../types/trading';
import { getColumnsWithFallback, saveColumnsWithFallback } from '../services/columnService';
import { useAuth } from './useAuth';

export const useDiaryColumns = () => {
  const { user } = useAuth();
  const [columns, setColumns] = useState<ColumnDefinition[]>(DEFAULT_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id || null;
  const localStorageKey = 'nagual-trader-journal-state';

  // Cargar columnas al inicializar
  useEffect(() => {
    const loadColumns = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedColumns = await getColumnsWithFallback(
          userId,
          'diary',
          localStorageKey,
          DEFAULT_COLUMNS
        );
        
        setColumns(loadedColumns);
      } catch (err) {
        console.error('Error loading columns:', err);
        setError('Error al cargar las columnas');
        setColumns(DEFAULT_COLUMNS);
      } finally {
        setLoading(false);
      }
    };

    loadColumns();
  }, [userId, localStorageKey]);

  // Guardar columnas cuando cambien
  const saveColumns = useCallback(async (newColumns: ColumnDefinition[]) => {
    try {
      setError(null);
      
      const success = await saveColumnsWithFallback(
        userId,
        'diary',
        newColumns,
        localStorageKey
      );
      
      if (success) {
        setColumns(newColumns);
      } else {
        setError('Error al guardar las columnas');
      }
    } catch (err) {
      console.error('Error saving columns:', err);
      setError('Error al guardar las columnas');
    }
  }, [userId, localStorageKey]);

  // Agregar nueva columna
  const addColumn = useCallback((column: Omit<ColumnDefinition, 'id' | 'order'>) => {
    const newColumn: ColumnDefinition = {
      ...column,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      order: columns.length + 1
    };
    
    const newColumns = [...columns, newColumn];
    saveColumns(newColumns);
  }, [columns, saveColumns]);

  // Actualizar columna existente
  const updateColumn = useCallback((columnId: string, updates: Partial<ColumnDefinition>) => {
    const newColumns = columns.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    );
    saveColumns(newColumns);
  }, [columns, saveColumns]);

  // Eliminar columna
  const deleteColumn = useCallback((columnId: string) => {
    const newColumns = columns.filter(col => col.id !== columnId);
    // Reordenar las columnas restantes
    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index + 1
    }));
    saveColumns(reorderedColumns);
  }, [columns, saveColumns]);

  // Cambiar visibilidad de columna
  const toggleColumnVisibility = useCallback((columnId: string) => {
    const newColumns = columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    saveColumns(newColumns);
  }, [columns, saveColumns]);

  // Reordenar columnas
  const reorderColumns = useCallback((columnId: string, direction: 'up' | 'down') => {
    const columnIndex = columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) return;

    const newIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(columnIndex, 1);
    newColumns.splice(newIndex, 0, movedColumn);

    // Actualizar el orden
    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index + 1
    }));

    saveColumns(reorderedColumns);
  }, [columns, saveColumns]);

  // Obtener columnas visibles
  const visibleColumns = columns.filter(col => col.visible);

  return {
    columns,
    visibleColumns,
    loading,
    error,
    addColumn,
    updateColumn,
    deleteColumn,
    toggleColumnVisibility,
    reorderColumns,
    saveColumns
  };
};
