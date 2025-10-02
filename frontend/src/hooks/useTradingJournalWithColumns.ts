import { useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useDiaryColumns } from './useDiaryColumns';
import {
  AppState,
  TradingJournal,
  TradeEntry,
  TradingPlan,
  DEFAULT_COLUMNS,
  DEFAULT_TRADING_PLAN,
  ColumnDefinition,
  TradeImage
} from '../types/trading';

// Estado inicial para usuarios nuevos (solo un diario)
const createNewUserState = (): AppState => {
  const journalId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  return {
    journals: [
      {
        id: journalId,
        name: 'Mi Diario de Trading',
        entries: [],
        customColumns: DEFAULT_COLUMNS,
        mt5Config: {
          broker: 'Deriv (SVG) LLC',
          accountNumber: journalId.substr(0, 8),
          serverName: 'DerivSVG-Server-02',
          password: '',
          balance: 1000.00,
          equity: 1000.00,
          margin: 0.00,
          freeMargin: 1000.00,
          connected: false,
        }
      }
    ],
    activeJournalId: journalId,
    tradingPlan: DEFAULT_TRADING_PLAN,
  };
};

// Estado inicial de la aplicación (para usuarios existentes)
const initialAppState: AppState = {
  journals: [
    {
      id: '1',
      name: 'Diario Principal',
      entries: [],
      customColumns: DEFAULT_COLUMNS,
      mt5Config: {
        broker: 'Deriv (SVG) LLC',
        accountNumber: '80340837',
        serverName: 'DerivSVG-Server-02',
        password: '',
        balance: 1000.00,
        equity: 1000.00,
        margin: 0.00,
        freeMargin: 1000.00,
        connected: false,
      }
    },
    {
      id: '2',
      name: 'Diario Swing',
      entries: [],
      customColumns: DEFAULT_COLUMNS,
      mt5Config: {
        broker: 'Deriv (SVG) LLC',
        accountNumber: '80340838',
        serverName: 'DerivSVG-Server-02',
        password: '',
        balance: 5000.00,
        equity: 5000.00,
        margin: 0.00,
        freeMargin: 5000.00,
        connected: false,
      }
    }
  ],
  activeJournalId: '1',
  tradingPlan: DEFAULT_TRADING_PLAN,
};

export function useTradingJournalWithColumns() {
  // Detectar si es un usuario nuevo (sin datos guardados)
  const [appState, setAppState] = useLocalStorage<AppState>('nagual-trader-journal-state', createNewUserState());

  // Crear un estado válido siempre
  const validAppState = useMemo((): AppState => {
    if (appState && appState.journals && appState.journals.length > 0) {
      return appState;
    }
    return createNewUserState();
  }, [appState]);

  // Obtener journal activo - MEMOIZADO
  const activeJournal = useMemo(() => {
    return validAppState.journals.find(j => j.id === validAppState.activeJournalId) || validAppState.journals[0];
  }, [validAppState.journals, validAppState.activeJournalId]);

  // Usar el nuevo sistema de columnas
  const {
    columns: diaryColumns,
    visibleColumns,
    loading: columnsLoading,
    error: columnsError,
    addColumn,
    updateColumn,
    deleteColumn,
    toggleColumnVisibility,
    reorderColumns,
    saveColumns
  } = useDiaryColumns();

  // Función para generar IDs únicos
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Sincronizar columnas del journal activo con el sistema de columnas
  useEffect(() => {
    if (activeJournal && !columnsLoading && diaryColumns.length > 0) {
      // Actualizar el journal con las columnas del sistema
      const updatedJournals = validAppState.journals.map(journal =>
        journal.id === activeJournal.id
          ? { ...journal, customColumns: diaryColumns }
          : journal
      );

      setAppState({
        ...validAppState,
        journals: updatedJournals
      });
    }
  }, [diaryColumns, activeJournal, columnsLoading, validAppState, setAppState]);

  // Funciones de gestión de journals
  const createJournal = useCallback((name: string) => {
    const newJournal: TradingJournal = {
      id: generateId(),
      name,
      entries: [],
      customColumns: [...diaryColumns], // Usar las columnas actuales del sistema
      mt5Config: {
        broker: 'Deriv (SVG) LLC',
        accountNumber: generateId().substr(0, 8),
        serverName: 'DerivSVG-Server-02',
        password: '',
        balance: 1000.00,
        equity: 1000.00,
        margin: 0.00,
        freeMargin: 1000.00,
        connected: false,
      }
    };

    setAppState(prev => ({
      ...prev,
      journals: [...prev.journals, newJournal],
      activeJournalId: newJournal.id
    }));
  }, [diaryColumns, setAppState]);

  const updateJournalName = useCallback((journalId: string, name: string) => {
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === journalId ? { ...j, name } : j
      )
    }));
  }, [setAppState]);

  const deleteJournal = useCallback((journalId: string) => {
    setAppState(prev => {
      const filteredJournals = prev.journals.filter(j => j.id !== journalId);
      const newActiveId = filteredJournals.length > 0 ? filteredJournals[0].id : '';

      return {
        ...prev,
        journals: filteredJournals,
        activeJournalId: newActiveId
      };
    });
  }, [setAppState]);

  const setActiveJournal = useCallback((journalId: string) => {
    setAppState(prev => ({
      ...prev,
      activeJournalId: journalId
    }));
  }, [setAppState]);

  // Funciones de gestión de entradas
  const createTradeEntry = useCallback((entry: Omit<TradeEntry, 'id'>) => {
    const newEntry: TradeEntry = {
      ...entry,
      id: generateId(),
      operationNumber: activeJournal.entries.length + 1
    };

    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === activeJournal.id
          ? { ...j, entries: [...j.entries, newEntry] }
          : j
      )
    }));
  }, [activeJournal.id, setAppState]);

  const updateTradeEntry = useCallback((entryId: string, updates: Partial<TradeEntry>) => {
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === activeJournal.id
          ? {
            ...j,
            entries: j.entries.map(e =>
              e.id === entryId ? { ...e, ...updates } : e
            )
          }
          : j
      )
    }));
  }, [activeJournal.id, setAppState]);

  const deleteTradeEntry = useCallback((entryId: string) => {
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === activeJournal.id
          ? {
            ...j,
            entries: j.entries.filter(e => e.id !== entryId).map((e, index) => ({
              ...e,
              operationNumber: index + 1
            }))
          }
          : j
      )
    }));
  }, [activeJournal.id, setAppState]);

  // Funciones de gestión de imágenes
  const addImageToEntry = useCallback((entryId: string, image: TradeImage) => {
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === activeJournal.id
          ? {
            ...j,
            entries: j.entries.map(e =>
              e.id === entryId
                ? {
                  ...e,
                  images: [...(e.images || []), image]
                }
                : e
            )
          }
          : j
      )
    }));
  }, [activeJournal.id, setAppState]);

  const removeImageFromEntry = useCallback((entryId: string, imageId: string) => {
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === activeJournal.id
          ? {
            ...j,
            entries: j.entries.map(e =>
              e.id === entryId
                ? {
                  ...e,
                  images: (e.images || []).filter(img => img.id !== imageId)
                }
                : e
            )
          }
          : j
      )
    }));
  }, [activeJournal.id, setAppState]);

  // Funciones de gestión del plan de trading
  const updateTradingPlan = useCallback((updates: Partial<TradingPlan>) => {
    setAppState(prev => ({
      ...prev,
      tradingPlan: { ...prev.tradingPlan, ...updates }
    }));
  }, [setAppState]);

  const toggleChecklistItem = useCallback((index: number) => {
    setAppState(prev => ({
      ...prev,
      tradingPlan: {
        ...prev.tradingPlan,
        checklist: prev.tradingPlan.checklist.map((item, i) =>
          i === index ? { ...item, completed: !item.completed } : item
        )
      }
    }));
  }, [setAppState]);

  const resetChecklist = useCallback(() => {
    setAppState(prev => ({
      ...prev,
      tradingPlan: {
        ...prev.tradingPlan,
        checklist: prev.tradingPlan.checklist.map(item => ({ ...item, completed: false }))
      }
    }));
  }, [setAppState]);

  // Funciones de configuración MT5
  const updateMT5Config = useCallback((journalId: string, config: any) => {
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === journalId ? { ...j, mt5Config: { ...j.mt5Config, ...config } } : j
      )
    }));
  }, [setAppState]);

  // Funciones de exportación
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(validAppState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trading-journal-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [validAppState]);

  const handleExportJournalCSV = useCallback((journalId: string) => {
    const journal = validAppState.journals.find(j => j.id === journalId);
    if (!journal) return;

    const headers = ['#', 'Fecha', 'Hora', 'Activo', 'Tipo', 'Precio Entrada', 'Precio Salida', 'Cantidad', 'Beneficio', 'Razón', 'Lección'];
    const csvContent = [
      headers.join(','),
      ...journal.entries.map(entry => [
        entry.operationNumber,
        entry.fecha || '',
        entry.hora || '',
        entry.activo || '',
        entry.tipoOperacion || '',
        entry.precioEntrada || '',
        entry.precioSalida || '',
        entry.cantidad || '',
        entry.beneficio || '',
        entry.razonEntrada || '',
        entry.leccion || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${journal.name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [validAppState]);

  const handleExportAllJournalsCSV = useCallback(() => {
    validAppState.journals.forEach(journal => {
      handleExportJournalCSV(journal.id);
    });
  }, [validAppState, handleExportJournalCSV]);

  // Funciones de columnas (usando el nuevo sistema)
  const handleColumnsChange = useCallback((newColumns: ColumnDefinition[]) => {
    saveColumns(newColumns);
  }, [saveColumns]);

  const handleToggleColumn = useCallback((columnId: string) => {
    toggleColumnVisibility(columnId);
  }, [toggleColumnVisibility]);

  return {
    // Estado
    appState: validAppState,
    activeJournal,
    columns: diaryColumns,
    visibleColumns,
    columnsLoading,
    columnsError,

    // Gestión de journals
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,

    // Gestión de entradas
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,

    // Gestión de imágenes
    addImageToEntry,
    removeImageFromEntry,

    // Gestión del plan de trading
    updateTradingPlan,
    toggleChecklistItem,
    resetChecklist,

    // Configuración MT5
    updateMT5Config,

    // Exportación
    exportData,
    handleExportJournalCSV,
    handleExportAllJournalsCSV,

    // Gestión de columnas (nuevo sistema)
    handleColumnsChange,
    handleToggleColumn,
  };
}
