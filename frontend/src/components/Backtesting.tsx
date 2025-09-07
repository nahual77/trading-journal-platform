import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TestTube, BarChart3, TrendingUp, Target } from 'lucide-react';
import BacktestingTable from './BacktestingTable';
import { BacktestingTabs } from './BacktestingTabs';
import { useBacktestingState } from '../hooks/useBacktestingState';

export default function Backtesting() {
  const { t } = useTranslation();
  
  const {
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
  } = useBacktestingState();

  // Calcular estadísticas del backtesting activo
  const stats = useMemo(() => {
    if (!activeBacktesting) {
      return {
        totalTests: 0,
        profitableTests: 0,
        avgWinRate: 0,
        avgProfit: 0,
        avgSharpe: 0,
      };
    }

    const entries = activeBacktesting.entries;
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
  }, [activeBacktesting]);

  if (!activeBacktesting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <TestTube className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">{t('common.loading')}</h2>
          <p className="text-gray-400">{t('backtesting.subtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pestañas de backtesting */}
      <BacktestingTabs
        backtestingJournals={backtestingJournals}
        activeBacktestingId={activeBacktestingId}
        onSelectBacktesting={setActiveBacktestingId}
        onCreateBacktesting={createBacktesting}
        onUpdateBacktestingName={updateBacktestingName}
        onDeleteBacktesting={deleteBacktesting}
      />

      {/* Estadísticas del backtesting activo */}
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
        entries={activeBacktesting.entries}
        columns={activeBacktesting.columns}
        onAddEntry={(entry) => addEntry(activeBacktestingId, entry)}
        onUpdateEntry={(entryId, updates) => updateEntry(activeBacktestingId, entryId, updates)}
        onDeleteEntry={(entryId) => deleteEntry(activeBacktestingId, entryId)}
        onAddColumn={(column) => addColumn(activeBacktestingId, column)}
        onUpdateColumn={(columnId, updates) => updateColumn(activeBacktestingId, columnId, updates)}
        onDeleteColumn={(columnId) => deleteColumn(activeBacktestingId, columnId)}
        onAddImage={(entryId, imageUrl) => addImage(activeBacktestingId, entryId, imageUrl)}
        onRemoveImage={(entryId, imageUrl) => removeImage(activeBacktestingId, entryId, imageUrl)}
      />
    </div>
  );
}
