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
  benefit?: number;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ entries, initialBalance, journalName }) => {
  const chartData = useMemo(() => {
    console.log('📊 BalanceChart: Procesando entradas:', entries.length);
    console.log('📋 Entradas originales (orden de la tabla):', entries.map(e => `${e.fecha} ${e.hora}`));
    
    // Ordenar entradas por fecha y hora (más antigua primero)
    const sortedEntries = [...entries].sort((a, b) => {
      // Crear fechas completas con fecha y hora
      const dateA = new Date(`${a.fecha}T${a.hora}`);
      const dateB = new Date(`${b.fecha}T${b.hora}`);
      
      // Si las fechas son iguales, ordenar por ID para mantener consistencia
      if (dateA.getTime() === dateB.getTime()) {
        return a.id.localeCompare(b.id);
      }
      
      return dateA.getTime() - dateB.getTime();
    });

    console.log('📅 Entradas ordenadas cronológicamente:', sortedEntries.map(e => `${e.fecha} ${e.hora}`));
    console.log('🔄 Comparación:');
    console.log('  - Primera entrada (más antigua):', sortedEntries[0] ? `${sortedEntries[0].fecha} ${sortedEntries[0].hora}` : 'N/A');
    console.log('  - Última entrada (más reciente):', sortedEntries[sortedEntries.length - 1] ? `${sortedEntries[sortedEntries.length - 1].fecha} ${sortedEntries[sortedEntries.length - 1].hora}` : 'N/A');

    // Calcular balance acumulativo
    let runningBalance = initialBalance;
    const points: ChartPoint[] = [{ x: 0, y: initialBalance, label: 'Inicio' }];

    // Agregar cada operación en orden cronológico (primera operación = x:1, última operación = x:último)
    sortedEntries.forEach((entry, index) => {
      const benefit = parseFloat(entry.beneficio) || 0;
      runningBalance += benefit;
      points.push({
        x: index + 1, // x:1 para la primera operación, x:2 para la segunda, etc.
        y: runningBalance,
        label: `${entry.fecha} ${entry.hora}`, // Mostrar fecha y hora en lugar de Op1, Op2
        date: entry.fecha,
        time: entry.hora,
        benefit: benefit // Agregar el beneficio para el tooltip
      });
    });

    console.log('📈 Puntos del gráfico generados:', points.map(p => `x:${p.x}, y:${p.y}, label:${p.label}`));
    console.log('🎯 Verificación del orden:');
    console.log('  - Punto 0 (Inicio):', points[0] ? `x:${points[0].x}, y:${points[0].y}` : 'N/A');
    console.log('  - Punto 1 (Primera op):', points[1] ? `x:${points[1].x}, y:${points[1].y}, fecha:${points[1].date} ${points[1].time}` : 'N/A');
    console.log('  - Último punto:', points[points.length - 1] ? `x:${points[points.length - 1].x}, y:${points[points.length - 1].y}, fecha:${points[points.length - 1].date} ${points[points.length - 1].time}` : 'N/A');
    return points;
  }, [entries, initialBalance]);

  // Configuración del gráfico SVG
  const chartWidth = 800;
  const chartHeight = 350;
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
      <h3 className="text-2xl font-semibold text-yellow-400 mb-4">
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
              >
                <title>
                  {index === 0 
                    ? `Inicio: $${point.y.toFixed(2)}` 
                    : `Op${index}: $${point.y.toFixed(2)} - ${point.date} ${point.time}${point.benefit !== undefined ? ` (${point.benefit >= 0 ? '+' : ''}$${point.benefit.toFixed(2)})` : ''}`
                  }
                </title>
              </circle>
              <text
                x={getX(index)}
                y={getY(point.y) - 8}
                textAnchor="middle"
                className="text-sm fill-gray-300"
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
              className="text-sm fill-gray-400"
            >
              {index === 0 ? 'Inicio' : `Op${index}`}
            </text>
          ))}
        </svg>
      </div>
      
      {/* Estadísticas resumidas */}
      <div className="flex justify-between mt-4 text-xl">
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
