import type { Expense, Category, MonthlyBudget } from '../types';
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from './constants';

export interface BackupData {
  version: number;
  app: string;
  exportedAt: string;
  expenses: Expense[];
  categories: Category[];
  budgets: MonthlyBudget[];
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadExpenses(): Expense[] {
  return loadJSON<Expense[]>(STORAGE_KEYS.EXPENSES, []);
}

export function saveExpenses(expenses: Expense[]): void {
  saveJSON(STORAGE_KEYS.EXPENSES, expenses);
}

export function loadCategories(): Category[] {
  const stored = loadJSON<Category[] | null>(STORAGE_KEYS.CATEGORIES, null);
  if (!stored) {
    saveJSON(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return stored;
}

export function saveCategories(categories: Category[]): void {
  saveJSON(STORAGE_KEYS.CATEGORIES, categories);
}

export function loadBudgets(): MonthlyBudget[] {
  return loadJSON<MonthlyBudget[]>(STORAGE_KEYS.BUDGETS, []);
}

export function saveBudgets(budgets: MonthlyBudget[]): void {
  saveJSON(STORAGE_KEYS.BUDGETS, budgets);
}

export function exportAllData(): void {
  const data: BackupData = {
    version: 1,
    app: 'spendwise',
    exportedAt: new Date().toISOString(),
    expenses: loadExpenses(),
    categories: loadCategories(),
    budgets: loadBudgets(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);

  const a = document.createElement('a');
  a.href = url;
  a.download = `spendwise-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateBackup(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (d.app !== 'spendwise') return false;
  if (!Array.isArray(d.expenses)) return false;
  if (!Array.isArray(d.categories)) return false;
  return true;
}

export function parseBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!validateBackup(parsed)) {
          reject(new Error('Invalid backup file. Make sure this is a SpendWise export.'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('Could not read the file. Make sure it is a valid JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsText(file);
  });
}

export function importReplace(data: BackupData): void {
  saveExpenses(data.expenses);
  saveCategories(data.categories);
  saveBudgets(data.budgets ?? []);
}

export function importMerge(data: BackupData): { expenses: Expense[]; categories: Category[]; budgets: MonthlyBudget[] } {
  const existingExpenses = loadExpenses();
  const existingCategories = loadCategories();
  const existingBudgets = loadBudgets();

  const expenseIds = new Set(existingExpenses.map(e => e.id));
  const mergedExpenses = [
    ...existingExpenses,
    ...data.expenses.filter(e => !expenseIds.has(e.id)),
  ];

  const categoryIds = new Set(existingCategories.map(c => c.id));
  const mergedCategories = [
    ...existingCategories,
    ...data.categories.filter(c => !categoryIds.has(c.id)),
  ];

  const budgetMonths = new Set(existingBudgets.map(b => b.month));
  const mergedBudgets = [
    ...existingBudgets,
    ...(data.budgets ?? []).filter(b => !budgetMonths.has(b.month)),
  ];

  saveExpenses(mergedExpenses);
  saveCategories(mergedCategories);
  saveBudgets(mergedBudgets);

  return { expenses: mergedExpenses, categories: mergedCategories, budgets: mergedBudgets };
}
