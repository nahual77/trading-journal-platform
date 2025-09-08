import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BacktestingJournal, BacktestingColumn, BacktestingEntry } from '../components/BacktestingTable';

// Función para crear columnas por defecto
const createDefaultColumns = (t: any): BacktestingColumn[] => [
  {
    id: 'testName',
    name: t('backtesting.columns.testName'),
    type: 'text',
    visible: true,
  },
  {
    id: 'strategy',
    name: t('backtesting.columns.strategy'),
    type: 'text',
    visible: true,
  },
  {
    id: 'period',
    name: t('backtesting.columns.period'),
    type: 'text',
    visible: true,
  },
  {
    id: 'winRate',
    name: t('backtesting.columns.winRate'),
    type: 'number',
    visible: true,
  },
  {
    id: 'profit',
    name: t('backtesting.columns.profit'),
    type: 'number',
    visible: true,
  },
  {
    id: 'maxDrawdown',
    name: t('backtesting.columns.maxDrawdown'),
    type: 'number',
    visible: true,
  },
  {
    id: 'sharpeRatio',
    name: t('backtesting.columns.sharpeRatio'),
    type: 'number',
    visible: true,
  },
  {
    id: 'notes',
    name: t('backtesting.columns.notes'),
    type: 'text',
    visible: true,
  },
  {
    id: 'chart',
    name: t('backtesting.columns.chart'),
    type: 'image',
    visible: true,
  },
  {
    id: 'isProfitable',
    name: t('backtesting.columns.profitable'),
    type: 'boolean',
    visible: true,
  },
];

// Función para cargar datos del localStorage
const loadFromStorage = (t: any): { journals: BacktestingJournal[], activeId: string } => {
  try {
    const savedBacktesting = localStorage.getItem('backtesting-journals');
    const savedActiveId = localStorage.getItem('active-backtesting-id');
    
    if (savedBacktesting) {
      const journals = JSON.parse(savedBacktesting);
      const activeId = savedActiveId && journals.find((j: BacktestingJournal) => j.id === savedActiveId) 
        ? savedActiveId 
        : journals.length > 0 ? journals[0].id : '';
      
      return { journals, activeId };
    }
  } catch (error) {
    console.error('Error loading backtesting data:', error);
  }
  
  // Crear backtesting por defecto
  const defaultBacktesting: BacktestingJournal = {
    id: Date.now().toString(),
    name: 'Mi Primer Backtesting',
    entries: [],
    columns: createDefaultColumns(t),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return { journals: [defaultBacktesting], activeId: defaultBacktesting.id };
};

// Función para guardar en localStorage
const saveToStorage = (journals: BacktestingJournal[], activeId: string) => {
  try {
    localStorage.setItem('backtesting-journals', JSON.stringify(journals));
    localStorage.setItem('active-backtesting-id', activeId);
  } catch (error) {
    console.error('Error saving backtesting data:', error);
  }
};

export function useBacktestingState() {
  const { t } = useTranslation();
  
  // Inicializar con datos del localStorage
  const { journals: initialJournals, activeId: initialActiveId } = loadFromStorage(t);
  
  const [backtestingJournals, setBacktestingJournals] = useState<BacktestingJournal[]>(initialJournals);
  const [activeBacktestingId, setActiveBacktestingId] = useState<string>(initialActiveId);

  const createBacktesting = useCallback((name: string) => {
    const newBacktesting: BacktestingJournal = {
      id: Date.now().toString(),
      name,
      entries: [],
      columns: createDefaultColumns(t),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newJournals = [...backtestingJournals, newBacktesting];
    setBacktestingJournals(newJournals);
    setActiveBacktestingId(newBacktesting.id);
    saveToStorage(newJournals, newBacktesting.id);
    return newBacktesting;
  }, [backtestingJournals]);

  const updateBacktestingName = useCallback((id: string, name: string) => {
    const newJournals = backtestingJournals.map(journal => 
      journal.id === id 
        ? { ...journal, name, updatedAt: new Date().toISOString() }
        : journal
    );
    setBacktestingJournals(newJournals);
    saveToStorage(newJournals, activeBacktestingId);
  }, [backtestingJournals, activeBacktestingId]);

  const deleteBacktesting = useCallback((id: string) => {
    const filtered = backtestingJournals.filter(journal => journal.id !== id);
    let newActiveId = activeBacktestingId;
    
    if (activeBacktestingId === id) {
      newActiveId = filtered.length > 0 ? filtered[0].id : '';
      setActiveBacktestingId(newActiveId);
    }
    
    setBacktestingJournals(filtered);
    saveToStorage(filtered, newActiveId);
  }, [backtestingJournals, activeBacktestingId]);

  const addEntry = useCallback((backtestingId: string, entry: Omit<BacktestingEntry, 'id'>) => {
    const newEntry: BacktestingEntry = {
      id: Date.now().toString(),
      ...entry,
    };

    const newJournals = backtestingJournals.map(journal =>
      journal.id === backtestingId
        ? {
            ...journal,
            entries: [...journal.entries, newEntry],
            updatedAt: new Date().toISOString(),
          }
        : journal
    );
    
    setBacktestingJournals(newJournals);
    saveToStorage(newJournals, activeBacktestingId);
  }, [backtestingJournals, activeBacktestingId]);

  const updateEntry = useCallback((backtestingId: string, entryId: string, updates: Partial<BacktestingEntry>) => {
    const newJournals = backtestingJournals.map(journal =>
      journal.id === backtestingId
        ? {
            ...journal,
            entries: journal.entries.map(entry =>
              entry.id === entryId ? { ...entry, ...updates } : entry
            ),
            updatedAt: new Date().toISOString(),
          }
        : journal
    );
    
    setBacktestingJournals(newJournals);
    saveToStorage(newJournals, activeBacktestingId);
  }, [backtestingJournals, activeBacktestingId]);

  const deleteEntry = useCallback((backtestingId: string, entryId: string) => {
    const newJournals = backtestingJournals.map(journal =>
      journal.id === backtestingId
        ? {
            ...journal,
            entries: journal.entries.filter(entry => entry.id !== entryId),
            updatedAt: new Date().toISOString(),
          }
        : journal
    );
    
    setBacktestingJournals(newJournals);
    saveToStorage(newJournals, activeBacktestingId);
  }, [backtestingJournals, activeBacktestingId]);

  const addColumn = useCallback((backtestingId: string, column: Omit<BacktestingColumn, 'id'>) => {
    const newColumn: BacktestingColumn = {
      id: Date.now().toString(),
      ...column,
    };

    const newJournals = backtestingJournals.map(journal =>
      journal.id === backtestingId
        ? {
            ...journal,
            columns: [...journal.columns, newColumn],
            updatedAt: new Date().toISOString(),
          }
        : journal
    );
    
    setBacktestingJournals(newJournals);
    saveToStorage(newJournals, activeBacktestingId);
  }, [backtestingJournals, activeBacktestingId]);

  const updateColumn = useCallback((backtestingId: string, columnId: string, updates: Partial<BacktestingColumn>) => {
    const newJournals = backtestingJournals.map(journal =>
      journal.id === backtestingId
        ? {
            ...journal,
            columns: journal.columns.map(column =>
              column.id === columnId ? { ...column, ...updates } : column
            ),
            updatedAt: new Date().toISOString(),
          }
        : journal
    );
    
    setBacktestingJournals(newJournals);
    saveToStorage(newJournals, activeBacktestingId);
  }, [backtestingJournals, activeBacktestingId]);

  const deleteColumn = useCallback((backtestingId: string, columnId: string) => {
    const newJournals = backtestingJournals.map(journal =>
      journal.id === backtestingId
        ? {
            ...journal,
            columns: journal.columns.filter(column => column.id !== columnId),
            updatedAt: new Date().toISOString(),
          }
        : journal
    );
    
    setBacktestingJournals(newJournals);
    saveToStorage(newJournals, activeBacktestingId);
  }, [backtestingJournals, activeBacktestingId]);

  const addImage = useCallback((backtestingId: string, entryId: string, imageUrl: string) => {
    const journal = backtestingJournals.find(j => j.id === backtestingId);
    if (journal) {
      const imageColumn = journal.columns.find(col => col.type === 'image');
      if (imageColumn) {
        updateEntry(backtestingId, entryId, { [imageColumn.id]: imageUrl });
      }
    }
  }, [backtestingJournals, updateEntry]);

  const removeImage = useCallback((backtestingId: string, entryId: string, imageUrl: string) => {
    const journal = backtestingJournals.find(j => j.id === backtestingId);
    if (journal) {
      const imageColumn = journal.columns.find(col => col.type === 'image');
      if (imageColumn) {
        updateEntry(backtestingId, entryId, { [imageColumn.id]: '' });
      }
    }
  }, [backtestingJournals, updateEntry]);

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
