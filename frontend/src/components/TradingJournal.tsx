import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTradingJournalWithColumns } from '../hooks/useTradingJournalWithColumns';
import { JournalTabs } from './JournalTabs';
import { TradingTableWithFilters } from './TradingTableWithFilters';
import { TradingPlan } from './TradingPlan';
import FlightPlanBoard from './FlightPlanBoard';
import StatisticsNew from './StatisticsNew';
import Backtesting from './Backtesting';
import { MT5Panel } from './MT5Panel';
import BalanceChart from './BalanceChart';
import LanguageSelector from './LanguageSelector';
import DownloadDropdown from './DownloadDropdown';
import { UserMenu } from './UserMenu';
import { BackendConnection } from './BackendConnection';
import { supabase } from '../supabaseClient';
import {
  BookOpen,
  Target,
  BarChart3,
  Activity,
  Download,
  Upload,
  Menu,
  X,
  TestTube,
  Plane
} from 'lucide-react';

type ActiveView = 'journals' | 'plan' | 'flightPlan' | 'statistics' | 'backtesting' | 'mt5';

interface TradingJournalProps {
  isNewUser?: boolean;
  user: any;
}

export default function TradingJournal({ isNewUser = false, user }: TradingJournalProps) {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<ActiveView>('journals');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados para calculadora independiente por diario
  const [initialBalances, setInitialBalances] = useState<{ [key: string]: number }>({});

  // Estado para puntos editables del plan de trading
  const [planPoints, setPlanPoints] = useState<string[]>([
    "Operar únicamente los días que mi estrategia marque setups",
    "No operar en días de alta volatilidad (NFP, decisiones del banco central)",
    "Mantener un riesgo máximo del 2% por operación",
    "Usar stop loss en todas las operaciones",
    "No agregar posiciones a operaciones perdedoras",
    "Revisar el plan de trading cada domingo",
    "Mantener un diario de trading actualizado",
    "No operar bajo emociones fuertes (estrés, euforia)"
  ]);

  const {
    appState,
    activeJournal,
    columns,
    visibleColumns,
    columnsLoading,
    columnsError,
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    addImageToEntry,
    removeImageFromEntry,
    updateTradingPlan,
    toggleChecklistItem,
    resetChecklist,
    updateMT5Config,
    exportData,
    handleExportJournalCSV,
    handleExportAllJournalsCSV,
    handleColumnsChange,
    handleToggleColumn,
  } = useTradingJournalWithColumns();






  // Resetear estado para usuarios nuevos
  useEffect(() => {
    if (isNewUser) {
      // Limpiar el localStorage para que use el estado inicial de usuario nuevo
      localStorage.removeItem('nagual-trader-journal-state');
      // Recargar la página para aplicar el nuevo estado
      window.location.reload();
    }
  }, [isNewUser]);

  const handleExportData = () => {
    exportData();
  };

  // Obtener balance del diario activo (solo localStorage)
  const currentInitialBalance = activeJournal ?
    (initialBalances[activeJournal.id] || 0) : 0;

  // Debug: verificar balance actual
  console.log('🔍 Balance actual del diario:', {
    activeJournalId: activeJournal?.id,
    initialBalances,
    currentInitialBalance,
    localStorageCheck: localStorage.getItem('nagual_initial_balances')
  });

  // Actualizar balance específico del diario activo
  const updateInitialBalanceLocal = (value: number) => {
    console.log('🚀 updateInitialBalanceLocal llamada con valor:', value);
    console.log('💰 Actualizando saldo inicial:', { journalId: activeJournal?.id, value });

    if (!activeJournal?.id) {
      console.error('❌ No hay journal activo, no se puede actualizar balance');
      return;
    }

    const newBalances = {
      ...initialBalances,
      [activeJournal.id]: value
    };

    console.log('📊 Nuevos balances:', newBalances);
    setInitialBalances(newBalances);

    // Guardar inmediatamente en localStorage
    console.log('💾 Guardando inmediatamente en localStorage...');
    localStorage.setItem('nagual_initial_balances', JSON.stringify(newBalances));

    // Verificar que se guardó correctamente
    const saved = localStorage.getItem('nagual_initial_balances');
    console.log('✅ Verificación de guardado:', saved);
  };

  // Funciones para manejar puntos del plan de trading
  const addPlanPoint = () => {
    setPlanPoints([...planPoints, ""]);
  };

  const updatePlanPoint = (index: number, value: string) => {
    const newPoints = [...planPoints];
    newPoints[index] = value;
    setPlanPoints(newPoints);
  };

  const deletePlanPoint = (index: number) => {
    const newPoints = planPoints.filter((_, i) => i !== index);
    setPlanPoints(newPoints);
  };

  // Calcular total de beneficios del diario activo
  const totalBenefits = useMemo(() => {
    if (!activeJournal) return 0;
    const benefits = activeJournal.entries.reduce((total, entry) => {
      const benefit = parseFloat(entry.beneficio) || 0;
      return total + benefit;
    }, 0);
    console.log('💰 Cálculo de beneficios:', {
      entries: activeJournal.entries.length,
      benefits,
      entriesData: activeJournal.entries.map(e => ({ beneficio: e.beneficio }))
    });
    return benefits;
  }, [activeJournal?.entries]);

  // Persistencia separada por diario
  useEffect(() => {
    const loadInitialBalances = () => {
      try {
        const saved = localStorage.getItem('nagual_initial_balances');
        console.log('🔍 Cargando balances desde localStorage:', saved);

        if (saved && saved !== 'null' && saved !== 'undefined') {
          const parsedBalances = JSON.parse(saved);
          console.log('✅ Balances parseados:', parsedBalances);

          // Verificar que sea un objeto válido
          if (typeof parsedBalances === 'object' && parsedBalances !== null) {
            setInitialBalances(parsedBalances);
            console.log('✅ Balances cargados exitosamente');
          } else {
            console.warn('⚠️ Datos inválidos, inicializando con objeto vacío');
            setInitialBalances({});
          }
        } else {
          console.log('📝 No hay balances guardados, inicializando con objeto vacío');
          setInitialBalances({});
        }
      } catch (error) {
        console.error('❌ Error cargando balances:', error);
        setInitialBalances({});
      }
    };

    // Cargar inmediatamente
    loadInitialBalances();
  }, []);

  useEffect(() => {
    // Solo guardar si hay balances válidos
    if (Object.keys(initialBalances).length > 0) {
      console.log('💾 Guardando balances en localStorage:', initialBalances);
      localStorage.setItem('nagual_initial_balances', JSON.stringify(initialBalances));

      // Verificar que se guardó correctamente
      const saved = localStorage.getItem('nagual_initial_balances');
      console.log('✅ Verificación de guardado automático:', saved);
    }
  }, [initialBalances]);

  // Persistencia para puntos del plan de trading
  useEffect(() => {
    const saved = localStorage.getItem('nagual_plan_points');
    if (saved) {
      try {
        const parsedPoints = JSON.parse(saved);
        setPlanPoints(parsedPoints);
      } catch (error) {
        console.warn('Error loading plan points:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nagual_plan_points', JSON.stringify(planPoints));
  }, [planPoints]);

  // El estado del usuario se maneja en App.tsx, no necesitamos duplicarlo aquí



  // Verificar que tenemos un activeJournal válido
  if (!activeJournal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">{t('common.loading')}</h2>
          <p className="text-gray-400">{t('tradingJournal.subtitle')}</p>
        </div>
      </div>
    );
  }

  // Función para manejar logout
  const handleLogout = async () => {
    console.log('🔄 TradingJournal: Iniciando logout...');
    try {
      console.log('🔄 TradingJournal: Llamando a supabase.auth.signOut()...');
      const result = await supabase.auth.signOut();
      console.log('🔄 TradingJournal: Resultado de signOut:', result);
      // El estado del usuario se maneja en App.tsx a través de onAuthStateChange
    } catch (error) {
      console.error('❌ TradingJournal: Error al cerrar sesión:', error);
    }
  };

  const navigationItems = [
    {
      id: 'journals' as ActiveView,
      name: t('navigation.tradingJournal'),
      icon: BookOpen,
      description: t('tradingJournal.subtitle'),
    },
    {
      id: 'plan' as ActiveView,
      name: t('navigation.plan'),
      icon: Target,
      description: t('tradingJournal.planDescription'),
    },
    {
      id: 'flightPlan' as ActiveView,
      name: 'Plan de Vuelo',
      icon: Plane,
      description: 'Tablero visual interactivo para estrategias de trading',
    },
    {
      id: 'statistics' as ActiveView,
      name: t('navigation.statistics'),
      icon: BarChart3,
      description: t('statistics.subtitle'),
    },
    {
      id: 'backtesting' as ActiveView,
      name: t('navigation.backtesting'),
      icon: TestTube,
      description: t('backtesting.subtitle'),
    },
    {
      id: 'mt5' as ActiveView,
      name: t('navigation.mt5'),
      icon: Activity,
      description: t('tradingJournal.mt5Description'),
    },
  ];

  // Función simple para cambiar de vista
  const handleViewChange = (viewId: ActiveView) => {
    setActiveView(viewId);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'journals':
        return (
          <div className="space-y-6">
            {/* Pestañas de diarios */}
            <JournalTabs
              journals={appState.journals}
              activeJournalId={appState.activeJournalId}
              onSelectJournal={setActiveJournal}
              onCreateJournal={createJournal}
              onUpdateJournalName={updateJournalName}
              onDeleteJournal={deleteJournal}
              user={user}
              onLogout={handleLogout}
              onExportJournalCSV={() => handleExportJournalCSV(activeJournal.id)}
              onExportAllJournalsCSV={handleExportAllJournalsCSV}
              onExportData={handleExportData}
            />

            {/* Tabla de operaciones */}
            <div>
              {/* Header centrado con título y calculadora */}
              <div className="text-center mb-4">
                <h3 className="text-base font-semibold text-gold-300 mb-4">
                  {t('tradingJournal.operations')} - {activeJournal.name}
                </h3>

                {/* Calculadora de Balance Centrada */}
                <div className="inline-block bg-gray-800 border border-gray-600 rounded-lg p-6 w-80">
                  <h4 className="text-base font-semibold text-yellow-400 mb-2 flex items-center justify-center">
                    💰 {t('tradingJournal.balance')} - {activeJournal.name}
                  </h4>

                  <div className="space-y-2">
                    {/* Campo saldo inicial */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('tradingJournal.initialBalance')}:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentInitialBalance || ''}
                        onChange={(e) => {
                          console.log('📝 Input onChange ejecutado:', e.target.value);
                          updateInitialBalanceLocal(parseFloat(e.target.value) || 0);
                        }}
                        className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm text-right"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Total beneficios calculado */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('tradingJournal.profit')}:</span>
                      <span className={`text-sm font-semibold ${totalBenefits >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalBenefits >= 0 ? '+' : ''}${totalBenefits.toFixed(2)}
                      </span>
                    </div>

                    {/* Balance final */}
                    <div className="flex justify-between items-center border-t border-gray-600 pt-2">
                      <span className="text-sm font-semibold text-gray-200">{t('tradingJournal.currentBalance')}:</span>
                      <span className="text-sm font-bold text-yellow-400">
                        ${(currentInitialBalance + totalBenefits).toFixed(2)}
                      </span>
                    </div>
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mt-1">
                      {t('tradingJournal.initialBalance')}: ${currentInitialBalance.toFixed(2)} + {t('tradingJournal.profit')}: ${totalBenefits.toFixed(2)} = ${(currentInitialBalance + totalBenefits).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <TradingTableWithFilters
                entries={activeJournal.entries}
                columns={activeJournal.customColumns || columns}
                onAddEntry={() => createTradeEntry(activeJournal.id, {})}
                onUpdateEntry={(entryId, updates) => updateTradeEntry(entryId, updates)}
                onDeleteEntry={(entryId) => deleteTradeEntry(entryId)}
                onAddImage={(entryId, image) => addImageToEntry(entryId, image)}
                onRemoveImage={(entryId, imageId) => removeImageFromEntry(entryId, imageId)}
                onColumnsChange={handleColumnsChange}
                onToggleColumn={handleToggleColumn}
                onReorderColumns={(columnId, direction) => reorderColumns(columnId, direction)}
              />

              {/* Gráfico de Progresión de Balance */}
              <BalanceChart
                entries={activeJournal.entries}
                initialBalance={currentInitialBalance}
                journalName={activeJournal.name}
              />
            </div>
          </div>
        );

      case 'plan':
        return (
          <div>
            <TradingPlan
              tradingPlan={appState.tradingPlan}
              onToggleItem={toggleChecklistItem}
              onResetChecklist={resetChecklist}
              planPoints={planPoints}
              onAddPlanPoint={addPlanPoint}
              onUpdatePlanPoint={updatePlanPoint}
              onDeletePlanPoint={(index) => deletePlanPoint(index.toString())}
            />
          </div>
        );

      case 'flightPlan':
        return (
          <div className="h-full">
            <FlightPlanBoard />
          </div>
        );

      case 'statistics':
        return (
          <div>
            <StatisticsNew
              journals={appState.journals}
              activeJournalId={appState.activeJournalId}
              initialBalances={initialBalances}
            />
          </div>
        );

      case 'backtesting':
        return (
          <div>
            <Backtesting />
          </div>
        );

      case 'mt5':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gold-300 mb-2">Gestión de Conexiones MT5</h2>
              <p className="text-gray-400">
                Configura y monitorea las conexiones MT4/MT5 para todos tus diarios
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {appState.journals.map((journal) => (
                <div key={journal.id} className="space-y-3">
                  <h3 className="text-lg font-medium text-white">{journal.name}</h3>
                  <MT5Panel
                    mt5Config={journal.mt5Config}
                    onUpdateConfig={(config) => updateMT5Config(journal.id, config)}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="content-area">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40 mobile-header">
          <div className="full-width-container">
            <div className="flex items-center h-20 relative mobile-header-content">
              {/* Logo y título - Posición absoluta a la izquierda */}
              <div className="absolute left-0 flex items-center space-x-4">
                {/* Logo GrowJou */}
                <img
                  src="/logo-growjou.png"
                  alt="GrowJou - My Trading Journal"
                  className="h-16 w-auto header-logo"
                />
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors hamburger-button-mobile"
                >
                  {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>

              {/* Navegación desktop - Centrada absolutamente */}
              <nav className="hidden lg:flex items-center justify-center space-x-1 w-full">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                    ${activeView === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }
                  `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>

              {/* Botones de acción - Posición absoluta a la derecha */}
              <div className="absolute right-0 flex items-center space-x-2 mobile-buttons-container">
                {/* Selector de idioma */}
                <LanguageSelector />
                {/* Menú de usuario */}
                {user && (
                  <UserMenu user={user} onLogout={handleLogout} />
                )}
              </div>
            </div>
          </div>

          {/* Navegación móvil */}
          {sidebarOpen && (
            <div className="lg:hidden bg-gray-800 border-t border-gray-700">
              <nav className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleViewChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left
                    ${activeView === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }
                  `}
                  >
                    <item.icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-400">{item.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </header>

        {/* Contenido principal */}
        <main className="main-content">
          {renderActiveView()}
        </main>
      </div>

      {/* Footer */}
      <footer className="footer bg-gray-900/50 border-t border-gray-700 mt-4">
        <div className="full-width-container py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              © 2024 GrowJou. Diseñado para traders profesionales.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Versión 1.0</span>
              <span>•</span>
              <span>Última sincronización: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
