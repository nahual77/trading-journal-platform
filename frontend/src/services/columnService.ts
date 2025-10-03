import { ColumnDefinition } from '../types/trading';

export interface UserTableColumns {
  id: string;
  user_id: string;
  table_type: 'diary' | 'backtesting';
  column_config: ColumnDefinition[];
  created_at: string;
  updated_at: string;
}

/**
 * Obtener configuraciones de columnas de un usuario para un tipo de tabla específico
 * Mock implementation - uses localStorage
 */
export const getUserColumns = async (
  userId: string,
  tableType: 'diary' | 'backtesting'
): Promise<ColumnDefinition[]> => {
  try {
    const key = `user_columns_${userId}_${tableType}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error in getUserColumns:', error);
    return [];
  }
};

/**
 * Guardar configuraciones de columnas de un usuario
 * Mock implementation - uses localStorage
 */
export const saveUserColumns = async (
  userId: string,
  tableType: 'diary' | 'backtesting',
  columns: ColumnDefinition[]
): Promise<boolean> => {
  try {
    const key = `user_columns_${userId}_${tableType}`;
    localStorage.setItem(key, JSON.stringify(columns));
    console.log('Mock: Columnas guardadas en localStorage', { userId, tableType, columns });
    return true;
  } catch (error) {
    console.error('Error in saveUserColumns:', error);
    return false;
  }
};

/**
 * Migrar columnas desde localStorage a Supabase
 * Mock implementation - no migration needed
 */
export const migrateColumnsFromLocalStorage = async (
  userId: string,
  tableType: 'diary' | 'backtesting',
  localStorageKey: string
): Promise<boolean> => {
  try {
    // Mock implementation - no migration needed
    console.log('Mock: No migration needed for localStorage');
    return true;
  } catch (error) {
    console.error('Error in migrateColumnsFromLocalStorage:', error);
    return false;
  }
};

/**
 * Obtener columnas con fallback a localStorage
 */
export const getColumnsWithFallback = async (
  userId: string | null,
  tableType: 'diary' | 'backtesting',
  localStorageKey: string,
  defaultColumns: ColumnDefinition[]
): Promise<ColumnDefinition[]> => {
  // Si no hay usuario autenticado, usar localStorage
  if (!userId) {
    try {
      const storedData = localStorage.getItem(localStorageKey);
      if (storedData) {
        const appState = JSON.parse(storedData);
        if (tableType === 'diary') {
          const firstJournal = appState.journals?.[0];
          return firstJournal?.customColumns || defaultColumns;
        } else if (tableType === 'backtesting') {
          return appState.backtestingColumns || defaultColumns;
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return defaultColumns;
  }

  // Si hay usuario autenticado, usar mock Supabase (localStorage)
  try {
    const columns = await getUserColumns(userId, tableType);
    return columns.length > 0 ? columns : defaultColumns;
  } catch (error) {
    console.error('Error in getColumnsWithFallback:', error);
    return defaultColumns;
  }
};

/**
 * Guardar columnas con fallback a localStorage
 */
export const saveColumnsWithFallback = async (
  userId: string | null,
  tableType: 'diary' | 'backtesting',
  columns: ColumnDefinition[],
  localStorageKey: string
): Promise<boolean> => {
  // Si no hay usuario autenticado, usar localStorage
  if (!userId) {
    try {
      const storedData = localStorage.getItem(localStorageKey);
      const appState = storedData ? JSON.parse(storedData) : {};

      if (tableType === 'diary') {
        if (appState.journals?.[0]) {
          appState.journals[0].customColumns = columns;
        }
      } else if (tableType === 'backtesting') {
        appState.backtestingColumns = columns;
      }

      localStorage.setItem(localStorageKey, JSON.stringify(appState));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // Si hay usuario autenticado, usar mock Supabase (localStorage)
  return await saveUserColumns(userId, tableType, columns);
};