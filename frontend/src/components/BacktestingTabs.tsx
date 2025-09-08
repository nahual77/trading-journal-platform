import React, { useState } from 'react';
import { BacktestingJournal } from './BacktestingTable';
import { Plus, Edit3, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DownloadBacktestingDropdown from './DownloadBacktestingDropdown';

interface BacktestingTabsProps {
  backtestingJournals: BacktestingJournal[];
  activeBacktestingId: string;
  onSelectBacktesting: (id: string) => void;
  onCreateBacktesting: (name: string) => void;
  onUpdateBacktestingName: (id: string, name: string) => void;
  onDeleteBacktesting: (id: string) => void;
  onExportBacktestingCSV?: () => void;
  onExportAllBacktestingCSV?: () => void;
  onExportBacktestingData?: () => void;
}

export function BacktestingTabs({
  backtestingJournals,
  activeBacktestingId,
  onSelectBacktesting,
  onCreateBacktesting,
  onUpdateBacktestingName,
  onDeleteBacktesting,
  onExportBacktestingCSV,
  onExportAllBacktestingCSV,
  onExportBacktestingData,
}: BacktestingTabsProps) {
  const { t } = useTranslation();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBacktestingName, setNewBacktestingName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [backtestingToDelete, setBacktestingToDelete] = useState<string | null>(null);

  const startEditing = (backtesting: BacktestingJournal) => {
    setEditingTabId(backtesting.id);
    setEditingName(backtesting.name);
  };

  const saveEdit = () => {
    if (editingTabId && editingName.trim()) {
      onUpdateBacktestingName(editingTabId, editingName.trim());
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingTabId(null);
    setEditingName('');
  };

  const handleCreateBacktesting = () => {
    if (newBacktestingName.trim()) {
      onCreateBacktesting(newBacktestingName.trim());
      setNewBacktestingName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteBacktesting = (backtestingId: string) => {
    console.log('🗑️ Botón eliminar clickeado para backtesting:', backtestingId);
    
    if (backtestingJournals.length <= 1) {
      alert('No puedes eliminar el último backtesting');
      return;
    }
    
    setBacktestingToDelete(backtestingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (backtestingToDelete) {
      console.log('✅ Confirmado, eliminando backtesting:', backtestingToDelete);
      onDeleteBacktesting(backtestingToDelete);
      setShowDeleteModal(false);
      setBacktestingToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('❌ Eliminación cancelada por el usuario');
    setShowDeleteModal(false);
    setBacktestingToDelete(null);
  };

  return (
    <div className="border-b border-gray-700 overflow-visible">
      <div className="flex items-end justify-between pt-2 overflow-visible">
        {/* Contenedor de pestañas con scroll */}
        <div className="flex items-end overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 flex-1 overflow-y-visible">
          {/* Pestañas de backtesting */}
          <div className="flex space-x-1 px-4">
            {backtestingJournals.map((backtesting) => {
            const isActive = backtesting.id === activeBacktestingId;
            const isEditing = editingTabId === backtesting.id;
            
            return (
              <div
                key={backtesting.id}
                className={`
                  relative group flex items-center min-w-0 rounded-t-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gray-800 border-t border-l border-r border-gray-600' 
                    : 'bg-gray-900/50 hover:bg-gray-800/70'
                  }
                `}
              >
                {isEditing ? (
                  /* Modo edición */
                  <div className="flex items-center px-3 py-2 space-x-2 min-w-[150px]">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      onBlur={saveEdit}
                      className="flex-1 bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  /* Modo visualización */
                  <div className="flex items-center min-w-0">
                    <button
                      onClick={() => onSelectBacktesting(backtesting.id)}
                      className={`
                        px-4 py-3 text-sm font-medium transition-colors truncate max-w-[200px] flex items-center space-x-2
                        ${isActive 
                          ? 'text-gold-300' 
                          : 'text-gray-300 hover:text-white'
                        }
                      `}
                    >
                      <span className="truncate">{backtesting.name}</span>
                      {/* Indicador de entradas */}
                      {backtesting.entries.length > 0 && (
                        <div className="bg-blue-800/80 text-blue-200 text-xs rounded-md px-2 py-1 flex items-center justify-center font-medium shadow-lg border border-blue-600/30 backdrop-blur-sm">
                          {backtesting.entries.length}
                        </div>
                      )}
                    </button>
                    
                    {/* Botones de acción (visibles al hover) */}
                    <div className="flex items-center space-x-1 px-2 opacity-30 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(backtesting);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Editar nombre"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      
                      {backtestingJournals.length > 1 && (
                        <button
                          onClick={(e) => {
                            console.log('🖱️ Botón eliminar clickeado para backtesting:', backtesting.id);
                            e.stopPropagation();
                            handleDeleteBacktesting(backtesting.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Eliminar backtesting"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

          {/* Botón para agregar nuevo backtesting */}
          <div className="flex-shrink-0 pl-1 pr-2 my-2">
            {showCreateForm ? (
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
                <input
                  type="text"
                  placeholder="Nombre del backtesting"
                  value={newBacktestingName}
                  onChange={(e) => setNewBacktestingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateBacktesting();
                    if (e.key === 'Escape') {
                      setShowCreateForm(false);
                      setNewBacktestingName('');
                    }
                  }}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[150px]"
                  autoFocus
                />
                <button
                  onClick={handleCreateBacktesting}
                  disabled={!newBacktestingName.trim()}
                  className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewBacktestingName('');
                  }}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600/10 border border-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600/20 hover:border-blue-600/50 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>{t('backtesting.newTest')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Botón de descarga */}
        {onExportBacktestingCSV && onExportAllBacktestingCSV && onExportBacktestingData && (
          <div className="flex-shrink-0 px-2 my-2">
            <DownloadBacktestingDropdown
              onExportBacktestingCSV={onExportBacktestingCSV}
              onExportAllBacktestingCSV={onExportAllBacktestingCSV}
              onExportBacktestingData={onExportBacktestingData}
              activeBacktestingName={backtestingJournals.find(j => j.id === activeBacktestingId)?.name || 'Backtesting'}
            />
          </div>
        )}
      </div>

      {/* Información del backtesting activo */}
      <div className="px-4 py-2 bg-gray-800/30 border-t border-gray-700">
        {(() => {
          const activeBacktesting = backtestingJournals.find(j => j.id === activeBacktestingId);
          if (!activeBacktesting) return null;
          
          const totalTests = activeBacktesting.entries.length;
          const profitableTests = activeBacktesting.entries.filter(e => e.isProfitable === true).length;
          const withCharts = activeBacktesting.entries.filter(e => e.chart && e.chart.length > 0).length;
          
          return (
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <span>{t('backtesting.tests')}: <span className="text-white font-medium">{totalTests}</span></span>
                <span>{t('backtesting.profitable')}: <span className="text-green-400 font-medium">{profitableTests}</span></span>
                <span>{t('backtesting.withCharts')}: <span className="text-blue-400 font-medium">{withCharts}</span></span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>{t('backtesting.title')}: {activeBacktesting.name}</span>
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && backtestingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-red-500 rounded-lg p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h3 className="text-xl font-bold text-white">
                ⚠️ ADVERTENCIA: ELIMINACIÓN PERMANENTE
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-3">
                Se va a eliminar el backtesting <strong className="text-white">
                  "{backtestingJournals.find(j => j.id === backtestingToDelete)?.name || 'este backtesting'}"
                </strong>
              </p>
              
              <div className="bg-red-900/30 border border-red-500/50 rounded p-3 mb-4">
                <p className="text-red-200 text-sm font-medium">
                  🚨 ESTA ACCIÓN NO SE PUEDE DESHACER
                </p>
                <p className="text-red-200 text-sm font-medium">
                  🚨 SE PERDERÁ TODA LA INFORMACIÓN PERMANENTEMENTE
                </p>
                <p className="text-red-200 text-sm font-medium">
                  🚨 NO HAY FORMA DE RECUPERAR LOS DATOS
                </p>
              </div>
              
              <p className="text-gray-300 text-sm">
                ¿CONFIRMAS que quieres eliminar este backtesting?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
              >
                ELIMINAR PERMANENTEMENTE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}