import React, { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
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

export function useTradingJournalState() {
  // Detectar si es un usuario nuevo (sin datos guardados)
  const [appState, setAppState] = useLocalStorage<AppState>('nagual-trader-journal-state', createNewUserState);

  // Crear un estado válido siempre
  const getValidState = (): AppState => {
    if (appState && appState.journals && appState.journals.length > 0) {
      return appState;
    }
    return createNewUserState();
  };

  const validAppState = getValidState();
  
  // Debug: ver qué está pasando
  console.log('useTradingJournalState Debug:', {
    appState,
    validAppState,
    hasJournals: validAppState.journals?.length,
    activeJournalId: validAppState.activeJournalId
  });
  
  // Obtener journal activo
  const activeJournal = validAppState.journals.find(j => j.id === validAppState.activeJournalId) || validAppState.journals[0];

  // Si el estado no era válido, actualizarlo
  React.useEffect(() => {
    if (appState !== validAppState) {
      setAppState(validAppState);
    }
  }, [appState, validAppState, setAppState]);

  // Ejecutar actualización de columnas una sola vez al cargar
  React.useEffect(() => {
    const hasUpdatedColumns = localStorage.getItem('columns-translation-updated');
    if (!hasUpdatedColumns) {
      updateColumnsWithTranslationKeys();
      localStorage.setItem('columns-translation-updated', 'true');
    }
  }, [updateColumnsWithTranslationKeys]);

  // Función para generar IDs únicos
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Función para actualizar columnas existentes con claves de traducción
  const updateColumnsWithTranslationKeys = useCallback(() => {
    const columnTranslationMap: { [key: string]: string } = {
      'Fecha': 'table.date',
      'Hora': 'table.time',
      'Activo': 'table.asset',
      'Razón de entrada': 'table.entryReason',
      'Antes': 'table.before',
      'Durante': 'table.during',
      'Ratio': 'table.ratio',
      'Beneficio': 'table.profit',
      'Plan Seguido': 'table.planFollowed',
      'Lección': 'table.lesson',
      'Emociones Antes': 'table.emotionsBefore',
      'Emociones Durante': 'table.emotionsDuring',
      'Emociones Después': 'table.emotionsAfter',
      'Entradas no tomadas': 'table.entriesNotTaken',
      'Que sucedió con estas entradas': 'table.whatHappenedWithEntries',
      'Tipo Operación': 'table.operationType',
    };

    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal => ({
        ...journal,
        customColumns: journal.customColumns.map(column => ({
          ...column,
          name: columnTranslationMap[column.name] || column.name
        }))
      }))
    }));
  }, [setAppState]);

  // === GESTIÓN DE JOURNALS ===
  
  const createJournal = useCallback((name: string) => {
    const newJournal: TradingJournal = {
      id: generateId(),
      name,
      entries: [],
      customColumns: [...DEFAULT_COLUMNS],
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
      activeJournalId: newJournal.id,
    }));

    return newJournal.id;
  }, [setAppState]);

  const updateJournalName = useCallback((journalId: string, name: string) => {
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === journalId ? { ...journal, name } : journal
      ),
    }));
  }, [setAppState]);

  const deleteJournal = useCallback((journalId: string) => {
    setAppState(prev => {
      const remainingJournals = prev.journals.filter(j => j.id !== journalId);
      if (remainingJournals.length === 0) {
        // Si no hay journals, crear uno por defecto
        const defaultJournal = { ...initialAppState.journals[0], id: generateId() };
        return {
          ...prev,
          journals: [defaultJournal],
          activeJournalId: defaultJournal.id,
        };
      }
      
      return {
        ...prev,
        journals: remainingJournals,
        activeJournalId: prev.activeJournalId === journalId 
          ? remainingJournals[0].id 
          : prev.activeJournalId,
      };
    });
  }, [setAppState]);

  const setActiveJournal = useCallback((journalId: string) => {
    setAppState(prev => ({
      ...prev,
      activeJournalId: journalId,
    }));
  }, [setAppState]);

  // === GESTIÓN DE ENTRADAS ===
  
  const createTradeEntry = useCallback((journalId?: string) => {
    const today = new Date();
    
    const newEntry: TradeEntry = {
      id: generateId(),
      fecha: today.toISOString().split('T')[0],
      hora: today.toTimeString().split(' ')[0].substring(0, 5),
      activo: '',
      razonEntrada: '',
      antes: [], // Array de imágenes
      durante: [], // Array de imágenes
      ratio: '',
      beneficio: '',
      seCumplioElPlan: false,
      leccion: '',
      emocionesAntes: '',
      emocionesDurante: '',
      emocionesDespues: '',
      entradasNoTomadas: [], // Array de imágenes
      queSucedioConEntradasNoTomadas: [], // Array de imágenes
      screenshots: [],
      customFields: {},
    };

    setAppState(prev => {
      const targetJournalId = journalId || prev.activeJournalId;
      return {
        ...prev,
        journals: prev.journals.map(journal =>
          journal.id === targetJournalId
            ? { ...journal, entries: [...journal.entries, newEntry] }
            : journal
        ),
      };
    });

    return newEntry.id;
  }, [setAppState]);

  const updateTradeEntry = useCallback((entryId: string, updates: Partial<TradeEntry>, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === targetJournalId
          ? {
              ...journal,
              entries: journal.entries.map(entry =>
                entry.id === entryId ? { ...entry, ...updates } : entry
              ),
            }
          : journal
      ),
    }));
  }, [validAppState.activeJournalId, setAppState]);

  const deleteTradeEntry = useCallback((entryId: string, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === targetJournalId
          ? { ...journal, entries: journal.entries.filter(entry => entry.id !== entryId) }
          : journal
      ),
    }));
  }, [validAppState.activeJournalId, setAppState]);

  // === GESTIÓN DE COLUMNAS ===
  
  const addCustomColumn = useCallback((column: Omit<ColumnDefinition, 'id' | 'order'>, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === targetJournalId
          ? {
              ...journal,
              customColumns: [
                ...journal.customColumns,
                {
                  ...column,
                  id: generateId(),
                  order: journal.customColumns.length + 1,
                }
              ],
            }
          : journal
      ),
    }));
  }, [validAppState.activeJournalId, setAppState]);

  const updateColumn = useCallback((columnId: string, updates: Partial<ColumnDefinition>, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === targetJournalId
          ? {
              ...journal,
              customColumns: journal.customColumns.map(column =>
                column.id === columnId ? { ...column, ...updates } : column
              ),
            }
          : journal
      ),
    }));
  }, [validAppState.activeJournalId, setAppState]);

  const removeColumn = useCallback((columnId: string, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === targetJournalId
          ? { ...journal, customColumns: journal.customColumns.filter(col => col.id !== columnId) }
          : journal
      ),
    }));
  }, [validAppState.activeJournalId, setAppState]);

  const toggleColumn = useCallback((columnId: string, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    const journal = validAppState.journals.find(j => j.id === targetJournalId);
    const column = journal?.customColumns.find(col => col.id === columnId);
    
    if (column) {
      updateColumn(columnId, { visible: !column.visible }, targetJournalId);
    }
  }, [validAppState.activeJournalId, validAppState.journals, updateColumn]);

  // === GESTIÓN DE IMÁGENES ===
  
  const addImageToEntry = useCallback((entryId: string, image: TradeImage, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === targetJournalId
          ? {
              ...journal,
              entries: journal.entries.map(entry =>
                entry.id === entryId
                  ? { ...entry, screenshots: [...entry.screenshots, image] }
                  : entry
              ),
            }
          : journal
      ),
    }));
  }, [validAppState.activeJournalId, setAppState]);

  const removeImageFromEntry = useCallback((entryId: string, imageId: string, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === targetJournalId
          ? {
              ...journal,
              entries: journal.entries.map(entry =>
                entry.id === entryId
                  ? { ...entry, screenshots: entry.screenshots.filter(img => img.id !== imageId) }
                  : entry
              ),
            }
          : journal
      ),
    }));
  }, [validAppState.activeJournalId, setAppState]);

  // === GESTIÓN DEL PLAN DE TRADING ===
  
  const updateTradingPlan = useCallback((plan: Partial<TradingPlan>) => {
    setAppState(prev => ({
      ...prev,
      tradingPlan: { ...prev.tradingPlan, ...plan, lastUpdated: new Date().toISOString() },
    }));
  }, [setAppState]);

  const toggleChecklistItem = useCallback((itemId: string) => {
    setAppState(prev => ({
      ...prev,
      tradingPlan: {
        ...prev.tradingPlan,
        checklist: prev.tradingPlan.checklist.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
        lastUpdated: new Date().toISOString(),
      },
    }));
  }, [setAppState]);

  const resetChecklist = useCallback(() => {
    setAppState(prev => ({
      ...prev,
      tradingPlan: {
        ...prev.tradingPlan,
        checklist: prev.tradingPlan.checklist.map(item => ({ ...item, completed: false })),
        lastUpdated: new Date().toISOString(),
      },
    }));
  }, [setAppState]);

  // === CONFIGURACIÓN MT5 ===
  
  const updateMT5Config = useCallback((config: Partial<typeof activeJournal.mt5Config>, journalId?: string) => {
    const targetJournalId = journalId || validAppState.activeJournalId;
    
    setAppState(prev => ({
      ...prev,
      journals: prev.journals.map(journal =>
        journal.id === targetJournalId
          ? { ...journal, mt5Config: { ...journal.mt5Config, ...config } }
          : journal
      ),
    }));
  }, [validAppState.activeJournalId, setAppState]);

  // === UTILIDADES ===
  
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(validAppState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nagual-trader-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [validAppState]);

  const importData = useCallback((data: AppState) => {
    setAppState(data);
  }, [setAppState]);

  // === NUEVAS FUNCIONES DE EXPORTACIÓN CSV ===
  
  // Función para exportar CSV con Drive URLs - CORREGIDA
  const exportToCSV = useCallback((entries: TradeEntry[], journalName: string, driveBaseUrl?: string) => {
    if (entries.length === 0) {
      alert('No hay operaciones para exportar en este diario');
      return;
    }

    // Headers del CSV - EXACTOS
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

    // Función para limpiar y escapar campos correctamente
    const cleanField = (value: any): string => {
      if (!value && value !== 0) return '';
      
      let cleaned = String(value);
      
      // Reemplazar saltos de línea con espacios
      cleaned = cleaned.replace(/[\r\n]+/g, ' ');
      
      // Reemplazar múltiples espacios con uno solo
      cleaned = cleaned.replace(/\s+/g, ' ');
      
      // Trim espacios al inicio y final
      cleaned = cleaned.trim();
      
      // Si contiene comas, comillas, o caracteres problemáticos, envolver en comillas
      if (cleaned.includes(',') || cleaned.includes('"') || cleaned.includes('\n') || cleaned.includes('\r')) {
        // Escapar comillas dobles duplicándolas
        cleaned = cleaned.replace(/"/g, '""');
        // Envolver en comillas
        cleaned = `"${cleaned}"`;
      }
      
      return cleaned;
    };

    // Generar filas CSV
    const csvRows = [
      // Header row
      headers.join(','),
      
      // Data rows
      ...entries.map((entry, index) => {
        // Generar URLs de imágenes si hay ruta base
        const generateImageUrl = (prefix: string, imageIndex: number = 1) => {
          if (!driveBaseUrl) return '';
          return `${driveBaseUrl}/${prefix}_${String(index + 1).padStart(3, '0')}_${imageIndex}.png`;
        };

        // Crear fila con campos limpios - usando nombres correctos de la estructura
        const row = [
          cleanField(entry.fecha),
          cleanField(entry.hora),
          cleanField(entry.razonEntrada), // Nombre correcto del campo
          cleanField(entry.ratio),
          cleanField(entry.beneficio),
          cleanField(entry.seCumplioElPlan ? 'SI' : 'NO'), // Boolean convertido correctamente
          cleanField(entry.leccion),
          cleanField(entry.emocionesAntes), // Nombre correcto del campo
          cleanField(entry.emocionesDurante), // Nombre correcto del campo
          cleanField(entry.emocionesDespues), // Nombre correcto del campo
          cleanField(generateImageUrl('antes')),
          cleanField(generateImageUrl('durante')),
          cleanField(generateImageUrl('entradas_no_tomadas')),
          cleanField(generateImageUrl('que_sucedio_entradas')),
          cleanField(generateImageUrl('screenshots'))
        ];

        return row.join(',');
      })
    ];

    // Unir todas las filas
    const csvContent = csvRows.join('\n');

    // Crear Blob con BOM para Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });

    // Descargar archivo
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

  // Función para manejar exportación con prompt
  const handleExportJournalCSV = useCallback((journalId?: string) => {
    const journal = journalId ? 
      validAppState.journals.find(j => j.id === journalId) : 
      validAppState.journals.find(j => j.id === validAppState.activeJournalId);
    
    if (!journal) {
      alert('No se encontró el diario a exportar');
      return;
    }

    // Preguntar por la ruta de Drive
    const driveUrl = prompt(
      'Ingresa la ruta base de tu carpeta de Google Drive para las imágenes:\n\n' +
      'Ejemplo: https://drive.google.com/file/d/TU-CARPETA-ID\n\n' +
      'Las imágenes se nombrarán como:\n' +
      '- antes_001_1.png, antes_001_2.png\n' +
      '- durante_002_1.png, etc.\n\n' +
      'Deja vacío si no quieres incluir rutas de Drive:'
    );

    // Si cancela, no exportar
    if (driveUrl === null) return;

    // Limpiar la URL si tiene contenido
    const cleanDriveUrl = driveUrl?.trim() || undefined;

    // Exportar CSV
    exportToCSV(journal.entries, journal.name, cleanDriveUrl);
  }, [validAppState.journals, validAppState.activeJournalId, exportToCSV]);

  // Función para exportar todos los diarios
  const handleExportAllJournalsCSV = useCallback(() => {
    const allEntries: TradeEntry[] = [];
    const journalNames: string[] = [];
    
    validAppState.journals.forEach(journal => {
      if (journal.entries && journal.entries.length > 0) {
        allEntries.push(...journal.entries);
        journalNames.push(journal.name);
      }
    });

    if (allEntries.length === 0) {
      alert('No hay operaciones para exportar en ningún diario');
      return;
    }

    // Preguntar por la ruta de Drive
    const driveUrl = prompt(
      'Ingresa la ruta base de tu carpeta de Google Drive para las imágenes:\n\n' +
      'Ejemplo: https://drive.google.com/file/d/TU-CARPETA-ID\n\n' +
      'Las imágenes se nombrarán como:\n' +
      '- antes_001_1.png, antes_001_2.png\n' +
      '- durante_002_1.png, etc.\n\n' +
      'Deja vacío si no quieres incluir rutas de Drive:'
    );

    // Si cancela, no exportar
    if (driveUrl === null) return;

    // Limpiar la URL si tiene contenido
    const cleanDriveUrl = driveUrl?.trim() || undefined;

    exportToCSV(allEntries, `Todos_los_Diarios_${journalNames.join('_')}`, cleanDriveUrl);
  }, [validAppState.journals, exportToCSV]);

  return {
    // Estado
    appState: validAppState,
    activeJournal,
    
    // Journals
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,
    
    // Entradas
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    
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
    updateColumnsWithTranslationKeys,
    
    // Exportación CSV mejorada
    exportToCSV,
    handleExportJournalCSV,
    handleExportAllJournalsCSV,
  };
}
