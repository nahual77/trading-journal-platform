import { useState, useEffect, useCallback } from 'react';
import { BacktestingJournal, BacktestingColumn, BacktestingEntry } from '../components/BacktestingTable';

// Función para crear columnas por defecto
const createDefaultColumns = (): BacktestingColumn[] => [
  {
    id: 'testName',
    name: 'Nombre de la Prueba',
    type: 'text',
    visible: true,
  },
  {
    id: 'strategy',
    name: 'Estrategia',
    type: 'text',
    visible: true,
  },
  {
    id: 'period',
    name: 'Período',
    type: 'text',
    visible: true,
  },
  {
    id: 'winRate',
    name: 'Tasa de Éxito',
    type: 'number',
    visible: true,
  },
  {
    id: 'profit',
    name: 'Ganancia',
    type: 'number',
    visible: true,
  },
  {
    id: 'maxDrawdown',
    name: 'Máxima Pérdida',
    type: 'number',
    visible: true,
  },
  {
    id: 'sharpeRatio',
    name: 'Ratio de Sharpe',
    type: 'number',
    visible: true,
  },
  {
    id: 'notes',
    name: 'Notas',
    type: 'text',
    visible: true,
  },
  {
    id: 'chart',
    name: 'Gráfico',
    type: 'image',
    visible: true,
  },
  {
    id: 'isProfitable',
    name: 'Rentable',
    type: 'boolean',
    visible: true,
  },
];

export function useBacktestingState() {
  const [backtestingJournals, setBacktestingJournals] = useState<BacktestingJournal[]>([]);
  const [activeBacktestingId, setActiveBacktestingId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar datos del localStorage al montar (solo una vez)
  useEffect(() => {
    if (isInitialized) return;

    const savedBacktesting = localStorage.getItem('backtesting-journals');
    const savedActiveId = localStorage.getItem('active-backtesting-id');
    
    if (savedBacktesting) {
      try {
        const journals = JSON.parse(savedBacktesting);
        setBacktestingJournals(journals);
        
        if (savedActiveId && journals.find((j: BacktestingJournal) => j.id === savedActiveId)) {
          setActiveBacktestingId(savedActiveId);
        } else if (journals.length > 0) {
          setActiveBacktestingId(journals[0].id);
        }
      } catch (error) {
        console.error('Error parsing backtesting data:', error);
        // Crear backtesting por defecto si hay error
        const defaultBacktesting = createDefaultBacktesting();
        setBacktestingJournals([defaultBacktesting]);
        setActiveBacktestingId(defaultBacktesting.id);
      }
    } else {
      // Crear backtesting inicial si no existe ninguno
      const defaultBacktesting = createDefaultBacktesting();
      setBacktestingJournals([defaultBacktesting]);
      setActiveBacktestingId(defaultBacktesting.id);
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Función para crear backtesting por defecto
  const createDefaultBacktesting = (): BacktestingJournal => ({
    id: Date.now().toString(),
    name: 'Mi Primer Backtesting',
    entries: [],
    columns: createDefaultColumns(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Guardar en localStorage cuando cambien los datos (solo después de inicializar)
  useEffect(() => {
    if (isInitialized && backtestingJournals.length > 0) {
      localStorage.setItem('backtesting-journals', JSON.stringify(backtestingJournals));
    }
  }, [backtestingJournals, isInitialized]);

  useEffect(() => {
    if (isInitialized && activeBacktestingId) {
      localStorage.setItem('active-backtesting-id', activeBacktestingId);
    }
  }, [activeBacktestingId, isInitialized]);

  const createBacktesting = useCallback((name: string) => {
    const newBacktesting: BacktestingJournal = {
      id: Date.now().toString(),
      name,
      entries: [],
      columns: createDefaultColumns(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBacktestingJournals(prev => [...prev, newBacktesting]);
    setActiveBacktestingId(newBacktesting.id);
    return newBacktesting;
  }, []);

  const updateBacktestingName = (id: string, name: string) => {
    setBacktestingJournals(prev => 
      prev.map(journal => 
        journal.id === id 
          ? { ...journal, name, updatedAt: new Date().toISOString() }
          : journal
      )
    );
  };

  const deleteBacktesting = (id: string) => {
    setBacktestingJournals(prev => {
      const filtered = prev.filter(journal => journal.id !== id);
      if (activeBacktestingId === id && filtered.length > 0) {
        setActiveBacktestingId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveBacktestingId('');
      }
      return filtered;
    });
  };

  const addEntry = (backtestingId: string, entry: Omit<BacktestingEntry, 'id'>) => {
    const newEntry: BacktestingEntry = {
      id: Date.now().toString(),
      ...entry,
    };

    setBacktestingJournals(prev =>
      prev.map(journal =>
        journal.id === backtestingId
          ? {
              ...journal,
              entries: [...journal.entries, newEntry],
              updatedAt: new Date().toISOString(),
            }
          : journal
      )
    );
  };

  const updateEntry = (backtestingId: string, entryId: string, updates: Partial<BacktestingEntry>) => {
    setBacktestingJournals(prev =>
      prev.map(journal =>
        journal.id === backtestingId
          ? {
              ...journal,
              entries: journal.entries.map(entry =>
                entry.id === entryId ? { ...entry, ...updates } : entry
              ),
              updatedAt: new Date().toISOString(),
            }
          : journal
      )
    );
  };

  const deleteEntry = (backtestingId: string, entryId: string) => {
    setBacktestingJournals(prev =>
      prev.map(journal =>
        journal.id === backtestingId
          ? {
              ...journal,
              entries: journal.entries.filter(entry => entry.id !== entryId),
              updatedAt: new Date().toISOString(),
            }
          : journal
      )
    );
  };

  const addColumn = (backtestingId: string, column: Omit<BacktestingColumn, 'id'>) => {
    const newColumn: BacktestingColumn = {
      id: Date.now().toString(),
      ...column,
    };

    setBacktestingJournals(prev =>
      prev.map(journal =>
        journal.id === backtestingId
          ? {
              ...journal,
              columns: [...journal.columns, newColumn],
              updatedAt: new Date().toISOString(),
            }
          : journal
      )
    );
  };

  const updateColumn = (backtestingId: string, columnId: string, updates: Partial<BacktestingColumn>) => {
    setBacktestingJournals(prev =>
      prev.map(journal =>
        journal.id === backtestingId
          ? {
              ...journal,
              columns: journal.columns.map(column =>
                column.id === columnId ? { ...column, ...updates } : column
              ),
              updatedAt: new Date().toISOString(),
            }
          : journal
      )
    );
  };

  const deleteColumn = (backtestingId: string, columnId: string) => {
    setBacktestingJournals(prev =>
      prev.map(journal =>
        journal.id === backtestingId
          ? {
              ...journal,
              columns: journal.columns.filter(column => column.id !== columnId),
              updatedAt: new Date().toISOString(),
            }
          : journal
      )
    );
  };

  const addImage = (backtestingId: string, entryId: string, imageUrl: string) => {
    const journal = backtestingJournals.find(j => j.id === backtestingId);
    if (journal) {
      const imageColumn = journal.columns.find(col => col.type === 'image');
      if (imageColumn) {
        updateEntry(backtestingId, entryId, { [imageColumn.id]: imageUrl });
      }
    }
  };

  const removeImage = (backtestingId: string, entryId: string, imageUrl: string) => {
    const journal = backtestingJournals.find(j => j.id === backtestingId);
    if (journal) {
      const imageColumn = journal.columns.find(col => col.type === 'image');
      if (imageColumn) {
        updateEntry(backtestingId, entryId, { [imageColumn.id]: '' });
      }
    }
  };

  const activeBacktesting = backtestingJournals.find(j => j.id === activeBacktestingId);

  return {
    backtestingJournals,
    activeBacktestingId,
    activeBacktesting,
    setActiveBacktestingId,
    createBacktesting,
    updateBacktestingName,
    deleteBacktesting,
    addEntry,
    updateEntry,
    deleteEntry,
    addColumn,
    updateColumn,
    deleteColumn,
    addImage,
    removeImage,
  };
}
