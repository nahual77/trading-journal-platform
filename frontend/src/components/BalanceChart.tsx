import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  entry?: TradeEntry;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ entries, initialBalance, journalName }) => {
  const { t } = useTranslation();
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null); // Ref para el tooltip
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
        benefit: benefit, // Agregar el beneficio para el tooltip
        entry: entry // Incluir la entrada completa para el tooltip
      });
    });

    console.log('📈 Puntos del gráfico generados:', points.map(p => `x:${p.x}, y:${p.y}, label:${p.label}`));
    console.log('🎯 Verificación del orden:');
    console.log('  - Punto 0 (Inicio):', points[0] ? `x:${points[0].x}, y:${points[0].y}` : 'N/A');
    console.log('  - Punto 1 (Primera op):', points[1] ? `x:${points[1].x}, y:${points[1].y}, fecha:${points[1].date} ${points[1].time}` : 'N/A');
    console.log('  - Último punto:', points[points.length - 1] ? `x:${points[points.length - 1].x}, y:${points[points.length - 1].y}, fecha:${points[points.length - 1].date} ${points[points.length - 1].time}` : 'N/A');
    return points;
  }, [entries, initialBalance]);

  // Configuración del gráfico SVG - MEJORADO
  const padding = 60; // Padding para el área de datos
  const chartHeight = 400; // Altura fija
  const pointSpacing = 40; // Espaciado deseado entre puntos en píxeles

  // Calcular el ancho del gráfico dinámicamente
  const chartWidth = useMemo(() => {
    if (chartData.length <= 1) return 800; // Ancho mínimo para pocos puntos
    // Aseguramos que el ancho sea suficiente para todos los puntos con el espaciado deseado
    return Math.max(800, chartData.length * pointSpacing + 2 * padding);
  }, [chartData.length, padding, pointSpacing]);

  // Calcular valores necesarios para el renderizado
  const maxY = Math.max(...chartData.map(p => p.y), initialBalance + 50);
  const minY = Math.min(...chartData.map(p => p.y), initialBalance - 50);
  const maxX = chartData.length - 1 || 1;

  // Funciones memoizadas para obtener coordenadas X e Y
  const getX = useCallback((index: number) => {
    if (chartData.length <= 1) return padding + (chartWidth - 2 * padding) / 2; // Centrar para un solo punto
    const availableWidth = chartWidth - 2 * padding;
    return padding + (index / (chartData.length - 1)) * availableWidth;
  }, [chartData.length, chartWidth, padding]);

  const getY = useCallback((value: number) => {
    if (maxY === minY) return padding + (chartHeight - 2 * padding) / 2; // Centrar para línea plana
    return padding + ((maxY - value) / (maxY - minY)) * (chartHeight - 2 * padding);
  }, [chartHeight, padding, maxY, minY]);

  const currentBalance = chartData[chartData.length - 1]?.y || initialBalance;
  const totalProfit = currentBalance - initialBalance;
  const profitColor = totalProfit >= 0 ? '#10B981' : '#EF4444';

  // Efecto para ajustar la posición del tooltip después de renderizarse
  useEffect(() => {
    if (hoveredPoint && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      
      let newX = tooltipPosition.x;
      let newY = tooltipPosition.y;
      
      // Ajustar si se sale por la derecha - solo si está muy cerca del borde
      if (rect.right > window.innerWidth - 5) {
        newX = window.innerWidth - rect.width - 5;
      }
      
      // Ajustar si se sale por la izquierda - solo si está muy cerca del borde
      if (rect.left < 5) {
        newX = 5;
      }
      
      // Ajustar si se sale por arriba
      if (rect.top < 10) {
        newY = rect.top + rect.height + 20;
      }
      
      // Ajustar si se sale por abajo
      if (rect.bottom > window.innerHeight - 10) {
        newY = window.innerHeight - rect.height - 10;
      }
      
      // Solo actualizar si hay cambios
      if (newX !== tooltipPosition.x || newY !== tooltipPosition.y) {
        setTooltipPosition({ x: newX, y: newY });
      }
    }
  }, [hoveredPoint]); // Removido tooltipPosition.x y tooltipPosition.y de las dependencias

  // Early return después de todos los hooks
  if (chartData.length <= 1) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">
          📈 {t('balanceChart.title')} - {journalName}
        </h3>
        <p className="text-gray-400 text-center py-8">
          Agrega operaciones para ver la curva de balance
        </p>
      </div>
    );
  }


  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mt-4 w-full">
      <h3 className="text-lg font-semibold text-yellow-400 mb-6 text-center">
        📈 {t('balanceChart.title')} - {journalName}
      </h3>
      
      <div className="overflow-x-auto w-full">
        <svg 
          width={chartWidth} 
          height={chartHeight} 
          className="w-full min-w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Líneas de cuadrícula adaptativas */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5"/>
            </pattern>
          </defs>
          {/* Ajustar el rect para que la cuadrícula ocupe el área de datos */}
          <rect x={padding} y={padding} width={chartWidth - 2 * padding} height={chartHeight - 2 * padding} fill="url(#grid)" />
          
          {/* Líneas de cuadrícula principales */}
          <defs>
            <pattern id="mainGrid" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#4B5563" strokeWidth="1"/>
            </pattern>
          </defs>
          {/* Ajustar el rect para que la cuadrícula ocupe el área de datos */}
          <rect x={padding} y={padding} width={chartWidth - 2 * padding} height={chartHeight - 2 * padding} fill="url(#mainGrid)" />
          
          {/* Línea del gráfico */}
          <polyline
            fill="none"
            stroke={profitColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={chartData.map((point, index) => 
              `${getX(index)},${getY(point.y)}`
            ).join(' ')}
          />
          
          {/* Puntos de datos interactivos */}
          {chartData.map((point, index) => (
            <g key={index}>
              <circle
                cx={getX(index)}
                cy={getY(point.y)}
                r="8"
                fill={profitColor}
                stroke="#1F2937"
                strokeWidth="3"
                className="cursor-pointer hover:r-10 transition-all duration-200"
                onMouseEnter={(e) => {
                  setHoveredPoint(point);
                  
                  // Obtener las dimensiones de la ventana
                  const windowWidth = window.innerWidth;
                  const windowHeight = window.innerHeight;
                  
                  // Dimensiones base del tooltip - se ajustará dinámicamente
                  const baseTooltipWidth = 280;
                  const baseTooltipHeight = 120;
                  
                  // Calcular posición inicial
                  let x = e.clientX + 15;
                  let y = e.clientY - 10;
                  
                  // Ajustar posición horizontal - solo si está muy cerca del borde
                  if (x + baseTooltipWidth > windowWidth - 5) {
                    // Si se sale por la derecha, ponerlo a la izquierda del cursor
                    x = e.clientX - baseTooltipWidth - 15;
                  }
                  
                  // Asegurar que no se salga por la izquierda - solo si está muy cerca
                  if (x < 5) {
                    x = 5;
                  }
                  
                  // Ajustar posición vertical
                  if (y - baseTooltipHeight < 10) {
                    // Si se sale por arriba, ponerlo abajo del cursor
                    y = e.clientY + 20;
                  }
                  
                  // Asegurar que no se salga por abajo
                  if (y + baseTooltipHeight > windowHeight - 10) {
                    y = windowHeight - baseTooltipHeight - 10;
                  }
                  
                  setTooltipPosition({ x, y });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
          
        </svg>
      </div>
      
      {/* Tooltip flotante */}
      {hoveredPoint && hoveredPoint.entry && (
        <div 
          ref={tooltipRef} // Asignar el ref al div del tooltip
          className="fixed z-50 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-2xl"
          style={{
            left: `${tooltipPosition.x}px`, // Usar la posición X ajustada
            top: `${tooltipPosition.y}px`,
            transform: 'translateY(-100%)',
            minWidth: '280px',
            maxWidth: '400px',
            width: 'auto'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-yellow-400">
                {hoveredPoint.entry.fecha} {hoveredPoint.entry.hora}
              </h4>
              <span className={`text-sm font-bold ${hoveredPoint.benefit && hoveredPoint.benefit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {hoveredPoint.benefit && hoveredPoint.benefit >= 0 ? '+' : ''}${hoveredPoint.benefit?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            <div className="space-y-1 text-xs text-gray-300">
              <div><span className="text-gray-400">{t('balanceChart.tooltip.entryNumber')}</span> {chartData.findIndex(p => p.entry?.id === hoveredPoint.entry?.id) + 1 || 'N/A'}</div>
              <div><span className="text-gray-400">{t('balanceChart.tooltip.symbol')}</span> {hoveredPoint.entry.activo || hoveredPoint.entry.simbolo || 'N/A'}</div>
              <div><span className="text-gray-400">{t('balanceChart.tooltip.type')}</span> {hoveredPoint.entry.tipoOperacion || 'N/A'}</div>
              <div><span className="text-gray-400">{t('balanceChart.tooltip.benefit')}</span> <span className={`font-semibold ${hoveredPoint.benefit && hoveredPoint.benefit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {hoveredPoint.benefit && hoveredPoint.benefit >= 0 ? '+' : ''}${hoveredPoint.benefit?.toFixed(2) || '0.00'}
              </span></div>
              <div><span className="text-gray-400">{t('balanceChart.tooltip.balance')}</span> ${hoveredPoint.y.toFixed(2)}</div>
              {hoveredPoint.entry.comentarios && (
                <div><span className="text-gray-400">{t('balanceChart.tooltip.comments')}</span> {hoveredPoint.entry.comentarios}</div>
              )}
            </div>
            
            {/* Primera imagen si existe */}
            {hoveredPoint.entry.antes && hoveredPoint.entry.antes.length > 0 && (
              <div className="mt-2">
                <img 
                  src={hoveredPoint.entry.antes[0].url} 
                  alt="Screenshot antes"
                  className="w-full max-w-sm mx-auto rounded border border-gray-600"
                  style={{
                    maxHeight: '200px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Estadísticas resumidas */}
      <div className="flex justify-between mt-4 text-sm">
        <div className="flex gap-4">
          <span className="text-gray-400">
            {t('balanceChart.operations')}: <span className="text-white font-semibold">{entries.length}</span>
          </span>
          <span className="text-gray-400">
            {t('balanceChart.initialBalance')}: <span className="text-white font-semibold">${initialBalance.toFixed(2)}</span>
          </span>
        </div>
        <div className="flex gap-4">
          <span className="text-gray-400">
            {t('balanceChart.totalProfit')}: <span className={`font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </span>
          </span>
          <span className="text-gray-400">
            {t('balanceChart.currentBalance')}: <span className="text-yellow-400 font-semibold">
              ${currentBalance.toFixed(2)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BalanceChart;
