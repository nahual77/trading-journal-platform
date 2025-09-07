import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    PieChart,
    Target,
    Activity,
    Award
} from 'lucide-react';

interface StatisticsProps {
    journals: any[];
    activeJournalId: string | null;
    initialBalances: { [journalId: string]: number };
}

// Componente de gráfica de progresión consolidada usando la lógica del BalanceChart
const ConsolidatedBalanceChart = ({ journals, initialBalances }: { journals: any[], initialBalances: { [key: string]: number } }) => {
    const [hoveredPoint, setHoveredPoint] = useState<any>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [tooltipSide, setTooltipSide] = useState<'left' | 'right'>('right');
    const [containerWidth, setContainerWidth] = useState(0);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { chartData, totalInitialBalance } = useMemo(() => {
        if (!journals || !Array.isArray(journals)) return { chartData: [], totalInitialBalance: 0 };

        // Combinar todas las operaciones de todos los diarios
        const allEntries = journals.flatMap(journal =>
            (journal.entries || []).map(entry => ({
                ...entry,
                journalId: journal.id,
                journalName: journal.name
            }))
        );

        // Ordenar por fecha y hora (igual que BalanceChart)
        const sortedEntries = allEntries.sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);
            if (dateA.getTime() === dateB.getTime()) {
                return a.id.localeCompare(b.id);
            }
            return dateA.getTime() - dateB.getTime();
        });

        // Calcular balance consolidado (igual que BalanceChart)
        const totalInitialBalance = Object.values(initialBalances).reduce((sum, balance) => sum + balance, 0);
        let currentBalance = totalInitialBalance;

        const points = [
            { x: 0, y: totalInitialBalance, label: 'Balance Inicial', entry: null }
        ];

        sortedEntries.forEach((entry, index) => {
            const benefit = parseFloat(entry.beneficio) || 0;
            currentBalance += benefit;
            points.push({
                x: index + 1,
                y: currentBalance,
                label: `Operación #${index + 1}`,
                entry: entry
            });
        });

        return { chartData: points, totalInitialBalance };
    }, [journals, initialBalances]);

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400">
                No hay datos para mostrar
            </div>
        );
    }

    const padding = 40;
    const chartHeight = 400; // Reducido para que quepa el rectángulo
    const pointSpacing = 40;
    const bottomPadding = 60; // Espacio extra para las fechas

    // Efecto para medir el ancho del contenedor
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const chartWidth = useMemo(() => {
        if (containerWidth === 0) return 800; // Fallback mientras se mide
        if (chartData.length <= 1) return containerWidth;
        const calculatedWidth = chartData.length * pointSpacing + 2 * padding;
        return Math.max(containerWidth, calculatedWidth);
    }, [chartData.length, padding, pointSpacing, containerWidth]);

    const minY = Math.min(...chartData.map(p => p.y));
    const maxY = Math.max(...chartData.map(p => p.y));

    const getX = (index: number) => {
        if (chartData.length <= 1) return padding + (chartWidth - 2 * padding) / 2;
        const availableWidth = chartWidth - 2 * padding;
        return padding + (index / (chartData.length - 1)) * availableWidth;
    };

    const getY = (value: number) => {
        if (maxY === minY) return padding + (chartHeight - padding - bottomPadding) / 2;
        return padding + ((maxY - value) / (maxY - minY)) * (chartHeight - padding - bottomPadding);
    };

    const pathData = chartData.map((point, index) => {
        const x = getX(point.x);
        const y = getY(point.y);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Efecto para posicionar el tooltip dinámicamente
    useEffect(() => {
        if (hoveredPoint && tooltipRef.current) {
            const tooltip = tooltipRef.current;
            const rect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let newX = tooltipPosition.x;
            let newY = tooltipPosition.y;

            // Ajustar horizontalmente si se sale por la derecha
            if (rect.right > viewportWidth - 10) {
                newX = viewportWidth - rect.width - 10;
            }
            // Ajustar horizontalmente si se sale por la izquierda
            if (rect.left < 10) {
                newX = 10;
            }

            // Ajustar verticalmente si se sale por arriba
            if (rect.top < 10) {
                newY = tooltipPosition.y + rect.height + 20;
            }

            if (newX !== tooltipPosition.x || newY !== tooltipPosition.y) {
                setTooltipPosition({ x: newX, y: newY });
            }
        }
    }, [hoveredPoint, tooltipPosition.x, tooltipPosition.y]);

    return (
        <div className="h-[28rem] relative bg-gray-900/30 rounded-lg p-4">
            <div ref={containerRef} className="w-full h-full">
                <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                    {/* Gradiente para la línea */}
                    <defs>
                        <linearGradient id="consolidatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    {/* Líneas de cuadrícula horizontales */}
                    {[0, 25, 50, 75, 100].map(y => {
                        const yPos = padding + ((100 - y) / 100) * (chartHeight - padding - bottomPadding);
                        return (
                            <line
                                key={y}
                                x1={padding}
                                y1={yPos}
                                x2={chartWidth - padding}
                                y2={yPos}
                                stroke="rgba(156, 163, 175, 0.2)"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Línea de la gráfica */}
                    <path
                        d={pathData}
                        stroke="url(#consolidatedGradient)"
                        strokeWidth="3"
                        fill="none"
                    />

                    {/* Puntos de datos con tooltips */}
                    {chartData.map((point, index) => {
                        const x = getX(point.x);
                        const y = getY(point.y);
                        return (
                            <g key={index}>
                                {/* Área de hover invisible más grande */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="20"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={(e) => {
                                        console.log('Mouse enter on point:', point);
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const chartContainer = e.currentTarget.closest('.w-full');
                                        const containerRect = chartContainer?.getBoundingClientRect();

                                        // Calcular posición del tooltip
                                        let tooltipX = rect.left + rect.width / 2;
                                        let tooltipY = rect.top - 30; // Más arriba
                                        let side: 'left' | 'right' = 'right';

                                        // Si está cerca del borde derecho, posicionar hacia la izquierda
                                        if (containerRect && tooltipX > containerRect.right - 200) {
                                            tooltipX = rect.left + rect.width / 2 - 20;
                                            side = 'left';
                                        } else {
                                            tooltipX = rect.left + rect.width / 2 + 20;
                                            side = 'right';
                                        }

                                        setTooltipPosition({
                                            x: tooltipX,
                                            y: tooltipY
                                        });
                                        setTooltipSide(side);
                                        setHoveredPoint(point);
                                    }}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                                {/* Punto visible */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill="#10b981"
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                    className="pointer-events-none"
                                />
                            </g>
                        );
                    })}

                    {/* Etiquetas de balance (Y) */}
                    {[0, 25, 50, 75, 100].map((y, index) => {
                        const value = minY + (y / 100) * (maxY - minY);
                        const yPos = padding + ((100 - y) / 100) * (chartHeight - padding - bottomPadding);
                        return (
                            <text
                                key={y}
                                x={padding - 10}
                                y={yPos + 5}
                                fontSize="12"
                                fill="rgba(156, 163, 175, 0.8)"
                                textAnchor="end"
                            >
                                ${value.toFixed(0)}
                            </text>
                        );
                    })}

                    {/* Etiquetas de fechas (X) */}
                    {chartData.map((point, index) => {
                        if (point.entry) {
                            const x = getX(point.x);
                            const date = new Date(`${point.entry.fecha}T${point.entry.hora}`);
                            const dateStr = date.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit'
                            });
                            return (
                                <text
                                    key={`date-${index}`}
                                    x={x}
                                    y={chartHeight - bottomPadding + 20}
                                    fontSize="10"
                                    fill="rgba(156, 163, 175, 0.6)"
                                    textAnchor="middle"
                                >
                                    {dateStr}
                                </text>
                            );
                        }
                        return null;
                    })}
                </svg>
            </div>

            {/* Tooltip con información relevante para traders */}
            {hoveredPoint && (
                <div
                    ref={tooltipRef}
                    className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: tooltipSide === 'left'
                            ? 'translateX(-100%) translateY(-100%)'
                            : 'translateX(-50%) translateY(-100%)',
                        marginTop: '-10px'
                    }}
                    onMouseEnter={() => setHoveredPoint(hoveredPoint)}
                    onMouseLeave={() => setHoveredPoint(null)}
                >
                    <div className="text-sm">
                        {hoveredPoint.x === 0 ? (
                            // Punto inicial
                            <div>
                                <div className="text-yellow-400 font-semibold mb-2">💰 Balance Inicial</div>
                                <div className="text-green-400 text-lg font-bold">
                                    ${hoveredPoint.y.toFixed(2)}
                                </div>
                                <div className="text-gray-400 text-xs mt-1">
                                    Punto de partida consolidado
                                </div>
                            </div>
                        ) : (
                            // Operación
                            <div>
                                <div className="text-white font-semibold mb-2 flex items-center gap-2">
                                    📊 {hoveredPoint.label}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-green-400 font-bold">
                                        Balance: ${hoveredPoint.y.toFixed(2)}
                                    </div>
                                    <div className="text-gray-300 text-xs">
                                        📅 {hoveredPoint.entry?.fecha} {hoveredPoint.entry?.hora}
                                    </div>
                                    <div className="text-gray-300 text-xs">
                                        📁 {hoveredPoint.entry?.journalName}
                                    </div>
                                    <div className="text-yellow-400 text-xs">
                                        💰 Beneficio: ${parseFloat(hoveredPoint.entry?.beneficio || 0).toFixed(2)}
                                    </div>
                                    <div className="text-gray-300 text-xs">
                                        🎯 {hoveredPoint.entry?.activo}
                                    </div>
                                    <div className="text-gray-300 text-xs">
                                        📈 {hoveredPoint.entry?.tipoOperacion}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Información del gráfico */}
            <div className="absolute bottom-1 left-0 right-0 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 mx-2">
                <div className="flex justify-between items-center text-sm">
                    <div>
                        <div className="text-white">Progresión de balance consolidada</div>
                        <div className="text-yellow-400">{chartData.length - 1} operaciones</div>
                    </div>
                    <div className="text-green-400 font-semibold">
                        ${minY.toFixed(2)} - ${maxY.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de mini gráfica de balance para las tarjetas
const SimpleBalanceChart = ({ entries, initialBalance }: { entries: any[], initialBalance: number }) => {
    const balanceData = useMemo(() => {
        const safeInitialBalance = initialBalance || 0;
        if (!entries || entries.length === 0) return [{ x: 0, y: safeInitialBalance }];

        // Ordenar entradas por fecha y hora (igual que BalanceChart original)
        const sortedEntries = entries.sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);

            if (dateA.getTime() === dateB.getTime()) {
                return a.id.localeCompare(b.id);
            }

            return dateA.getTime() - dateB.getTime();
        });

        let currentBalance = safeInitialBalance;
        const data = [{ x: 0, y: currentBalance }];

        sortedEntries.forEach((entry, index) => {
            const benefit = parseFloat(entry.beneficio) || 0;
            currentBalance += benefit;
            data.push({ x: index + 1, y: currentBalance });
        });

        return data;
    }, [entries, initialBalance]);

    if (balanceData.length === 0) return null;

    const minBalance = Math.min(...balanceData.map(d => d.y));
    const maxBalance = Math.max(...balanceData.map(d => d.y));
    const range = maxBalance - minBalance || 1;

    const getX = (index: number) => (index / (balanceData.length - 1)) * 200;
    const getY = (balance: number) => 40 - ((balance - minBalance) / range) * 40;

    return (
        <div className="w-full h-12 bg-gray-700/30 rounded-lg p-2">
            <svg width="100%" height="100%" viewBox="0 0 200 40" className="overflow-visible">
                <path
                    d={balanceData.map((point, index) =>
                        `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.y)}`
                    ).join(' ')}
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                />
                {balanceData.map((point, index) => (
                    <circle
                        key={index}
                        cx={getX(index)}
                        cy={getY(point.y)}
                        r="2"
                        fill="#10b981"
                    />
                ))}
            </svg>
        </div>
    );
};

// Componente principal de estadísticas
const StatisticsNew = ({ journals, activeJournalId, initialBalances }: StatisticsProps) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [visibleCards, setVisibleCards] = useState<number[]>([]);

    // Efecto para animación de entrada
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Efecto para animación de tarjetas
    useEffect(() => {
        if (isVisible) {
            const journalCards = Array.from({ length: Math.min(journalStats.length, 5) }, (_, i) => i + 4);
            journalCards.forEach((index) => {
                setTimeout(() => {
                    setVisibleCards(prev => [...prev, index]);
                }, 400 + (index - 4) * 150);
            });
        }
    }, [isVisible]);

    const globalStats = useMemo(() => {
        if (!journals || !Array.isArray(journals)) {
            return {
                totalOperations: 0,
                winningOperations: 0,
                winRate: 0,
                totalProfit: 0,
                bestOperation: 0,
                worstOperation: 0
            };
        }

        const allEntries = journals.flatMap(journal => journal.entries || []);
        const totalOperations = allEntries.length;
        const winningOperations = allEntries.filter(entry => (parseFloat(entry.beneficio) || 0) > 0).length;
        const winRate = totalOperations > 0 ? (winningOperations / totalOperations) * 100 : 0;
        const totalProfit = allEntries.reduce((sum, entry) => sum + (parseFloat(entry.beneficio) || 0), 0);
        const bestOperation = Math.max(...allEntries.map(entry => parseFloat(entry.beneficio) || 0), 0);
        const worstOperation = Math.min(...allEntries.map(entry => parseFloat(entry.beneficio) || 0), 0);

        return {
            totalOperations,
            winningOperations,
            winRate,
            totalProfit,
            bestOperation,
            worstOperation
        };
    }, [journals]);

    const journalStats = useMemo(() => {
        if (!journals || !Array.isArray(journals)) {
            return [];
        }

        // Calcular estadísticas base para todos los diarios
        const baseStats = journals.map(journal => {
            const entries = journal.entries || [];
            const sortedEntries = entries.sort((a, b) => {
                const dateA = new Date(`${a.fecha}T${a.hora}`);
                const dateB = new Date(`${b.fecha}T${b.hora}`);

                if (dateA.getTime() === dateB.getTime()) {
                    return a.id.localeCompare(b.id);
                }

                return dateA.getTime() - dateB.getTime();
            });

            const totalOps = sortedEntries.length;
            const totalProfit = sortedEntries.reduce((sum, entry) => {
                const benefit = parseFloat(entry.beneficio) || 0;
                return sum + benefit;
            }, 0);
            const initialBalance = initialBalances[journal.id] || 0;
            const currentBalance = initialBalance + totalProfit;

            const best = sortedEntries.reduce((best, entry) => {
                const benefit = parseFloat(entry.beneficio) || 0;
                const bestBenefit = parseFloat(best.beneficio) || 0;
                return benefit > bestBenefit ? entry : best;
            }, { beneficio: 0 });

            const worst = sortedEntries.reduce((worst, entry) => {
                const benefit = parseFloat(entry.beneficio) || 0;
                const worstBenefit = parseFloat(worst.beneficio) || 0;
                return benefit < worstBenefit ? entry : worst;
            }, { beneficio: 0 });

            // Calcular métricas adicionales
            const winningOps = sortedEntries.filter(entry => (parseFloat(entry.beneficio) || 0) > 0).length;
            const winRate = totalOps > 0 ? (winningOps / totalOps) * 100 : 0;

            const totalGains = sortedEntries
                .filter(entry => (parseFloat(entry.beneficio) || 0) > 0)
                .reduce((sum, entry) => sum + (parseFloat(entry.beneficio) || 0), 0);
            const totalLosses = Math.abs(sortedEntries
                .filter(entry => (parseFloat(entry.beneficio) || 0) < 0)
                .reduce((sum, entry) => sum + (parseFloat(entry.beneficio) || 0), 0));
            const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? 999 : 0;

            // Calcular mejor operación
            const bestOperation = Math.max(...sortedEntries.map(entry => parseFloat(entry.beneficio) || 0), 0);

            // Calcular días desde la última operación
            const lastOperation = sortedEntries[sortedEntries.length - 1];
            const daysSinceLast = lastOperation ?
                Math.floor((Date.now() - new Date(`${lastOperation.fecha}T${lastOperation.hora}`).getTime()) / (1000 * 60 * 60 * 24)) :
                null;

            // Calcular tendencia de las últimas 5 operaciones
            const lastFiveOps = sortedEntries.slice(-5);
            const trend = lastFiveOps.length >= 2 ?
                (lastFiveOps[lastFiveOps.length - 1].beneficio > lastFiveOps[0].beneficio ? '↗️' : '↘️') :
                '➡️';

            return {
                ...journal,
                totalOps,
                currentBalance,
                totalProfit,
                isProfitable: totalProfit > 0,
                bestOperation: parseFloat(best.beneficio) || 0,
                worstOperation: parseFloat(worst.beneficio) || 0,
                winRate,
                profitFactor,
                winningOps,
                bestOperationValue: bestOperation,
                daysSinceLast,
                trend
            };
        });

        // Calcular promedio de ganancias de todos los diarios
        const totalProfitAll = baseStats.reduce((sum, journal) => sum + journal.totalProfit, 0);
        const averageProfit = baseStats.length > 0 ? totalProfitAll / baseStats.length : 0;

        // Calcular ranking por ganancia total
        const sortedByProfit = [...baseStats].sort((a, b) => b.totalProfit - a.totalProfit);

        // Agregar promedio y ranking a cada diario
        return baseStats.map(journal => {
            const ranking = sortedByProfit.findIndex(j => j.id === journal.id) + 1;
            const vsAverage = averageProfit > 0 ? ((journal.totalProfit - averageProfit) / averageProfit) * 100 : 0;

            return {
                ...journal,
                averageProfit,
                vsAverage,
                ranking
            };
        });
    }, [journals, initialBalances]);

    const safeFormat = (value: any, decimals: number = 2): string => {
        const num = Number(value) || 0;
        return num.toFixed(decimals);
    };

    const safeFormatCurrency = (value: any): string => {
        const num = Number(value) || 0;
        return num.toLocaleString();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-3">
                    <BarChart3 className="h-10 w-10" />
                    {t('navigation.statistics')}
                </h1>
                <p className="text-xl text-gray-300">
                    {t('statistics.subtitle')}
                </p>
            </div>

            {/* Tarjetas de Diarios - PRIMERO */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Award className="h-6 w-6 text-yellow-400" />
                    {t('statistics.byJournal')}
                </h2>

                <div className="flex flex-wrap justify-center gap-4">
                    {journalStats.map((journal, index) => (
                        <div key={journal.id} className={`w-60 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-1 hover:bg-gray-800/60 transform transition-all duration-600 ease-out ${visibleCards.includes(index + 4)
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-8'
                            }`}>
                            {/* Header */}
                            <div className="text-center mb-3">
                                <h3 className="text-lg font-bold text-yellow-400 flex items-center justify-center gap-1">
                                    {journal.name}
                                    {journal.isProfitable ? (
                                        <TrendingUp className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-400" />
                                    )}
                                </h3>
                            </div>

                            {/* Métricas */}
                            <div className="space-y-2 mb-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Balance</span>
                                    <span className="text-sm font-semibold text-white">
                                        ${safeFormatCurrency(journal.currentBalance)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Ganancia</span>
                                    <span className={`text-sm font-semibold ${journal.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {journal.totalProfit >= 0 ? '+' : ''}${safeFormatCurrency(journal.totalProfit)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Win Rate</span>
                                    <span className="text-sm font-semibold text-yellow-400">
                                        {safeFormat(journal.winRate, 1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Profit Factor</span>
                                    <span className="text-sm font-semibold text-blue-400">
                                        {journal.profitFactor === 999 ? '∞' : safeFormat(journal.profitFactor, 2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">vs Promedio</span>
                                    <span className={`text-sm font-semibold ${journal.vsAverage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {journal.vsAverage >= 0 ? '+' : ''}{safeFormat(journal.vsAverage, 1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Ranking</span>
                                    <span className="text-sm font-semibold text-purple-400">
                                        #{journal.ranking}
                                    </span>
                                </div>
                            </div>

                            {/* Mini gráfica de balance */}
                            <div className="h-12 bg-gray-700/30 rounded-lg p-2 mb-3">
                                <SimpleBalanceChart entries={journal.entries || []} initialBalance={initialBalances[journal.id] || 0} />
                            </div>

                            {/* Métricas adicionales */}
                            <div className="space-y-1 mb-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Mejor Op</span>
                                    <span className="text-xs font-semibold text-green-400">
                                        +${safeFormatCurrency(journal.bestOperationValue)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Última Op</span>
                                    <span className="text-xs font-semibold text-orange-400">
                                        {journal.daysSinceLast !== null ? `${journal.daysSinceLast}d` : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Tendencia</span>
                                    <span className="text-xs font-semibold text-cyan-400">
                                        {journal.trend}
                                    </span>
                                </div>
                            </div>

                            {/* Botón de rentable/no rentable centrado */}
                            <div className="flex justify-center">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${journal.isProfitable
                                    ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                                    : 'bg-red-900/30 text-red-400 border border-red-700/50'
                                    }`}>
                                    {journal.isProfitable ? t('statistics.profitable') : t('statistics.unprofitable')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gráfica de Progresión Consolidada */}
            <div className={`bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-1 hover:bg-gray-800/40 transform transition-all duration-600 ease-out ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
                }`}>
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Progresión Consolidada de Balance
                </h3>
                <ConsolidatedBalanceChart
                    journals={journals}
                    initialBalances={initialBalances}
                />
            </div>

            {/* Análisis Detallado */}
            <div className={`bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-1 hover:bg-gray-800/40 transform transition-all duration-600 ease-out ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
                }`}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <PieChart className="h-6 w-6 text-blue-400" />
                    {t('statistics.detailedAnalysis')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            +${safeFormatCurrency(globalStats.bestOperation)}
                        </div>
                        <div className="text-gray-400">{t('statistics.bestOperation')}</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-400 mb-2">
                            ${safeFormatCurrency(globalStats.worstOperation)}
                        </div>
                        <div className="text-gray-400">{t('statistics.worstOperation')}</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                            {safeFormat(globalStats.winRate, 1)}%
                        </div>
                        <div className="text-gray-400">{t('statistics.overallWinRate')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsNew;