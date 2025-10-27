import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTradingJournalState } from '../hooks/useTradingJournalState';
import { JournalTabs } from './JournalTabs';
import { TradingTableWithFilters } from './TradingTableWithFilters';
import { TradingPlan } from './TradingPlan';
import FlightPlanBoard from './FlightPlanBoard';
import StatisticsNew from './StatisticsNew';
import Backtesting from './Backtesting';
import { MT5Panel } from './MT5Panel';
import BalanceChart from './BalanceChart';
import LanguageSelector from './LanguageSelector';
import { UserMenu } from './UserMenu';
import { supabase } from '../supabaseClient';
import {
  BookOpen,
  Target,
  BarChart3,
  Activity,
  Menu,
  X,
  TestTube,
  Plane,
  RefreshCw
} from 'lucide-react';
import { ColumnDefinition } from '../types/trading';

type ActiveView = 'journals' | 'plan' | 'flightPlan' | 'statistics' | 'backtesting' | 'mt5';

interface TradingJournalProps {
  user: any;
}

export default function TradingJournal({ user }: TradingJournalProps) {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<ActiveView>('journals');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    appState,
    activeJournal,
    loading,
    createJournal,
    updateJournalName,
    deleteJournal,
    setActiveJournal,
    createTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    addImageToEntry,
    removeImageFromEntry,
    addCustomColumn,
    updateColumn,
    removeColumn,
    toggleColumn,
    updateTradingPlan,
    onAddPlanPoint,
    onUpdatePlanPoint,
    onDeletePlanPoint
  } = useTradingJournalState();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigationItems = [
    { id: 'journals' as ActiveView, name: t('navigation.tradingJournal'), icon: BookOpen, description: t('tradingJournal.subtitle') },
    { id: 'plan' as ActiveView, name: t('navigation.plan'), icon: Target, description: t('tradingJournal.planDescription') },
    { id: 'flightPlan' as ActiveView, name: 'Plan de Vuelo', icon: Plane, description: 'Tablero visual interactivo' },
    { id: 'statistics' as ActiveView, name: t('navigation.statistics'), icon: BarChart3, description: t('statistics.subtitle') },
    { id: 'backtesting' as ActiveView, name: t('navigation.backtesting'), icon: TestTube, description: t('backtesting.subtitle') },
    { id: 'mt5' as ActiveView, name: t('navigation.mt5'), icon: Activity, description: t('tradingJournal.mt5Description') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">{t('common.loadingData')}</h2>
          <p className="text-gray-400">{t('tradingJournal.loadingUserJournal')}</p>
        </div>
      </div>
    );
  }

  if (!activeJournal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center p-8">
            <BookOpen className="h-12 w-12 text-gold-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">{t('tradingJournal.welcome')}</h2>
            <p className="text-gray-400 mb-6">{t('tradingJournal.noJournals')}</p>
            <button
                onClick={() => createJournal(t('tradingJournal.defaultJournalName'))}
                className="btn-primary"
            >
                {t('tradingJournal.createFirstJournal')}
            </button>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'journals':
        return (
          <div className="space-y-6">
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
             <TradingTableWithFilters
                entries={activeJournal.entries}
                columns={activeJournal.customColumns || []}
                onAddEntry={createTradeEntry}
                onUpdateEntry={updateTradeEntry}
                onDeleteEntry={deleteTradeEntry}
                onAddImage={addImageToEntry}
                onRemoveImage={(imageId) => removeImageFromEntry(imageId)}
                onColumnsChange={(cols: ColumnDefinition[]) => { /* Esta lógica necesita ser reimplementada si es necesaria */ }}
                onToggleColumn={toggleColumn}
                onReorderColumns={(colId: string, dir: 'up' | 'down') => { /* Esta lógica necesita ser reimplementada */ }}
              />
            <BalanceChart
                entries={activeJournal.entries}
                initialBalance={0} // Placeholder
                journalName={activeJournal.name}
              />
          </div>
        );
      case 'plan':
        return (
          <div>
            <TradingPlan
              tradingPlan={appState.tradingPlan}
              onToggleItem={(itemId) => { /* adaptar */ }}
              onResetChecklist={() => { /* adaptar */ }}
              planPoints={appState.tradingPlan?.checklist?.map(item => item.text) || []}
              onAddPlanPoint={onAddPlanPoint}
              onUpdatePlanPoint={onUpdatePlanPoint}
              onDeletePlanPoint={onDeletePlanPoint}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="content-area">
         <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40 mobile-header">
          <div className="full-width-container">
            <div className="flex items-center h-20 relative mobile-header-content">
              <div className="absolute left-0 flex items-center space-x-4">
                <img src="/logo-growjou.png" alt="GrowJou" className="h-16 w-auto header-logo" />
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
                  {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
              <nav className="hidden lg:flex items-center justify-center space-x-1 w-full">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${activeView === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
              <div className="absolute right-0 flex items-center space-x-2 mobile-buttons-container">
                <LanguageSelector />
                {user && <UserMenu user={user} onLogout={handleLogout} />}
              </div>
            </div>
          </div>
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
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${activeView === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}>
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
        <main className="main-content">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}