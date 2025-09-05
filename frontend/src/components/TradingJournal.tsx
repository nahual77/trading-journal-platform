import React, { useState, useEffect, useMemo } from 'react';
import { useTradingJournalState } from '../hooks/useTradingJournalState';
import { JournalTabs } from './JournalTabs';
import { TradingTableWithFilters } from './TradingTableWithFilters';
import { TradingPlan } from './TradingPlan';
import { MT5Panel } from './MT5Panel';
import BalanceChart from './BalanceChart';
import { supabase } from '../supabaseClient';
import { 
  BookOpen, 
  Target, 
  Activity, 
  Download, 
  Upload,
  Menu,
  X
} from 'lucide-react';

type ActiveView = 'journals' | 'plan' | 'mt5';

interface TradingJournalProps {
  isNewUser?: boolean;
}

export default function TradingJournal({ isNewUser = false }: TradingJournalProps) {
  const [activeView, setActiveView] = useState<ActiveView>('journals');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Estados para calculadora independiente por diario
  const [initialBalances, setInitialBalances] = useState<{[key: string]: number}>({});
  
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
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    addCustomColumn,
    updateColumn,
    removeColumn,
    toggleColumn,
    addImageToEntry,
    removeImageFromEntry,
    updateTradingPlan,
    toggleChecklistItem,
    resetChecklist,
    updateMT5Config,
    exportData,
    handleExportJournalCSV,
    handleExportAllJournalsCSV,
  } = useTradingJournalState();

  // Debug: Verificar cuántas entradas hay en total
  useEffect(() => {
    if (appState?.journals) {
      const totalEntries = appState.journals.reduce((total, journal) => total + journal.entries.length, 0);
      console.log('🔍 Debug Total Entradas:', {
        totalJournals: appState.journals.length,
        totalEntries,
        activeJournalEntries: activeJournal?.entries?.length || 0,
        journalsBreakdown: appState.journals.map(j => ({
          name: j.name,
          entries: j.entries.length
        }))
      });
    }
  }, [appState, activeJournal]);





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

  // Actualizar balance específico del diario activo
  const updateInitialBalanceLocal = (value: number) => {
    console.log('🚀 updateInitialBalanceLocal llamada con valor:', value);
    console.log('💰 Actualizando saldo inicial:', { journalId: activeJournal?.id, value });
    
    setInitialBalances(prev => ({
      ...prev,
      [activeJournal?.id || '']: value
    }));
    
    // Solo guardar en localStorage (base de datos desactivada temporalmente)
    console.log('💾 Guardando en localStorage...');
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
    return activeJournal.entries.reduce((total, entry) => {
      const benefit = parseFloat(entry.beneficio) || 0;
      return total + benefit;
    }, 0);
  }, [activeJournal?.entries]);

  // Persistencia separada por diario
  useEffect(() => {
    const saved = localStorage.getItem('nagual_initial_balances');
    if (saved) {
      try {
        const parsedBalances = JSON.parse(saved);
        setInitialBalances(parsedBalances);
      } catch (error) {
        console.warn('Error parsing saved balances:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nagual_initial_balances', JSON.stringify(initialBalances));
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

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);



  // Verificar que tenemos un activeJournal válido
  if (!activeJournal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Cargando...</h2>
          <p className="text-gray-400">Inicializando tu diario de trading</p>
        </div>
      </div>
    );
  }

  // Función para manejar logout
  const handleLogout = () => {
    setUser(null);
  };

  const navigationItems = [
    {
      id: 'journals' as ActiveView,
      name: 'Diarios',
      icon: BookOpen,
      description: 'Gestionar operaciones de trading',
    },
    {
      id: 'plan' as ActiveView,
      name: 'Plan de Trading',
      icon: Target,
      description: 'Plan VOL 75 y checklist diario',
    },
    {
      id: 'mt5' as ActiveView,
      name: 'Conexión MT5',
      icon: Activity,
      description: 'Monitor de cuenta MT4/MT5',
    },
  ];

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
            />

            {/* Tabla de operaciones */}
            <div>
              {/* Header centrado con título y calculadora */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gold-300 mb-4">
                  Operaciones - {activeJournal.name}
                </h3>
                
                {/* Calculadora de Balance Centrada */}
                <div className="inline-block bg-gray-800 border border-gray-600 rounded-lg p-6 w-80">
                  <h4 className="text-xl font-semibold text-yellow-400 mb-2 flex items-center justify-center">
                    💰 Balance - {activeJournal.name}
                  </h4>
                  
                  <div className="space-y-2">
                    {/* Campo saldo inicial */}
                    <div className="flex justify-between items-center">
                      <span className="text-xl text-gray-400">Saldo inicial:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentInitialBalance || ''}
                        onChange={(e) => {
                          console.log('📝 Input onChange ejecutado:', e.target.value);
                          updateInitialBalanceLocal(parseFloat(e.target.value) || 0);
                        }}
                        className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xl text-right"
                        placeholder="0.00"
                      />
                    </div>
                    
                    {/* Total beneficios calculado */}
                    <div className="flex justify-between items-center">
                      <span className="text-xl text-gray-400">Total beneficios:</span>
                      <span className={`text-xl font-semibold ${totalBenefits >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalBenefits >= 0 ? '+' : ''}${totalBenefits.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Balance final */}
                    <div className="flex justify-between items-center border-t border-gray-600 pt-2">
                      <span className="text-xl font-semibold text-gray-200">Balance actual:</span>
                      <span className="text-xl font-bold text-yellow-400">
                        ${(currentInitialBalance + totalBenefits).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {(() => {
                console.log('🔍 TradingJournal Debug - Pasando entradas a TradingTableWithFilters:', {
                  activeJournalName: activeJournal?.name,
                  activeJournalEntries: activeJournal?.entries?.length || 0,
                  activeJournalEntriesArray: activeJournal?.entries?.map(e => ({ id: e.id, fecha: e.fecha, hora: e.hora })) || []
                });
                return null;
              })()}
              <TradingTableWithFilters
                entries={activeJournal.entries}
                columns={activeJournal.customColumns}
                onAddEntry={() => createTradeEntry(activeJournal.id)}
                onUpdateEntry={(entryId, updates) => updateTradeEntry(entryId, updates, activeJournal.id)}
                onDeleteEntry={(entryId) => deleteTradeEntry(entryId, activeJournal.id)}
                onAddImage={(entryId, image) => addImageToEntry(entryId, image, activeJournal.id)}
                onRemoveImage={(entryId, imageId) => removeImageFromEntry(entryId, imageId, activeJournal.id)}
                onUpdateColumn={(columnId, updates) => updateColumn(columnId, updates, activeJournal.id)}
                onAddColumn={(column) => addCustomColumn(column, activeJournal.id)}
                onRemoveColumn={(columnId) => removeColumn(columnId, activeJournal.id)}
                onToggleColumn={(columnId) => toggleColumn(columnId, activeJournal.id)}
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
          <TradingPlan
            tradingPlan={appState.tradingPlan}
            onToggleItem={toggleChecklistItem}
            onResetChecklist={resetChecklist}
            planPoints={planPoints}
            onAddPlanPoint={addPlanPoint}
            onUpdatePlanPoint={updatePlanPoint}
            onDeletePlanPoint={deletePlanPoint}
          />
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
                    onUpdateConfig={(config) => updateMT5Config(config, journal.id)}
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
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
          <div className="full-width-container">
            <div className="flex items-center justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-gold-400 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gold-400">
                  Nagual Trader Journal
                </h1>
              </div>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-xl font-medium transition-colors
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

            {/* Botones de acción */}
            <div className="flex items-center space-x-2">
              {/* Botón exportar diario actual CSV */}
              <button
                onClick={() => handleExportJournalCSV()}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xl"
                title={`Exportar ${activeJournal.name} a CSV`}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              
              {/* Botón exportar todos los diarios CSV */}
              <button
                onClick={handleExportAllJournalsCSV}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xl"
                title="Exportar todos los diarios a CSV"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Todo</span>
              </button>

              {/* Botón exportar JSON (backup completo) */}
              <button
                onClick={handleExportData}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-xl"
                title="Exportar backup completo JSON"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">JSON</span>
              </button>
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
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${activeView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xl text-gray-400">{item.description}</div>
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
            <div className="text-xl text-gray-400">
              © 2024 Nagual Trader Journal. Diseñado para traders profesionales.
            </div>
            <div className="flex items-center space-x-4 text-xl text-gray-500">
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
