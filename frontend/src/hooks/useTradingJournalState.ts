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
  DEFAULT_TRADING_PLAN
} from '../types/trading';

// Estado inicial vacío para cuando no hay usuario o se están cargando los datos
const createInitialState = (): AppState => ({
  journals: [],
  activeJournalId: null,
  tradingPlan: DEFAULT_TRADING_PLAN,
});

export function useTradingJournalState() {
  const { user } = useAuth();
  const [appState, setAppState] = useState<AppState>(createInitialState());
  const [loading, setLoading] = useState(true);

  // Efecto para cargar, recargar o limpiar los datos basado en el estado del usuario
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        console.log('🔄 Usuario detectado, cargando datos desde la base de datos...');
        setLoading(true);
        try {
          const [journals, tradingPlan, prefs] = await Promise.all([
            databaseService.getJournals(),
            databaseService.getTradingPlan(),
            databaseService.getUserPreferences(),
          ]);

          // Cargar las entradas para el diario activo
          if (prefs.activeJournalId && journals.length > 0) {
              const activeJournal = journals.find(j => j.id === prefs.activeJournalId);
              if (activeJournal) {
                  activeJournal.entries = await databaseService.getTradeEntries(activeJournal.id);
              }
          }

          setAppState({
            journals,
            tradingPlan,
            activeJournalId: prefs.activeJournalId || (journals.length > 0 ? journals[0].id : null),
          });
          console.log('✅ Datos cargados exitosamente.');
        } catch (error) {
          console.error('❌ Error al cargar los datos del usuario:', error);
          setAppState(createInitialState()); // En caso de error, mostrar estado vacío
        } finally {
          setLoading(false);
        }
      } else {
        console.log('🗑️ No hay usuario, limpiando el estado de la aplicación.');
        setAppState(createInitialState());
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Memoizar el diario activo para evitar recálculos
  const activeJournal = useMemo(() => {
    if (!appState.activeJournalId) return null;
    return appState.journals.find(j => j.id === appState.activeJournalId) || appState.journals[0] || null;
  }, [appState.journals, appState.activeJournalId]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // === GESTIÓN DE JOURNALS ===

  const createJournal = useCallback(async (name: string) => {
    const newJournalId = await databaseService.createJournal(name);
    // Recargar todos los datos para mantener la consistencia
    const journals = await databaseService.getJournals();
    setAppState(prev => ({ ...prev, journals, activeJournalId: newJournalId }));
    return newJournalId;
  }, []);

  const updateJournalName = useCallback(async (journalId: string, name: string) => {
    await databaseService.updateJournalName(journalId, name);
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j => (j.id === journalId ? { ...j, name } : j)),
    }));
  }, []);

  const deleteJournal = useCallback(async (journalId: string) => {
    await databaseService.deleteJournal(journalId);
    const remainingJournals = appState.journals.filter(j => j.id !== journalId);
    let newActiveId = appState.activeJournalId;
    if (newActiveId === journalId) {
        newActiveId = remainingJournals.length > 0 ? remainingJournals[0].id : null;
    }
    setAppState(prev => ({ ...prev, journals: remainingJournals, activeJournalId: newActiveId }));
  }, [appState.journals, appState.activeJournalId]);

  const setActiveJournal = useCallback(async (journalId: string) => {
      await databaseService.updateUserPreferences({ activeJournalId: journalId });
      // Cargar las entradas para el nuevo diario activo
      const journal = appState.journals.find(j => j.id === journalId);
      if(journal && journal.entries.length === 0) { // Cargar solo si no están ya cargadas
        const entries = await databaseService.getTradeEntries(journalId);
        setAppState(prev => ({
            ...prev,
            journals: prev.journals.map(j => j.id === journalId ? {...j, entries} : j),
            activeJournalId: journalId
        }));
      } else {
        setAppState(prev => ({ ...prev, activeJournalId: journalId }));
      }
  }, [appState.journals]);

  // === GESTIÓN DE ENTRADAS ===

  const createTradeEntry = useCallback(async (journalId?: string) => {
    const targetJournalId = journalId || activeJournal?.id;
    if (!targetJournalId) return null;

    const newEntryId = await databaseService.createTradeEntry(targetJournalId);
    const newEntry = (await databaseService.getTradeEntries(targetJournalId)).find(e => e.id === newEntryId);

    if (newEntry) {
        setAppState(prev => ({
            ...prev,
            journals: prev.journals.map(j =>
                j.id === targetJournalId ? { ...j, entries: [newEntry, ...j.entries] } : j
            ),
        }));
    }
    return newEntryId;
  }, [activeJournal]);

  const updateTradeEntry = useCallback(async (entryId: string, updates: Partial<TradeEntry>, journalId?: string) => {
    const targetJournalId = journalId || activeJournal?.id;
    if (!targetJournalId) return;

    await databaseService.updateTradeEntry(entryId, updates);
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === targetJournalId
          ? { ...j, entries: j.entries.map(e => e.id === entryId ? { ...e, ...updates } : e) }
          : j
      ),
    }));
  }, [activeJournal]);

  const deleteTradeEntry = useCallback(async (entryId: string, journalId?: string) => {
    const targetJournalId = journalId || activeJournal?.id;
    if (!targetJournalId) return;

    await databaseService.deleteTradeEntry(entryId);
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(j =>
        j.id === targetJournalId ? { ...j, entries: j.entries.filter(e => e.id !== entryId) } : j
      ),
    }));
  }, [activeJournal]);

  // ... (El resto de funciones como gestión de columnas, imágenes, etc., seguirían un patrón similar)
  // ... (Por brevedad, se omiten pero se necesitaría adaptarlas también)
    const updateTradingPlan = useCallback(async (plan: Partial<TradingPlan>) => {
    await databaseService.updateTradingPlan(plan);
    setAppState(prev => ({
      ...prev,
      tradingPlan: { ...prev.tradingPlan, ...plan, lastUpdated: new Date().toISOString() },
    }));
  }, []);


  return {
    appState,
    activeJournal,
    loading,
    // Se exportan las funciones adaptadas
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    updateTradingPlan,
    // ... exportar el resto de funciones adaptadas
  };
}