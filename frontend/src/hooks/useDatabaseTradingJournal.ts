import React, { useState, useEffect, useCallback } from 'react';
import { databaseService } from '../services/databaseService';
import { 
  AppState, 
  TradingJournal, 
  TradeEntry, 
  TradeImage, 
  ColumnDefinition, 
  MT5Config, 
  TradingPlan,
  DEFAULT_COLUMNS,
  DEFAULT_TRADING_PLAN
} from '../types/trading';

interface UseDatabaseTradingJournalReturn {
  // Estado
  appState: AppState | null;
  activeJournal: TradingJournal | null;
  loading: boolean;
  error: string | null;
  initialBalances: Record<string, number>;
  
  // Journals
  createJournal: (name: string) => Promise<string>;
  updateJournalName: (journalId: string, name: string) => Promise<void>;
  deleteJournal: (journalId: string) => Promise<void>;
  setActiveJournal: (journalId: string) => Promise<void>;
  
  // Entradas
  createTradeEntry: (journalId?: string) => Promise<string>;
  updateTradeEntry: (entryId: string, updates: Partial<TradeEntry>, journalId?: string) => Promise<void>;
  deleteTradeEntry: (entryId: string, journalId?: string) => Promise<void>;
  loadJournalEntries: (journalId: string) => Promise<void>;
  
  // Columnas
  addCustomColumn: (column: Omit<ColumnDefinition, 'id' | 'order'>, journalId?: string) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<ColumnDefinition>, journalId?: string) => Promise<void>;
  removeColumn: (columnId: string, journalId?: string) => Promise<void>;
  toggleColumn: (columnId: string, journalId?: string) => Promise<void>;
  
  // Imágenes
  addImageToEntry: (entryId: string, image: TradeImage, journalId?: string) => Promise<void>;
  removeImageFromEntry: (entryId: string, imageId: string, journalId?: string) => Promise<void>;
  
  // Plan de trading
  updateTradingPlan: (plan: Partial<TradingPlan>) => Promise<void>;
  toggleChecklistItem: (itemId: string) => Promise<void>;
  resetChecklist: () => Promise<void>;
  
  // MT5
  updateMT5Config: (config: Partial<MT5Config>, journalId?: string) => Promise<void>;
  
  // Utilidades
  exportData: () => Promise<void>;
  importData: (data: AppState) => Promise<void>;
  migrateFromLocalStorage: (localData: AppState) => Promise<void>;
  updateInitialBalance: (journalId: string, balance: number) => Promise<void>;
  
  // Exportación CSV
  exportToCSV: (entries: TradeEntry[], journalName: string, driveBaseUrl?: string) => void;
  handleExportJournalCSV: (journalId?: string) => Promise<void>;
  handleExportAllJournalsCSV: () => Promise<void>;
}

export function useDatabaseTradingJournal(): UseDatabaseTradingJournalReturn {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialBalances, setInitialBalances] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Iniciando carga de datos...');
      setLoading(true);
      setError(null);
      
      // OPTIMIZACIÓN: Cargar datos en paralelo para mayor velocidad con timeout
      const startTime = Date.now();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La carga tardó más de 10 segundos')), 10000)
      );
      
      // Crear promesas individuales con timeout
      const journalsPromise = databaseService.getJournals();
      const tradingPlanPromise = databaseService.getTradingPlan();
      const preferencesPromise = databaseService.getUserPreferences();
      
      // Ejecutar en paralelo con timeout individual
      const [journals, tradingPlan, preferences] = await Promise.all([
        Promise.race([journalsPromise, new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en getJournals')), 5000)
        )]),
        Promise.race([tradingPlanPromise, new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en getTradingPlan')), 5000)
        )]),
        Promise.race([preferencesPromise, new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en getUserPreferences')), 5000)
        )])
      ]) as any;
      const loadTime = Date.now() - startTime;
      console.log(`⚡ Datos cargados en ${loadTime}ms`);
      
      console.log('📊 Datos cargados:', { journals, tradingPlan, preferences });

      // Si no hay journals, crear uno por defecto
      if (journals.length === 0) {
        const defaultJournalId = await databaseService.createJournal('Mi Diario de Trading');
        await databaseService.setActiveJournal(defaultJournalId);
        
        // Recargar journals
        const newJournals = await databaseService.getJournals();
        const newTradingPlan = await databaseService.getTradingPlan();
        
        setAppState({
          journals: newJournals,
          activeJournalId: defaultJournalId,
          tradingPlan: newTradingPlan
        });
      } else {
        setAppState({
          journals,
          activeJournalId: preferences.activeJournalId || journals[0].id,
          tradingPlan
        });
        
        // Cargar balances iniciales desde la base de datos
        if (preferences.initialBalances) {
          setInitialBalances(preferences.initialBalances);
          console.log('📊 Balances iniciales cargados:', preferences.initialBalances);
        }
      }
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(async () => {
    if (appState) {
      await loadData();
    }
  }, [appState]);

  // Obtener journal activo
  const activeJournal = appState?.journals.find(j => j.id === appState.activeJournalId) || appState?.journals[0] || null;

  // === GESTIÓN DE JOURNALS ===
  
  const createJournal = useCallback(async (name: string): Promise<string> => {
    try {
      const journalId = await databaseService.createJournal(name);
      await refreshData();
      return journalId;
    } catch (err) {
      console.error('Error creando journal:', err);
      throw err;
    }
  }, [refreshData]);

  const updateJournalName = useCallback(async (journalId: string, name: string): Promise<void> => {
    try {
      await databaseService.updateJournalName(journalId, name);
      await refreshData();
    } catch (err) {
      console.error('Error actualizando nombre del journal:', err);
      throw err;
    }
  }, [refreshData]);

  const deleteJournal = useCallback(async (journalId: string): Promise<void> => {
    try {
      await databaseService.deleteJournal(journalId);
      await refreshData();
    } catch (err) {
      console.error('Error eliminando journal:', err);
      throw err;
    }
  }, [refreshData]);

  const setActiveJournal = useCallback(async (journalId: string): Promise<void> => {
    try {
      await databaseService.setActiveJournal(journalId);
      await databaseService.updateUserPreferences({ activeJournalId: journalId });
      await refreshData();
    } catch (err) {
      console.error('Error estableciendo journal activo:', err);
      throw err;
    }
  }, [refreshData]);

  // === GESTIÓN DE ENTRADAS ===
  
  const createTradeEntry = useCallback(async (journalId?: string): Promise<string> => {
    try {
      const targetJournalId = journalId || appState?.activeJournalId;
      if (!targetJournalId) throw new Error('No hay journal activo');
      
      const entryId = await databaseService.createTradeEntry(targetJournalId);
      await refreshData();
      return entryId;
    } catch (err) {
      console.error('Error creando entrada:', err);
      throw err;
    }
  }, [appState?.activeJournalId, refreshData]);

  const updateTradeEntry = useCallback(async (entryId: string, updates: Partial<TradeEntry>, journalId?: string): Promise<void> => {
    try {
      await databaseService.updateTradeEntry(entryId, updates);
      await refreshData();
    } catch (err) {
      console.error('Error actualizando entrada:', err);
      throw err;
    }
  }, [refreshData]);

  const deleteTradeEntry = useCallback(async (entryId: string, journalId?: string): Promise<void> => {
    try {
      await databaseService.deleteTradeEntry(entryId);
      await refreshData();
    } catch (err) {
      console.error('Error eliminando entrada:', err);
      throw err;
    }
  }, [refreshData]);

  const loadJournalEntries = useCallback(async (journalId: string): Promise<void> => {
    try {
      console.log('🔄 Cargando entradas para journal:', journalId);
      
      // Verificar si ya tiene entradas cargadas
      const journal = appState?.journals.find(j => j.id === journalId);
      if (journal && journal.entries.length > 0) {
        console.log('✅ Entradas ya cargadas para journal:', journalId);
        return;
      }
      
      // Cargar entradas desde la base de datos
      const entries = await databaseService.getTradeEntries(journalId);
      
      // Actualizar el estado local
      if (appState) {
        const updatedJournals = appState.journals.map(j => 
          j.id === journalId ? { ...j, entries } : j
        );
        
        setAppState({
          ...appState,
          journals: updatedJournals
        });
        
        console.log(`✅ ${entries.length} entradas cargadas para journal ${journalId}`);
      }
    } catch (err) {
      console.error('Error cargando entradas:', err);
      throw err;
    }
  }, [appState]);

  // === GESTIÓN DE COLUMNAS ===
  
  const addCustomColumn = useCallback(async (column: Omit<ColumnDefinition, 'id' | 'order'>, journalId?: string): Promise<void> => {
    try {
      const targetJournalId = journalId || appState?.activeJournalId;
      if (!targetJournalId) throw new Error('No hay journal activo');
      
      await databaseService.addCustomColumn(targetJournalId, column);
      await refreshData();
    } catch (err) {
      console.error('Error agregando columna:', err);
      throw err;
    }
  }, [appState?.activeJournalId, refreshData]);

  const updateColumn = useCallback(async (columnId: string, updates: Partial<ColumnDefinition>, journalId?: string): Promise<void> => {
    try {
      await databaseService.updateColumn(columnId, updates);
      await refreshData();
    } catch (err) {
      console.error('Error actualizando columna:', err);
      throw err;
    }
  }, [refreshData]);

  const removeColumn = useCallback(async (columnId: string, journalId?: string): Promise<void> => {
    try {
      await databaseService.removeColumn(columnId);
      await refreshData();
    } catch (err) {
      console.error('Error eliminando columna:', err);
      throw err;
    }
  }, [refreshData]);

  const toggleColumn = useCallback(async (columnId: string, journalId?: string): Promise<void> => {
    try {
      const targetJournalId = journalId || appState?.activeJournalId;
      if (!targetJournalId) throw new Error('No hay journal activo');
      
      const journal = appState?.journals.find(j => j.id === targetJournalId);
      const column = journal?.customColumns.find(col => col.id === columnId);
      
      if (column) {
        await databaseService.updateColumn(columnId, { visible: !column.visible });
        await refreshData();
      }
    } catch (err) {
      console.error('Error alternando columna:', err);
      throw err;
    }
  }, [appState?.activeJournalId, appState?.journals, refreshData]);

  // === GESTIÓN DE IMÁGENES ===
  
  const addImageToEntry = useCallback(async (entryId: string, image: TradeImage, journalId?: string): Promise<void> => {
    try {
      // Determinar el tipo de imagen basado en el contexto
      // Por ahora, asumimos que es 'screenshots' por defecto
      await databaseService.addTradeImage(entryId, image, 'screenshots');
      await refreshData();
    } catch (err) {
      console.error('Error agregando imagen:', err);
      throw err;
    }
  }, [refreshData]);

  const removeImageFromEntry = useCallback(async (entryId: string, imageId: string, journalId?: string): Promise<void> => {
    try {
      await databaseService.removeTradeImage(imageId);
      await refreshData();
    } catch (err) {
      console.error('Error eliminando imagen:', err);
      throw err;
    }
  }, [refreshData]);

  // === GESTIÓN DEL PLAN DE TRADING ===
  
  const updateTradingPlan = useCallback(async (plan: Partial<TradingPlan>): Promise<void> => {
    try {
      await databaseService.updateTradingPlan(plan);
      await refreshData();
    } catch (err) {
      console.error('Error actualizando plan de trading:', err);
      throw err;
    }
  }, [refreshData]);

  const toggleChecklistItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      if (!appState?.tradingPlan) return;
      
      const updatedChecklist = appState.tradingPlan.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      
      await databaseService.updateTradingPlan({ checklist: updatedChecklist });
      await refreshData();
    } catch (err) {
      console.error('Error alternando item del checklist:', err);
      throw err;
    }
  }, [appState?.tradingPlan, refreshData]);

  const resetChecklist = useCallback(async (): Promise<void> => {
    try {
      if (!appState?.tradingPlan) return;
      
      const resetChecklist = appState.tradingPlan.checklist.map(item => ({ ...item, completed: false }));
      await databaseService.updateTradingPlan({ checklist: resetChecklist });
      await refreshData();
    } catch (err) {
      console.error('Error reseteando checklist:', err);
      throw err;
    }
  }, [appState?.tradingPlan, refreshData]);

  // === CONFIGURACIÓN MT5 ===
  
  const updateMT5Config = useCallback(async (config: Partial<MT5Config>, journalId?: string): Promise<void> => {
    try {
      const targetJournalId = journalId || appState?.activeJournalId;
      if (!targetJournalId) throw new Error('No hay journal activo');
      
      await databaseService.updateMT5Config(targetJournalId, config);
      await refreshData();
    } catch (err) {
      console.error('Error actualizando configuración MT5:', err);
      throw err;
    }
  }, [appState?.activeJournalId, refreshData]);

  // === UTILIDADES ===
  
  const exportData = useCallback(async (): Promise<void> => {
    try {
      const data = await databaseService.exportAllData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `nagual-trader-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando datos:', err);
      throw err;
    }
  }, []);

  const importData = useCallback(async (data: AppState): Promise<void> => {
    try {
      // Esta función requeriría implementación adicional para importar datos
      // Por ahora, solo actualizamos el estado local
      setAppState(data);
    } catch (err) {
      console.error('Error importando datos:', err);
      throw err;
    }
  }, []);

  const migrateFromLocalStorage = useCallback(async (localData: AppState): Promise<void> => {
    try {
      await databaseService.migrateFromLocalStorage(localData);
      await refreshData();
    } catch (err) {
      console.error('Error migrando datos:', err);
      throw err;
    }
  }, [refreshData]);

  // === EXPORTACIÓN CSV ===
  
  const exportToCSV = useCallback((entries: TradeEntry[], journalName: string, driveBaseUrl?: string) => {
    if (entries.length === 0) {
      alert('No hay operaciones para exportar en este diario');
      return;
    }

    // Headers del CSV
    const headers = [
      'fecha',
      'hora', 
      'razon_entrada',
      'ratio',
      'beneficio',
      'se_cumplio_plan',
      'leccion',
      'emociones_antes',
      'emociones_durante',
      'emociones_despues',
      'url_imagen_antes',
      'url_imagen_durante',
      'url_entradas_no_tomadas',
      'url_que_sucedio_entradas',
      'url_screenshots'
    ];

    // Función para limpiar y escapar campos
    const cleanField = (value: any): string => {
      if (!value && value !== 0) return '';
      
      let cleaned = String(value);
      cleaned = cleaned.replace(/[\r\n]+/g, ' ');
      cleaned = cleaned.replace(/\s+/g, ' ');
      cleaned = cleaned.trim();
      
      if (cleaned.includes(',') || cleaned.includes('"') || cleaned.includes('\n') || cleaned.includes('\r')) {
        cleaned = cleaned.replace(/"/g, '""');
        cleaned = `"${cleaned}"`;
      }
      
      return cleaned;
    };

    // Generar filas CSV
    const csvRows = [
      headers.join(','),
      ...entries.map((entry, index) => {
        const generateImageUrl = (prefix: string, imageIndex: number = 1) => {
          if (!driveBaseUrl) return '';
          return `${driveBaseUrl}/${prefix}_${String(index + 1).padStart(3, '0')}_${imageIndex}.png`;
        };

        const row = [
          cleanField(entry.fecha),
          cleanField(entry.hora),
          cleanField(entry.razonEntrada),
          cleanField(entry.ratio),
          cleanField(entry.beneficio),
          cleanField(entry.seCumplioElPlan ? 'SI' : 'NO'),
          cleanField(entry.leccion),
          cleanField(entry.emocionesAntes),
          cleanField(entry.emocionesDurante),
          cleanField(entry.emocionesDespues),
          cleanField(generateImageUrl('antes')),
          cleanField(generateImageUrl('durante')),
          cleanField(generateImageUrl('entradas_no_tomadas')),
          cleanField(generateImageUrl('que_sucedio_entradas')),
          cleanField(generateImageUrl('screenshots'))
        ];

        return row.join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${journalName.replace(/\s+/g, '_')}_operaciones.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, []);

  const handleExportJournalCSV = useCallback(async (journalId?: string): Promise<void> => {
    try {
      const journal = journalId ? 
        appState?.journals.find(j => j.id === journalId) : 
        appState?.journals.find(j => j.id === appState?.activeJournalId);
      
      if (!journal) {
        alert('No se encontró el diario a exportar');
        return;
      }

      const driveUrl = prompt(
        'Ingresa la ruta base de tu carpeta de Google Drive para las imágenes:\n\n' +
        'Ejemplo: https://drive.google.com/file/d/TU-CARPETA-ID\n\n' +
        'Las imágenes se nombrarán como:\n' +
        '- antes_001_1.png, antes_001_2.png\n' +
        '- durante_002_1.png, etc.\n\n' +
        'Deja vacío si no quieres incluir rutas de Drive:'
      );

      if (driveUrl === null) return;
      const cleanDriveUrl = driveUrl?.trim() || undefined;

      exportToCSV(journal.entries, journal.name, cleanDriveUrl);
    } catch (err) {
      console.error('Error exportando journal CSV:', err);
      throw err;
    }
  }, [appState?.journals, appState?.activeJournalId, exportToCSV]);

  const handleExportAllJournalsCSV = useCallback(async (): Promise<void> => {
    try {
      if (!appState?.journals) return;
      
      const allEntries: TradeEntry[] = [];
      const journalNames: string[] = [];
      
      appState.journals.forEach(journal => {
        if (journal.entries && journal.entries.length > 0) {
          allEntries.push(...journal.entries);
          journalNames.push(journal.name);
        }
      });

      if (allEntries.length === 0) {
        alert('No hay operaciones para exportar en ningún diario');
        return;
      }

      const driveUrl = prompt(
        'Ingresa la ruta base de tu carpeta de Google Drive para las imágenes:\n\n' +
        'Ejemplo: https://drive.google.com/file/d/TU-CARPETA-ID\n\n' +
        'Las imágenes se nombrarán como:\n' +
        '- antes_001_1.png, antes_001_2.png\n' +
        '- durante_002_1.png, etc.\n\n' +
        'Deja vacío si no quieres incluir rutas de Drive:'
      );

      if (driveUrl === null) return;
      const cleanDriveUrl = driveUrl?.trim() || undefined;

      exportToCSV(allEntries, `Todos_los_Diarios_${journalNames.join('_')}`, cleanDriveUrl);
    } catch (err) {
      console.error('Error exportando todos los journals CSV:', err);
      throw err;
    }
  }, [appState?.journals, exportToCSV]);

  return {
    // Estado
    appState,
    activeJournal,
    loading,
    error,
    initialBalances,
    
    // Journals
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,
    
    // Entradas
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    loadJournalEntries,
    
    // Columnas
    addCustomColumn,
    updateColumn,
    removeColumn,
    toggleColumn,
    
    // Imágenes
    addImageToEntry,
    removeImageFromEntry,
    
    // Plan de trading
    updateTradingPlan,
    toggleChecklistItem,
    resetChecklist,
    
    // MT5
    updateMT5Config,
    
    // Utilidades
    exportData,
    importData,
    migrateFromLocalStorage,
    updateInitialBalance: async (journalId: string, balance: number) => {
      await databaseService.updateInitialBalance(journalId, balance);
      
      // Actualizar el estado local después de guardar en la base de datos
      setInitialBalances(prev => ({
        ...prev,
        [journalId]: balance
      }));
      
      console.log('🔄 Estado local actualizado:', { [journalId]: balance });
    },
    
    // Exportación CSV
    exportToCSV,
    handleExportJournalCSV,
    handleExportAllJournalsCSV,
  };
}
