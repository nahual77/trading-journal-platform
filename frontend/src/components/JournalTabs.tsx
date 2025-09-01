import React, { useState } from 'react';
import { TradingJournal } from '../types/trading';
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react';

interface JournalTabsProps {
  journals: TradingJournal[];
  activeJournalId: string;
  onSelectJournal: (journalId: string) => void;
  onCreateJournal: (name: string) => void;
  onUpdateJournalName: (journalId: string, name: string) => void;
  onDeleteJournal: (journalId: string) => void;
}

export function JournalTabs({
  journals,
  activeJournalId,
  onSelectJournal,
  onCreateJournal,
  onUpdateJournalName,
  onDeleteJournal,
}: JournalTabsProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');

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
    if (journals.length <= 1) {
      alert('No puedes eliminar el último diario');
      return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar este diario? Esta acción no se puede deshacer.')) {
      onDeleteJournal(journalId);
    }
  };

  return (
    <div className="border-b border-gray-700">
      <div className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {/* Pestañas de diarios */}
        <div className="flex space-x-1 px-4">
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
                        px-4 py-3 text-sm font-medium transition-colors truncate max-w-[200px]
                        ${isActive 
                          ? 'text-gold-300' 
                          : 'text-gray-300 hover:text-white'
                        }
                      `}
                    >
                      {journal.name}
                    </button>
                    
                    {/* Botones de acción (visibles al hover) */}
                    <div className="flex items-center space-x-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                
                {/* Indicador de entradas */}
                {!isEditing && journal.entries.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {journal.entries.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botón para agregar nuevo diario */}
        <div className="flex-shrink-0 px-4">
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
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600/10 border border-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600/20 hover:border-blue-600/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Nuevo Diario</span>
            </button>
          )}
        </div>
      </div>

      {/* Información del diario activo */}
      <div className="px-4 py-2 bg-gray-800/30 border-t border-gray-700">
        {(() => {
          const activeJournal = journals.find(j => j.id === activeJournalId);
          if (!activeJournal) return null;
          
          const totalEntries = activeJournal.entries.length;
          const completedPlans = activeJournal.entries.filter(e => e.seCumplioElPlan).length;
          const withScreenshots = activeJournal.entries.filter(e => e.screenshots.length > 0).length;
          
          return (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <span>Operaciones: <span className="text-white font-medium">{totalEntries}</span></span>
                <span>Plan cumplido: <span className="text-green-400 font-medium">{completedPlans}</span></span>
                <span>Con screenshots: <span className="text-blue-400 font-medium">{withScreenshots}</span></span>
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
    </div>
  );
}
