import { useCallback, useMemo, useEffect, useState } from 'react';
import { getJournalsForUser, createJournalInDb, updateJournalNameInDb, deleteJournalInDb, updateJournalDataInDb } from '../services/journalService';
import { getEntriesForJournal, createEntryInDb, updateEntryInDb, deleteEntryInDb } from '../services/tradeEntryService';
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

const initialAppState: AppState = {
  journals: [],
  activeJournalId: '',
  tradingPlan: DEFAULT_TRADING_PLAN,
};

export function useTradingJournalWithColumns(user: any) {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos iniciales desde Supabase
  useEffect(() => {
    if (user?.id) {
      const fetchJournals = async () => {
        setIsLoading(true);
        const journals = await getJournalsForUser(user.id);
        if (journals && journals.length > 0) {
          for (const journal of journals) {
            journal.entries = await getEntriesForJournal(journal.id);
            if (!journal.customColumns || journal.customColumns.length === 0) {
              journal.customColumns = DEFAULT_COLUMNS;
            }
          }
          setAppState(prev => ({
            ...prev,
            journals: journals,
            activeJournalId: journals[0].id,
          }));
        }
        setIsLoading(false);
      };
      fetchJournals();
    }
  }, [user]);

  const activeJournal = useMemo(() => {
    return appState.journals.find(j => j.id === appState.activeJournalId);
  }, [appState.journals, appState.activeJournalId]);

  // Lógica de columnas integrada
  const columns = useMemo(() => activeJournal?.customColumns || [], [activeJournal]);
  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  const saveColumns = useCallback(async (newColumns: ColumnDefinition[]) => {
    if (!activeJournal?.id) return;
    await updateJournalDataInDb(activeJournal.id, { customColumns: newColumns });
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === activeJournal.id ? { ...j, customColumns: newColumns } : j
      )
    }));
  }, [activeJournal]);

  const handleToggleColumn = useCallback((columnId: string) => {
    const newColumns = columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    saveColumns(newColumns);
  }, [columns, saveColumns]);

  const reorderColumns = useCallback((columnId: string, direction: 'up' | 'down') => {
    const columnIndex = columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) return;
    const newIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(columnIndex, 1);
    newColumns.splice(newIndex, 0, movedColumn);
    const reordered = newColumns.map((col, index) => ({ ...col, order: index + 1 }));
    saveColumns(reordered);
  }, [columns, saveColumns]);


  // Funciones de gestión de journals
  const createJournal = useCallback(async (name: string) => {
    if (!user?.id) return;
    const newJournalData: Omit<TradingJournal, 'id' | 'entries'> = {
      name,
      customColumns: DEFAULT_COLUMNS,
      mt5Config: { /* ... */ } as any // Cast para evitar error de tipo
    };
    const createdJournal = await createJournalInDb(user.id, newJournalData);
    if (createdJournal) {
      createdJournal.entries = [];
      setAppState(prev => ({
        ...prev,
        journals: [...prev.journals, createdJournal],
        activeJournalId: createdJournal.id
      }));
    }
  }, [user]);

  const updateJournalName = useCallback(async (journalId: string, name:string) => {
    await updateJournalNameInDb(journalId, name);
    setAppState(prev => ({ ...prev, journals: prev.journals.map(j => j.id === journalId ? { ...j, name } : j) }));
  }, []);

  const deleteJournal = useCallback(async (journalId: string) => {
    await deleteJournalInDb(journalId);
    setAppState(prev => {
      const filteredJournals = prev.journals.filter(j => j.id !== journalId);
      return { ...prev, journals: filteredJournals, activeJournalId: filteredJournals[0]?.id || '' };
    });
  }, []);

  const setActiveJournal = useCallback((journalId: string) => {
    setAppState(prev => ({ ...prev, activeJournalId: journalId }));
  }, []);

  // Funciones de gestión de entradas
  const createTradeEntry = useCallback(async (entry: Omit<TradeEntry, 'id'>) => {
    if (!activeJournal?.id) return;
    const newEntryData = { ...entry, operationNumber: (activeJournal.entries?.length || 0) + 1 };
    const createdEntry = await createEntryInDb(activeJournal.id, newEntryData);
    if (createdEntry) {
      setAppState(prev => ({
        ...prev,
        journals: prev.journals.map(j =>
          j.id === activeJournal.id ? { ...j, entries: [...(j.entries || []), createdEntry] } : j
        )
      }));
    }
  }, [activeJournal]);

  const updateTradeEntry = useCallback(async (entryId: string, updates: Partial<TradeEntry>) => {
    if (!activeJournal?.id) return;
    const updatedEntry = await updateEntryInDb(entryId, updates);
    if (updatedEntry) {
      setAppState(prev => ({
        ...prev,
        journals: prev.journals.map(j =>
          j.id === activeJournal.id ? { ...j, entries: (j.entries || []).map(e => e.id === entryId ? updatedEntry : e) } : j
        )
      }));
    }
  }, [activeJournal]);

  const deleteTradeEntry = useCallback(async (entryId: string) => {
    if (!activeJournal?.id) return;
    await deleteEntryInDb(entryId);
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === activeJournal.id ? { ...j, entries: (j.entries || []).filter(e => e.id !== entryId).map((e, index) => ({ ...e, operationNumber: index + 1 })) } : j
      )
    }));
  }, [activeJournal]);

  const updateMT5Config = useCallback(async (journalId: string, config: any) => {
    const journal = appState.journals.find(j => j.id === journalId);
    if (!journal) return;
    const newConfig = { ...journal.mt5Config, ...config };
    await updateJournalDataInDb(journalId, { mt5Config: newConfig });
    setAppState(prev => ({
        ...prev,
        journals: prev.journals.map(j =>
            j.id === journalId ? { ...j, mt5Config: newConfig } : j
        )
    }));
  }, [appState.journals]);

  // Mocks para funciones no migradas
  const addImageToEntry = useCallback((entryId: string, image: TradeImage) => console.log('Mock: addImageToEntry'), []);
  const removeImageFromEntry = useCallback((entryId: string, imageId: string) => console.log('Mock: removeImageFromEntry'), []);
  const updateTradingPlan = useCallback((updates: Partial<TradingPlan>) => { console.log('Mock: updateTradingPlan'); }, []);
  const toggleChecklistItem = useCallback((index: number) => { console.log('Mock: toggleChecklistItem'); }, []);
  const resetChecklist = useCallback(() => { console.log('Mock: resetChecklist'); }, []);
  const addPlanPoint = useCallback((point: string) => { console.log('Mock: addPlanPoint'); }, []);
  const updatePlanPoint = useCallback((index: number, point: string) => { console.log('Mock: updatePlanPoint'); }, []);
  const deletePlanPoint = useCallback((index: number) => { console.log('Mock: deletePlanPoint'); }, []);
  const exportData = useCallback(() => { console.log('Mock: exportData'); }, []);
  const handleExportJournalCSV = useCallback((journalId: string) => { console.log('Mock: handleExportJournalCSV'); }, []);
  const handleExportAllJournalsCSV = useCallback(() => { console.log('Mock: handleExportAllJournalsCSV'); }, []);

  return {
    appState,
    activeJournal,
    columns,
    visibleColumns,
    columnsLoading: isLoading,
    columnsError: null,
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    addImageToEntry,
    removeImageFromEntry,
    updateTradingPlan,
    toggleChecklistItem,
    resetChecklist,
    addPlanPoint,
    updatePlanPoint,
    deletePlanPoint,
    updateMT5Config,
    exportData,
    handleExportJournalCSV,
    handleExportAllJournalsCSV,
    handleColumnsChange: saveColumns,
    handleToggleColumn,
    reorderColumns,
  };
}