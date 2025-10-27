import { useState, useCallback, useMemo, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import { useAuth } from './useAuth';
import {
  AppState,
  TradingJournal,
  TradeEntry,
  TradingPlan,
  ColumnDefinition,
  TradeImage,
  DEFAULT_TRADING_PLAN,
  DEFAULT_COLUMNS,
} from '../types/trading';

const createInitialState = (): AppState => ({
  journals: [],
  activeJournalId: null,
  tradingPlan: DEFAULT_TRADING_PLAN,
});

export function useTradingJournalState() {
  const { user } = useAuth();
  const [appState, setAppState] = useState<AppState>(createInitialState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [journals, tradingPlan, prefs] = await Promise.all([
            databaseService.getJournals(),
            databaseService.getTradingPlan(),
            databaseService.getUserPreferences(),
          ]);

          const activeId = prefs.activeJournalId || (journals.length > 0 ? journals[0].id : null);

          if (activeId) {
            const activeJournal = journals.find(j => j.id === activeId);
            if (activeJournal && activeJournal.entries.length === 0) {
              activeJournal.entries = await databaseService.getTradeEntries(activeId);
            }
          }

          setAppState({
            journals,
            tradingPlan,
            activeJournalId: activeId,
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          setAppState(createInitialState());
        } finally {
          setLoading(false);
        }
      } else {
        setAppState(createInitialState());
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const activeJournal = useMemo(() => {
    if (!appState.activeJournalId) return null;
    return appState.journals.find(j => j.id === appState.activeJournalId) || null;
  }, [appState.journals, appState.activeJournalId]);

  // === HELPERS ===
  const reloadJournals = useCallback(async () => {
      const journals = await databaseService.getJournals();
      setAppState(prev => ({ ...prev, journals }));
  }, []);


  // === JOURNALS ===
  const createJournal = useCallback(async (name: string) => {
    const newJournalId = await databaseService.createJournal(name);
    await reloadJournals(); // Recarga para obtener el nuevo journal con sus columnas por defecto
    await setActiveJournal(newJournalId);
  }, [reloadJournals]);

  const updateJournalName = useCallback(async (journalId: string, name: string) => {
    await databaseService.updateJournalName(journalId, name);
    setAppState(prev => ({ ...prev, journals: prev.journals.map(j => j.id === journalId ? { ...j, name } : j) }));
  }, []);

  const deleteJournal = useCallback(async (journalId: string) => {
    await databaseService.deleteJournal(journalId);
    const remaining = appState.journals.filter(j => j.id !== journalId);
    const newActiveId = (appState.activeJournalId === journalId) ? (remaining[0]?.id || null) : appState.activeJournalId;
    setAppState(prev => ({ ...prev, journals: remaining, activeJournalId: newActiveId }));
  }, [appState]);

  const setActiveJournal = useCallback(async (journalId: string) => {
    await databaseService.updateUserPreferences({ activeJournalId: journalId });
    const journal = appState.journals.find(j => j.id === journalId);
    if (journal && journal.entries.length === 0) {
      const entries = await databaseService.getTradeEntries(journalId);
      setAppState(prev => ({ ...prev, journals: prev.journals.map(j => j.id === journalId ? { ...j, entries } : j), activeJournalId: journalId }));
    } else {
      setAppState(prev => ({ ...prev, activeJournalId: journalId }));
    }
  }, [appState.journals]);

  // === TRADE ENTRIES ===
  const createTradeEntry = useCallback(async () => {
    if (!activeJournal) return null;
    const newEntryId = await databaseService.createTradeEntry(activeJournal.id);
    const entries = await databaseService.getTradeEntries(activeJournal.id); // Recargar para obtener la nueva entrada completa
    setAppState(prev => ({ ...prev, journals: prev.journals.map(j => j.id === activeJournal.id ? { ...j, entries } : j) }));
    return newEntryId;
  }, [activeJournal]);

  const updateTradeEntry = useCallback(async (entryId: string, updates: Partial<TradeEntry>) => {
    if (!activeJournal) return;
    await databaseService.updateTradeEntry(entryId, updates);
    setAppState(prev => ({ ...prev, journals: prev.journals.map(j => j.id === activeJournal.id ? { ...j, entries: j.entries.map(e => e.id === entryId ? { ...e, ...updates } : e) } : j) }));
  }, [activeJournal]);

  const deleteTradeEntry = useCallback(async (entryId: string) => {
    if (!activeJournal) return;
    await databaseService.deleteTradeEntry(entryId);
    setAppState(prev => ({ ...prev, journals: prev.journals.map(j => j.id === activeJournal.id ? { ...j, entries: j.entries.filter(e => e.id !== entryId) } : j) }));
  }, [activeJournal]);

  // === IMAGES ===
  const addImageToEntry = useCallback(async (entryId: string, image: TradeImage, imageType: string) => {
      if(!activeJournal) return;
      await databaseService.addTradeImage(entryId, image, imageType);
      const entries = await databaseService.getTradeEntries(activeJournal.id);
      setAppState(prev => ({...prev, journals: prev.journals.map(j => j.id === activeJournal.id ? {...j, entries} : j)}));
  }, [activeJournal]);

  const removeImageFromEntry = useCallback(async (imageId: string) => {
    if(!activeJournal) return;
    await databaseService.removeTradeImage(imageId);
    const entries = await databaseService.getTradeEntries(activeJournal.id);
    setAppState(prev => ({...prev, journals: prev.journals.map(j => j.id === activeJournal.id ? {...j, entries} : j)}));
  }, [activeJournal]);

  // === COLUMNS ===
  const addCustomColumn = useCallback(async (column: Omit<ColumnDefinition, 'id' | 'order'>) => {
      if(!activeJournal) return;
      await databaseService.addCustomColumn(activeJournal.id, column);
      await reloadJournals();
  }, [activeJournal, reloadJournals]);

  const updateColumn = useCallback(async (columnId: string, updates: Partial<ColumnDefinition>) => {
      if(!activeJournal) return;
      await databaseService.updateColumn(columnId, updates);
      await reloadJournals();
  }, [activeJournal, reloadJournals]);

  const removeColumn = useCallback(async (columnId: string) => {
      if(!activeJournal) return;
      await databaseService.removeColumn(columnId);
      await reloadJournals();
  }, [activeJournal, reloadJournals]);

  const toggleColumn = useCallback(async (columnId: string) => {
      if(!activeJournal) return;
      const column = activeJournal.customColumns.find(c => c.id === columnId);
      if(column) {
          await databaseService.updateColumn(columnId, { visible: !column.visible });
          await reloadJournals();
      }
  }, [activeJournal, reloadJournals]);

  // === TRADING PLAN ===
  const updateTradingPlan = useCallback(async (plan: Partial<TradingPlan>) => {
    await databaseService.updateTradingPlan(plan);
    setAppState(prev => ({ ...prev, tradingPlan: { ...prev.tradingPlan, ...plan, lastUpdated: new Date().toISOString() } }));
  }, []);

  // Dummy functions for plan points to satisfy component props.
  // This logic needs to be migrated to use the `checklist` inside `tradingPlan`.
  const onAddPlanPoint = () => console.warn("onAddPlanPoint not implemented");
  const onUpdatePlanPoint = () => console.warn("onUpdatePlanPoint not implemented");
  const onDeletePlanPoint = () => console.warn("onDeletePlanPoint not implemented");


  return {
    appState,
    activeJournal,
    loading,
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    addImageToEntry,
    removeImageFromEntry,
    addCustomColumn,
    updateColumn,
    removeColumn,
    toggleColumn,
    updateTradingPlan,
    onAddPlanPoint,
    onUpdatePlanPoint,
    onDeletePlanPoint,
  };
}