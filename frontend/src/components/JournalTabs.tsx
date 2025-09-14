import React, { useState } from 'react';
import { TradingJournal } from '../types/trading';
import { Plus, Edit3, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserMenu } from './UserMenu';
import DownloadDropdown from './DownloadDropdown';

interface JournalTabsProps {
  journals: TradingJournal[];
  activeJournalId: string;
  onSelectJournal: (journalId: string) => void;
  onCreateJournal: (name: string) => void;
  onUpdateJournalName: (journalId: string, name: string) => void;
  onDeleteJournal: (journalId: string) => void;
  user?: any;
  onLogout?: () => void;
  onExportJournalCSV?: () => void;
  onExportAllJournalsCSV?: () => void;
  onExportData?: () => void;
}

export function JournalTabs({
  journals,
  activeJournalId,
  onSelectJournal,
  onCreateJournal,
  onUpdateJournalName,
  onDeleteJournal,
  user,
  onLogout,
  onExportJournalCSV,
  onExportAllJournalsCSV,
  onExportData,
}: JournalTabsProps) {
  const { t } = useTranslation();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<string | null>(null);

  const startEditing = (journal: TradingJournal) => {
    setEditingTabId(journal.id);
    setEditingName(journal.name);
  };

  const saveEdit = () => {
    if (editingTabId && editingName.trim()) {
      onUpdateJournalName(editingTabId, editingName.trim());
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingTabId(null);
    setEditingName('');
  };

  const handleCreateJournal = () => {
    if (newJournalName.trim()) {
      onCreateJournal(newJournalName.trim());
      setNewJournalName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteJournal = (journalId: string) => {
    console.log('🗑️ Botón eliminar clickeado para diario:', journalId);
    
    if (journals.length <= 1) {
      alert('No puedes eliminar el último diario');
      return;
    }
    
    setJournalToDelete(journalId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (journalToDelete) {
      console.log('✅ Confirmado, eliminando diario:', journalToDelete);
      onDeleteJournal(journalToDelete);
      setShowDeleteModal(false);
      setJournalToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('❌ Eliminación cancelada por el usuario');
    setShowDeleteModal(false);
    setJournalToDelete(null);
  };

  return (
    <div className="border-b border-gray-700 overflow-visible w-full -mx-4">
      <div className="flex items-end justify-between pt-2 overflow-visible w-full">
        {/* Contenedor de pestañas con scroll */}
        <div className="flex items-end overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 flex-1 overflow-y-visible w-full">
          {/* Pestañas de diarios */}
          <div className="flex space-x-1 px-4 w-full">
            {journals.map((journal) => {
            const isActive = journal.id === activeJournalId;
            const isEditing = editingTabId === journal.id;
            
            return (
              <div
                key={journal.id}
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
                      onClick={() => onSelectJournal(journal.id)}
                      className={`
                        px-4 py-3 text-sm font-medium transition-colors truncate max-w-[200px] flex items-center space-x-2
                        ${isActive 
                          ? 'text-gold-300' 
                          : 'text-gray-300 hover:text-white'
                        }
                      `}
                    >
                      <span className="truncate">{journal.name}</span>
                      {/* Indicador de entradas */}
                      {journal.entries.length > 0 && (
                        <div className="bg-blue-800/80 text-blue-200 text-xs rounded-md px-2 py-1 flex items-center justify-center font-medium shadow-lg border border-blue-600/30 backdrop-blur-sm">
                          {journal.entries.length}
                        </div>
                      )}
                    </button>
                    
                    {/* Botones de acción (visibles al hover) */}
                    <div className="flex items-center space-x-1 px-2 opacity-30 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(journal);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Editar nombre"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      
                      {journals.length > 1 && (
                        <button
                          onClick={(e) => {
                            console.log('🖱️ Botón eliminar clickeado para diario:', journal.id);
                            e.stopPropagation();
                            handleDeleteJournal(journal.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Eliminar diario"
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

          {/* Botón para agregar nuevo diario */}
          <div className="flex-shrink-0 pl-1 pr-2 my-2">
            {showCreateForm ? (
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
                <input
                  type="text"
                  placeholder="Nombre del diario"
                  value={newJournalName}
                  onChange={(e) => setNewJournalName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateJournal();
                    if (e.key === 'Escape') {
                      setShowCreateForm(false);
                      setNewJournalName('');
                    }
                  }}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[150px]"
                  autoFocus
                />
                <button
                  onClick={handleCreateJournal}
                  disabled={!newJournalName.trim()}
                  className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewJournalName('');
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
                <span>{t('journalTabs.newJournal')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Botón de descarga */}
        {onExportJournalCSV && onExportAllJournalsCSV && onExportData && (
          <div className="flex-shrink-0 px-2 my-2">
            <DownloadDropdown
              onExportJournalCSV={onExportJournalCSV}
              onExportAllJournalsCSV={onExportAllJournalsCSV}
              onExportData={onExportData}
              activeJournalName={journals.find(j => j.id === activeJournalId)?.name || 'Diario'}
            />
          </div>
        )}
      </div>

      {/* Información del diario activo */}
      <div className="px-4 py-2 bg-gray-800/30 border-t border-gray-700">
        {(() => {
          const activeJournal = journals.find(j => j.id === activeJournalId);
          if (!activeJournal) return null;
          
          const totalEntries = activeJournal.entries.length;
          const completedPlans = activeJournal.entries.filter(e => e.seCumplioElPlan === true).length;
          const withScreenshots = activeJournal.entries.filter(e => e.screenshots && e.screenshots.length > 0).length;
          
          return (
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <span>{t('journalTabs.operations')}: <span className="text-white font-medium">{totalEntries}</span></span>
                <span>{t('journalTabs.planFollowed')}: <span className="text-green-400 font-medium">{completedPlans}</span></span>
                <span>{t('journalTabs.withScreenshots')}: <span className="text-blue-400 font-medium">{withScreenshots}</span></span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>MT5: {activeJournal.mt5Config.accountNumber}</span>
                <div className={`h-2 w-2 rounded-full ${
                  activeJournal.mt5Config.connected ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && journalToDelete && (
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
                Se va a eliminar el diario <strong className="text-white">
                  "{journals.find(j => j.id === journalToDelete)?.name || 'este diario'}"
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
                ¿CONFIRMAS que quieres eliminar este diario?
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
