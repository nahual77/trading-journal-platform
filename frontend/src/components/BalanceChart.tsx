import React, { useMemo } from 'react';
import { TradeEntry } from '../types/trading';

interface BalanceChartProps {
  entries: TradeEntry[];
  initialBalance: number;
  journalName: string;
}

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  date?: string;
  time?: string;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ entries, initialBalance, journalName }) => {
  const chartData = useMemo(() => {
    // Ordenar entradas por fecha y hora
    const sortedEntries = [...entries].sort((a, b) => {
      const dateA = new Date(`${a.fecha} ${a.hora}`);
      const dateB = new Date(`${b.fecha} ${b.hora}`);
      return dateA.getTime() - dateB.getTime();
    });

    // Calcular balance acumulativo
    let runningBalance = initialBalance;
    const points: ChartPoint[] = [{ x: 0, y: initialBalance, label: 'Inicio' }];

    sortedEntries.forEach((entry, index) => {
      const benefit = parseFloat(entry.beneficio) || 0;
      runningBalance += benefit;
      points.push({
        x: index + 1,
        y: runningBalance,
        label: `Op${index + 1}`,
        date: entry.fecha,
        time: entry.hora
      });
    });

    return points;
  }, [entries, initialBalance]);

  // Configuración del gráfico SVG
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;

  if (chartData.length <= 1) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">
          📈 Progresión de Balance - {journalName}
        </h3>
        <p className="text-gray-400 text-center py-8">
          Agrega operaciones para ver la curva de balance
        </p>
      </div>
    );
  }

  const maxY = Math.max(...chartData.map(p => p.y), initialBalance + 50);
  const minY = Math.min(...chartData.map(p => p.y), initialBalance - 50);
  const maxX = chartData.length - 1 || 1;

  const getX = (index: number) => padding + (index / maxX) * (chartWidth - 2 * padding);
  const getY = (value: number) => padding + ((maxY - value) / (maxY - minY)) * (chartHeight - 2 * padding);

  const currentBalance = chartData[chartData.length - 1]?.y || initialBalance;
  const totalProfit = currentBalance - initialBalance;
  const profitColor = totalProfit >= 0 ? '#10B981' : '#EF4444';

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold text-yellow-400 mb-4">
        📈 Progresión de Balance - {journalName}
      </h3>
      
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="w-full">
          {/* Líneas de cuadrícula */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Línea del gráfico */}
          <polyline
            fill="none"
            stroke={profitColor}
            strokeWidth="3"
            points={chartData.map((point, index) => 
              `${getX(index)},${getY(point.y)}`
            ).join(' ')}
          />
          
          {/* Puntos de datos */}
          {chartData.map((point, index) => (
            <g key={index}>
              <circle
                cx={getX(index)}
                cy={getY(point.y)}
                r="4"
                fill={profitColor}
                stroke="#1F2937"
                strokeWidth="2"
              />
              <text
                x={getX(index)}
                y={getY(point.y) - 8}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                ${point.y.toFixed(0)}
              </text>
            </g>
          ))}
          
          {/* Etiquetas del eje X */}
          {chartData.map((point, index) => (
            <text
              key={index}
              x={getX(index)}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-gray-400"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
      
      {/* Estadísticas resumidas */}
      <div className="flex justify-between mt-4 text-sm">
        <div className="flex gap-4">
          <span className="text-gray-400">
            Operaciones: <span className="text-white font-semibold">{entries.length}</span>
          </span>
          <span className="text-gray-400">
            Balance inicial: <span className="text-white font-semibold">${initialBalance.toFixed(2)}</span>
          </span>
        </div>
        <div className="flex gap-4">
          <span className="text-gray-400">
            Beneficio total: <span className={`font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </span>
          </span>
          <span className="text-gray-400">
            Balance actual: <span className="text-yellow-400 font-semibold">
              ${currentBalance.toFixed(2)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BalanceChart;
