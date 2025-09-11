import React from 'react';
import { useTranslation } from 'react-i18next';
import { TradeEntry, ColumnDefinition, TradeImage } from '../types/trading';
import { Plus, Trash2, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface MobileTradingViewProps {
  entries: TradeEntry[];
  columns: ColumnDefinition[];
  onAddEntry: () => void;
  onUpdateEntry: (entryId: string, updates: Partial<TradeEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
  onAddImage: (entryId: string, image: TradeImage) => void;
  onRemoveImage: (entryId: string, imageId: string) => void;
  onToggleColumn: (columnId: string) => void;
}

export default function MobileTradingView({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: MobileTradingViewProps) {
  const { t } = useTranslation();

  const formatValue = (value: any, columnKey: string) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (columnKey === 'fecha' && value) {
      return new Date(value).toLocaleDateString();
    }

    if (columnKey === 'hora' && value) {
      return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (columnKey === 'beneficio' && typeof value === 'number') {
      return `$${value.toFixed(2)}`;
    }

    if (columnKey === 'tipoOperacion') {
      return value === 'compra' ? '📈' : value === 'venta' ? '📉' : '➖';
    }

    if (columnKey === 'seCumplioElPlan') {
      return value ? '✅' : '❌';
    }

    return String(value);
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-400';
    if (profit < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'compra':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'venta':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header con botón de nueva operación */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gold-300">
          {t('tradingJournal.operations')}
        </h2>
        <button
          onClick={onAddEntry}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium min-h-[48px] w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span>{t('tradingJournal.newOperation')}</span>
        </button>
      </div>

      {/* Lista de operaciones en formato de cards */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium mb-2">{t('table.noOperations')}</p>
            <p className="text-sm">{t('table.clickToEdit')}</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
            >
              {/* Header de la card */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gold-300">
                    #{entry.operationNumber}
                  </span>
                  {getOperationIcon(entry.tipoOperacion)}
                </div>
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Contenido principal */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Fecha y hora */}
                <div>
                  <div className="text-gray-400 text-xs mb-1">{t('table.date')}</div>
                  <div className="text-white">
                    {formatValue(entry.fecha, 'fecha')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">{t('table.time')}</div>
                  <div className="text-white">
                    {formatValue(entry.hora, 'hora')}
                  </div>
                </div>

                {/* Símbolo y tipo */}
                <div>
                  <div className="text-gray-400 text-xs mb-1">{t('table.symbol')}</div>
                  <div className="text-white font-medium">
                    {entry.simbolo || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">{t('table.type')}</div>
                  <div className="text-white">
                    {formatValue(entry.tipoOperacion, 'tipoOperacion')}
                  </div>
                </div>

                {/* Beneficio */}
                <div className="col-span-2">
                  <div className="text-gray-400 text-xs mb-1">{t('table.profit')}</div>
                  <div className={`font-bold text-lg ${getProfitColor(typeof entry.beneficio === 'number' ? entry.beneficio : 0)}`}>
                    {formatValue(entry.beneficio, 'beneficio')}
                  </div>
                </div>

                {/* Plan seguido */}
                <div className="col-span-2">
                  <div className="text-gray-400 text-xs mb-1">{t('table.planFollowed')}</div>
                  <div className="text-white">
                    {formatValue(entry.seCumplioElPlan, 'seCumplioElPlan')}
                  </div>
                </div>
              </div>

              {/* Razón de entrada (si existe) */}
              {entry.razonEntrada && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">{t('table.entryReason')}</div>
                  <div className="text-white text-sm">
                    {entry.razonEntrada.length > 100 
                      ? `${entry.razonEntrada.substring(0, 100)}...` 
                      : entry.razonEntrada
                    }
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Estadísticas móviles */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-gray-800/50 p-3 rounded-lg text-center">
            <div className="text-gray-400 text-xs mb-1">{t('tradingJournal.totalOperations')}</div>
            <div className="text-lg font-bold text-white">{entries.length}</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg text-center">
            <div className="text-gray-400 text-xs mb-1">{t('table.planFollowed')}</div>
            <div className="text-lg font-bold text-green-400">
              {entries.filter(e => e.seCumplioElPlan).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
