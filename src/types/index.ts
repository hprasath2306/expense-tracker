export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO date string
  createdAt: string;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  amount: number;
}

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export interface DailyTotal {
  date: string;
  total: number;
}

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  color: string;
  total: number;
  percentage: number;
  count: number;
}
