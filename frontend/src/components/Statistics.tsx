import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    PieChart,
    Target,
    Calendar,
    Activity,
    Award,
    AlertTriangle
} from 'lucide-react';

interface StatisticsProps {
    journals: any[];
    activeJournalId: string | null;
}

// Componente para el gráfico de balance en miniatura
const MiniBalanceChart = ({ entries, initialBalance, width = 200, height = 60 }: {
    entries: any[],
    initialBalance: number,
    width?: number,
    height?: number
}) => {
    const balanceData = useMemo(() => {
        const safeInitialBalance = initialBalance || 0;
        if (!entries || entries.length === 0) return [{ x: 0, y: safeInitialBalance }];

        let currentBalance = safeInitialBalance;
        return entries.map((entry, index) => {
            currentBalance += entry.beneficio || 0;
            return {
                x: index,
                y: currentBalance
            };
        });
    }, [entries, initialBalance]);

    const safeInitialBalance = initialBalance || 0;
    const maxBalance = Math.max(...balanceData.map(d => d.y), safeInitialBalance);
    const minBalance = Math.min(...balanceData.map(d => d.y), safeInitialBalance);
    const range = maxBalance - minBalance || 1;

    const getX = (index: number) => (index / Math.max(1, balanceData.length - 1)) * width;
    const getY = (balance: number) => height - ((balance - minBalance) / range) * height;

    return (
        <div className="w-full h-16 bg-gray-700/30 rounded-lg p-2">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                {/* Línea de balance inicial */}
                <line
                    x1={0}
                    y1={getY(safeInitialBalance)}
                    x2={width}
                    y2={getY(safeInitialBalance)}
                    stroke="rgba(156, 163, 175, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                />

                {/* Línea de progresión */}
                {balanceData.length > 1 && (
                    <polyline
                        points={balanceData.map((point, index) =>
                            `${getX(index)},${getY(point.y)}`
                        ).join(' ')}
                        fill="none"
                        stroke={balanceData[balanceData.length - 1].y >= safeInitialBalance ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                    />
                )}

                {/* Puntos de datos */}
                {balanceData.map((point, index) => (
                    <circle
                        key={index}
                        cx={getX(index)}
                        cy={getY(point.y)}
                        r="2"
                        fill={point.y >= safeInitialBalance ? "#10b981" : "#ef4444"}
                    />
                ))}
            </svg>
        </div>
    );
};

export default function Statistics({ journals, activeJournalId }: StatisticsProps) {
    const { t } = useTranslation();

    // Calcular estadísticas globales
    const globalStats = useMemo(() => {
        if (!journals || !Array.isArray(journals)) {
            return {
                totalOperations: 0,
                winningOperations: 0,
                losingOperations: 0,
                winRate: 0,
                totalProfit: 0,
                initialBalance: 0,
                currentBalance: 0,
                bestOperation: 0,
                worstOperation: 0,
                averageProfit: 0
            };
        }

        const allEntries = journals.flatMap(journal => journal.entries || []);
        const totalOperations = allEntries.length;
        const winningOperations = allEntries.filter(entry => entry.beneficio && entry.beneficio > 0).length;
        const losingOperations = allEntries.filter(entry => entry.beneficio && entry.beneficio < 0).length;
        const winRate = totalOperations > 0 ? (winningOperations / totalOperations) * 100 : 0;

        const totalProfit = allEntries.reduce((sum, entry) => sum + (entry.beneficio || 0), 0);
        const initialBalance = journals.reduce((sum, journal) => sum + (journal.initialBalance || 0), 0);
        const currentBalance = initialBalance + totalProfit;

        const bestOperation = allEntries.reduce((best, entry) =>
            (entry.beneficio || 0) > (best.beneficio || 0) ? entry : best,
            { beneficio: 0 }
        );

        const worstOperation = allEntries.reduce((worst, entry) =>
            (entry.beneficio || 0) < (worst.beneficio || 0) ? entry : worst,
            { beneficio: 0 }
        );

        return {
            totalOperations,
            winningOperations,
            losingOperations,
            winRate,
            totalProfit,
            initialBalance,
            currentBalance,
            bestOperation: bestOperation.beneficio || 0,
            worstOperation: worstOperation.beneficio || 0,
            averageProfit: totalOperations > 0 ? totalProfit / totalOperations : 0
        };
    }, [journals]);

    // Calcular estadísticas por diario
    const journalStats = useMemo(() => {
        if (!journals || !Array.isArray(journals)) {
            return [];
        }

        return journals.map(journal => {
            const entries = journal.entries || [];
            const totalOps = entries.length;
            const winningOps = entries.filter(entry => entry.beneficio && entry.beneficio > 0).length;
            const losingOps = entries.filter(entry => entry.beneficio && entry.beneficio < 0).length;
            const winRate = totalOps > 0 ? (winningOps / totalOps) * 100 : 0;

            const totalProfit = entries.reduce((sum, entry) => sum + (entry.beneficio || 0), 0);
            const initialBalance = journal.initialBalance || 0;
            const currentBalance = initialBalance + totalProfit;
            const performance = initialBalance > 0 ? (totalProfit / initialBalance) * 100 : 0;
            const averageProfit = totalOps > 0 ? totalProfit / totalOps : 0;

            const bestOperation = entries.reduce((best, entry) =>
                (entry.beneficio || 0) > (best.beneficio || 0) ? entry : best,
                { beneficio: 0 }
            );

            const worstOperation = entries.reduce((worst, entry) =>
                (entry.beneficio || 0) < (worst.beneficio || 0) ? entry : worst,
                { beneficio: 0 }
            );

            return {
                ...journal,
                totalOps,
                winningOps,
                losingOps,
                winRate,
                totalProfit,
                initialBalance,
                currentBalance,
                performance,
                averageProfit,
                bestOperation: bestOperation.beneficio || 0,
                worstOperation: worstOperation.beneficio || 0,
                isProfitable: totalProfit > 0
            };
        });
    }, [journals]);

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

            {/* Métricas Globales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border border-blue-700/30">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="h-8 w-8 text-blue-400" />
                        <span className="text-sm text-gray-400">{t('statistics.totalBalance')}</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        ${(globalStats.currentBalance || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('statistics.initial')}: ${(globalStats.initialBalance || 0).toLocaleString()}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-6 border border-green-700/30">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="h-8 w-8 text-green-400" />
                        <span className="text-sm text-gray-400">{t('statistics.totalProfit')}</span>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${globalStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {globalStats.totalProfit >= 0 ? '+' : ''}${(globalStats.totalProfit || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('statistics.averagePerOp')}: ${(globalStats.averageProfit || 0).toFixed(2)}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-700/30">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="h-8 w-8 text-purple-400" />
                        <span className="text-sm text-gray-400">{t('statistics.totalOperations')}</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {globalStats.totalOperations}
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('statistics.winning')}: {globalStats.winningOperations} | {t('statistics.losing')}: {globalStats.losingOperations}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/30">
                    <div className="flex items-center justify-between mb-4">
                        <Target className="h-8 w-8 text-yellow-400" />
                        <span className="text-sm text-gray-400">{t('statistics.winRate')}</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {(globalStats.winRate || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('statistics.successRate')}
                    </div>
                </div>
            </div>

            {/* Tarjetas de Diarios Verticales Delgadas */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Award className="h-6 w-6 text-yellow-400" />
                    {t('statistics.byJournal')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {journalStats.map((journal) => (
                        <div key={journal.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                            {/* Header con nombre y estado */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                                    {journal.name}
                                    {journal.isProfitable ? (
                                        <TrendingUp className="h-3 w-3 text-green-400" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-400" />
                                    )}
                                </h3>
                                <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${journal.isProfitable
                                    ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                                    : 'bg-red-900/30 text-red-400 border border-red-700/50'
                                    }`}>
                                    {journal.isProfitable ? t('statistics.profitable') : t('statistics.unprofitable')}
                                </div>
                            </div>

                            {/* Métricas principales compactas */}
                            <div className="space-y-2 mb-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{t('statistics.currentBalance')}</span>
                                    <span className="text-sm font-semibold text-white">
                                        ${(journal.currentBalance || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{t('statistics.profitLoss')}</span>
                                    <span className={`text-sm font-semibold ${journal.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {journal.totalProfit >= 0 ? '+' : ''}${(journal.totalProfit || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{t('statistics.operations')}</span>
                                    <span className="text-xs font-medium text-white">
                                        {journal.totalOps}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{t('statistics.winRate')}</span>
                                    <span className="text-xs font-medium text-white">
                                        {(journal.winRate || 0).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Gráfico de balance compacto */}
                            <div className="mb-3">
                                <div className="text-xs text-gray-400 mb-1">{t('statistics.balanceProgression')}</div>
                                <MiniBalanceChart
                                    entries={journal.entries || []}
                                    initialBalance={journal.initialBalance}
                                    width={160}
                                    height={40}
                                />
                            </div>

                            {/* Métricas adicionales compactas */}
                            <div className="space-y-1 mb-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{t('statistics.averagePerOp')}</span>
                                    <span className="text-xs font-medium text-white">
                                        ${(journal.averageProfit || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{t('statistics.bestOperation')}</span>
                                    <span className="text-xs font-medium text-green-400">
                                        +${(journal.bestOperation || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{t('statistics.worstOperation')}</span>
                                    <span className="text-xs font-medium text-red-400">
                                        ${(journal.worstOperation || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Footer con rendimiento */}
                            <div className="pt-2 border-t border-gray-700/50">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">{t('statistics.performance')}</span>
                                    <span className={`font-medium ${journal.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {journal.performance >= 0 ? '+' : ''}{(journal.performance || 0).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Análisis Detallado */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <PieChart className="h-6 w-6 text-blue-400" />
                    {t('statistics.detailedAnalysis')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            +${(globalStats.bestOperation || 0).toLocaleString()}
                        </div>
                        <div className="text-gray-400">{t('statistics.bestOperation')}</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-400 mb-2">
                            ${(globalStats.worstOperation || 0).toLocaleString()}
                        </div>
                        <div className="text-gray-400">{t('statistics.worstOperation')}</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                            {(globalStats.winRate || 0).toFixed(1)}%
                        </div>
                        <div className="text-gray-400">{t('statistics.overallWinRate')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
