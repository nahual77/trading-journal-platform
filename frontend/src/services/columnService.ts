import { supabase } from '../supabaseClient';
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
 */
export const getUserColumns = async (
  userId: string,
  tableType: 'diary' | 'backtesting'
): Promise<ColumnDefinition[]> => {
  try {
    const { data, error } = await supabase
      .from('user_table_columns')
      .select('column_config')
      .eq('user_id', userId)
      .eq('table_type', tableType)
      .single();

    if (error) {
      console.error('Error fetching user columns:', error);
      return [];
    }

    return data?.column_config || [];
  } catch (error) {
    console.error('Error in getUserColumns:', error);
    return [];
  }
};

/**
 * Guardar configuraciones de columnas de un usuario
 */
export const saveUserColumns = async (
  userId: string,
  tableType: 'diary' | 'backtesting',
  columns: ColumnDefinition[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_table_columns')
      .upsert({
        user_id: userId,
        table_type: tableType,
        column_config: columns,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving user columns:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveUserColumns:', error);
    return false;
  }
};

/**
 * Migrar columnas desde localStorage a Supabase
 */
export const migrateColumnsFromLocalStorage = async (
  userId: string,
  tableType: 'diary' | 'backtesting',
  localStorageKey: string
): Promise<boolean> => {
  try {
    // Obtener datos del localStorage
    const storedData = localStorage.getItem(localStorageKey);
    if (!storedData) {
      console.log('No data found in localStorage for migration');
      return false;
    }

    const appState = JSON.parse(storedData);
    let columns: ColumnDefinition[] = [];

    if (tableType === 'diary') {
      // Extraer columnas del primer journal
      const firstJournal = appState.journals?.[0];
      if (firstJournal?.customColumns) {
        columns = firstJournal.customColumns;
      }
    } else if (tableType === 'backtesting') {
      // Para backtesting, usar columnas por defecto o las que estén en el estado
      columns = appState.backtestingColumns || [];
    }

    if (columns.length === 0) {
      console.log('No columns found to migrate');
      return false;
    }

    // Guardar en Supabase
    const success = await saveUserColumns(userId, tableType, columns);

    if (success) {
      console.log(`Successfully migrated ${columns.length} columns for ${tableType}`);
    }

    return success;
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

  // Si hay usuario autenticado, usar Supabase
  try {
    const columns = await getUserColumns(userId, tableType);

    // Si no hay columnas en Supabase, intentar migrar desde localStorage
    if (columns.length === 0) {
      console.log('No columns found in Supabase, attempting migration from localStorage');
      const migrationSuccess = await migrateColumnsFromLocalStorage(userId, tableType, localStorageKey);

      if (migrationSuccess) {
        // Intentar obtener las columnas nuevamente después de la migración
        const migratedColumns = await getUserColumns(userId, tableType);
        return migratedColumns.length > 0 ? migratedColumns : defaultColumns;
      }
    }

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

  // Si hay usuario autenticado, usar Supabase
  return await saveUserColumns(userId, tableType, columns);
};
