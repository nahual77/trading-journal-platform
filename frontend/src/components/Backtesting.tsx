import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TestTube, BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react';
import BacktestingTable, { BacktestingColumn, BacktestingEntry, ColumnType } from './BacktestingTable';

export default function Backtesting() {
  const { t } = useTranslation();
  
  // Estado para las columnas de backtesting
  const [columns, setColumns] = useState<BacktestingColumn[]>([
    {
      id: 'testName',
      name: t('backtesting.testName'),
      type: 'text',
      visible: true,
    },
    {
      id: 'strategy',
      name: t('backtesting.strategy'),
      type: 'text',
      visible: true,
    },
    {
      id: 'period',
      name: t('backtesting.period'),
      type: 'text',
      visible: true,
    },
    {
      id: 'winRate',
      name: t('backtesting.winRate'),
      type: 'number',
      visible: true,
    },
    {
      id: 'profit',
      name: t('backtesting.profit'),
      type: 'number',
      visible: true,
    },
    {
      id: 'maxDrawdown',
      name: t('backtesting.maxDrawdown'),
      type: 'number',
      visible: true,
    },
    {
      id: 'sharpeRatio',
      name: t('backtesting.sharpeRatio'),
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
  ]);

  // Estado para las entradas de backtesting
  const [entries, setEntries] = useState<BacktestingEntry[]>([]);

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const savedColumns = localStorage.getItem('backtesting-columns');
    const savedEntries = localStorage.getItem('backtesting-entries');
    
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('backtesting-columns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('backtesting-entries', JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (entry: Omit<BacktestingEntry, 'id'>) => {
    const newEntry: BacktestingEntry = {
      id: Date.now().toString(),
      ...entry,
    };
    setEntries([...entries, newEntry]);
  };

  const handleUpdateEntry = (id: string, updatedEntry: Partial<BacktestingEntry>) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ));
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleAddColumn = (column: Omit<BacktestingColumn, 'id'>) => {
    const newColumn: BacktestingColumn = {
      id: Date.now().toString(),
      ...column,
    };
    setColumns([...columns, newColumn]);
  };

  const handleUpdateColumn = (id: string, updatedColumn: Partial<BacktestingColumn>) => {
    setColumns(columns.map(column => 
      column.id === id ? { ...column, ...updatedColumn } : column
    ));
  };

  const handleDeleteColumn = (id: string) => {
    setColumns(columns.filter(column => column.id !== id));
  };

  const handleAddImage = (entryId: string, imageUrl: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      // Buscar la primera columna de tipo imagen
      const imageColumn = columns.find(col => col.type === 'image');
      if (imageColumn) {
        handleUpdateEntry(entryId, { [imageColumn.id]: imageUrl });
      }
    }
  };

  const handleRemoveImage = (entryId: string, imageUrl: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      const imageColumn = columns.find(col => col.type === 'image');
      if (imageColumn) {
        handleUpdateEntry(entryId, { [imageColumn.id]: '' });
      }
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalTests = entries.length;
    const profitableTests = entries.filter(entry => entry.isProfitable).length;
    const avgWinRate = entries.reduce((sum, entry) => sum + (entry.winRate || 0), 0) / totalTests || 0;
    const avgProfit = entries.reduce((sum, entry) => sum + (entry.profit || 0), 0) / totalTests || 0;
    const avgSharpe = entries.reduce((sum, entry) => sum + (entry.sharpeRatio || 0), 0) / totalTests || 0;

    return {
      totalTests,
      profitableTests,
      avgWinRate,
      avgProfit,
      avgSharpe,
    };
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
          <TestTube className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('backtesting.title')}</h2>
        <p className="text-gray-400">{t('backtesting.subtitle')}</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">{t('backtesting.tests')}</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalTests}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-400">Rentables</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.profitableTests}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Win Rate Promedio</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.avgWinRate.toFixed(1)}%</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-400">Profit Promedio</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">${stats.avgProfit.toFixed(2)}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">Sharpe Promedio</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.avgSharpe.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabla de backtesting */}
      <BacktestingTable
        entries={entries}
        columns={columns}
        onAddEntry={handleAddEntry}
        onUpdateEntry={handleUpdateEntry}
        onDeleteEntry={handleDeleteEntry}
        onAddColumn={handleAddColumn}
        onUpdateColumn={handleUpdateColumn}
        onDeleteColumn={handleDeleteColumn}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
      />
    </div>
  );
}
