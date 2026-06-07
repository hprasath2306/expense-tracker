import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Upload, FileText, AlertTriangle } from '../utils/icons';
import {
  exportAllData, parseBackupFile, importReplace, importMerge,
} from '../utils/storage';

type ImportMode = 'replace' | 'merge';
type Status = { type: 'success' | 'error'; message: string } | null;

export default function SettingsPage() {
  const { expenses, categories, reloadData } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [confirmState, setConfirmState] = useState<{
    file: File;
    expenseCount: number;
    categoryCount: number;
  } | null>(null);

  function handleExport() {
    exportAllData();
    setStatus({ type: 'success', message: 'Backup downloaded successfully!' });
    setTimeout(() => setStatus(null), 3000);
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      const data = await parseBackupFile(file);
      setConfirmState({
        file,
        expenseCount: data.expenses.length,
        categoryCount: data.categories.length,
      });
      setStatus(null);
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message });
    }
  }

  async function handleConfirmImport(mode: ImportMode) {
    if (!confirmState) return;
    try {
      const data = await parseBackupFile(confirmState.file);
      if (mode === 'replace') {
        importReplace(data);
        reloadData({
          expenses: data.expenses,
          categories: data.categories,
          budgets: data.budgets ?? [],
        });
      } else {
        const merged = importMerge(data);
        reloadData(merged);
      }
      setStatus({
        type: 'success',
        message: mode === 'replace'
          ? `Restored ${data.expenses.length} expenses and ${data.categories.length} categories.`
          : `Merged data successfully. New entries have been added.`,
      });
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message });
    }
    setConfirmState(null);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-section">
        <h3 className="settings-section-title">Data Management</h3>
        <p className="settings-section-desc">
          Your data is stored on this device. Export a backup to transfer it to another device or keep a safe copy.
        </p>

        <div className="settings-card">
          <div className="settings-card-left">
            <div className="settings-icon export-icon">
              <Download size={20} />
            </div>
            <div>
              <p className="settings-card-title">Export Data</p>
              <p className="settings-card-desc">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''}, {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
          </div>
          <button className="btn-settings" onClick={handleExport}>
            Export
          </button>
        </div>

        <div className="settings-card">
          <div className="settings-card-left">
            <div className="settings-icon import-icon">
              <Upload size={20} />
            </div>
            <div>
              <p className="settings-card-title">Import Data</p>
              <p className="settings-card-desc">Restore from a backup file</p>
            </div>
          </div>
          <button className="btn-settings" onClick={handleImportClick}>
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            hidden
          />
        </div>
      </div>

      {confirmState && (
        <div className="modal-overlay" onClick={() => setConfirmState(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-header">
              <AlertTriangle size={24} className="confirm-warn-icon" />
              <h2>Import Backup</h2>
            </div>
            <div className="confirm-file-info">
              <FileText size={16} />
              <span>{confirmState.file.name}</span>
            </div>
            <p className="confirm-detail">
              This backup contains <strong>{confirmState.expenseCount} expenses</strong> and <strong>{confirmState.categoryCount} categories</strong>.
            </p>
            <p className="confirm-question">How would you like to import?</p>

            <button
              className="btn-import-option"
              onClick={() => handleConfirmImport('merge')}
            >
              <div>
                <p className="import-option-title">Merge with existing</p>
                <p className="import-option-desc">Keeps your current data and adds new entries from the backup</p>
              </div>
            </button>

            <button
              className="btn-import-option btn-import-danger"
              onClick={() => handleConfirmImport('replace')}
            >
              <div>
                <p className="import-option-title">Replace all data</p>
                <p className="import-option-desc">Removes current data and restores entirely from the backup</p>
              </div>
            </button>

            <button className="btn-cancel" onClick={() => setConfirmState(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className={`toast ${status.type}`}>
          <p>{status.message}</p>
        </div>
      )}
    </div>
  );
}
