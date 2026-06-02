import type { Expense, Category, MonthlyBudget } from '../types';
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from './constants';

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
