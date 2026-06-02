import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#F97316', isDefault: true },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#3B82F6', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', isDefault: true },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#8B5CF6', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'Clapperboard', color: '#EF4444', isDefault: true },
  { id: 'health', name: 'Health', icon: 'Heart', color: '#10B981', isDefault: true },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#6366F1', isDefault: true },
  { id: 'groceries', name: 'Groceries', icon: 'Apple', color: '#14B8A6', isDefault: true },
  { id: 'rent', name: 'Rent', icon: 'Home', color: '#F59E0B', isDefault: true },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6B7280', isDefault: true },
];

export const CURRENCY_SYMBOL = '₹';

export const STORAGE_KEYS = {
  EXPENSES: 'expense-tracker-expenses',
  CATEGORIES: 'expense-tracker-categories',
  BUDGETS: 'expense-tracker-budgets',
} as const;
