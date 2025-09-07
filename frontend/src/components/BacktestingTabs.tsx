import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, Trash2, X, Check, AlertTriangle, TestTube } from 'lucide-react';

export interface BacktestingJournal {
  id: string;
  name: string;
  entries: any[];
  columns: any[];
  createdAt: string;
  updatedAt: string;
}

interface BacktestingTabsProps {
  backtestingJournals: BacktestingJournal[];
  activeBacktestingId: string;
  onSelectBacktesting: (backtestingId: string) => void;
  onCreateBacktesting: (name: string) => void;
  onUpdateBacktestingName: (backtestingId: string, name: string) => void;
  onDeleteBacktesting: (backtestingId: string) => void;
}

export function BacktestingTabs({
  backtestingJournals,
  activeBacktestingId,
  onSelectBacktesting,
  onCreateBacktesting,
  onUpdateBacktestingName,
  onDeleteBacktesting,
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

  const handleCreate = () => {
    if (newBacktestingName.trim()) {
      onCreateBacktesting(newBacktestingName.trim());
      setNewBacktestingName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteClick = (backtestingId: string) => {
    setBacktestingToDelete(backtestingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (backtestingToDelete) {
      onDeleteBacktesting(backtestingToDelete);
      setShowDeleteModal(false);
      setBacktestingToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBacktestingToDelete(null);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">{t('backtesting.title')}</h2>
          </div>
        </div>

        {/* Pestañas de backtesting */}
        <div className="space-y-2">
          {backtestingJournals.map((backtesting) => (
            <div
              key={backtesting.id}
              className={`
                flex items-center justify-between p-3 rounded-lg transition-colors
                ${activeBacktestingId === backtesting.id
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'bg-gray-700/50 hover:bg-gray-700'
                  }
              `}
            >
              <div className="flex items-center space-x-3 flex-1">
                <TestTube className="h-4 w-4 text-purple-400" />
                {editingTabId === backtesting.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      onBlur={saveEdit}
                      className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectBacktesting(backtesting.id)}
                    className="flex-1 text-left text-white hover:text-purple-300 transition-colors"
                  >
                    <div className="font-medium">{backtesting.name}</div>
                    <div className="text-xs text-gray-400">
                      {backtesting.entries.length} {t('backtesting.tests')}
                    </div>
                  </button>
                )}
              </div>

              {editingTabId !== backtesting.id && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => startEditing(backtesting)}
                    className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(backtesting.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Botón crear nuevo backtesting */}
          {showCreateForm ? (
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newBacktestingName}
                  onChange={(e) => setNewBacktestingName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder={t('backtesting.newTest')}
                  className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-600/10 border border-purple-600/30 text-purple-400 rounded-lg hover:bg-purple-600/20 hover:border-purple-600/50 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>{t('backtesting.newTest')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-semibold text-white">{t('backtesting.deleteBacktesting')}</h3>
            </div>
            <p className="text-gray-300 mb-6">
              {t('backtesting.deleteBacktestingConfirm')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
