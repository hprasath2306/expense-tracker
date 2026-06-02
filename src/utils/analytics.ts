import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval,
  format, parseISO, isWithinInterval, subMonths,
} from 'date-fns';
import type { Expense, Category, TimeRange, DailyTotal, CategoryTotal } from '../types';

export function filterByRange(expenses: Expense[], range: TimeRange, refDate = new Date()): Expense[] {
  if (range === 'all') return expenses;

  let start: Date, end: Date;
  switch (range) {
    case 'week':
      start = startOfWeek(refDate, { weekStartsOn: 1 });
      end = endOfWeek(refDate, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(refDate);
      end = endOfMonth(refDate);
      break;
    case 'year':
      start = startOfYear(refDate);
      end = endOfYear(refDate);
      break;
  }

  return expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start, end });
  });
}

export function totalAmount(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function dailyTotals(expenses: Expense[], range: TimeRange, refDate = new Date()): DailyTotal[] {
  const filtered = filterByRange(expenses, range, refDate);
  const map = new Map<string, number>();

  filtered.forEach(e => {
    const key = e.date.slice(0, 10);
    map.set(key, (map.get(key) || 0) + e.amount);
  });

  let start: Date, end: Date;
  switch (range) {
    case 'week':
      start = startOfWeek(refDate, { weekStartsOn: 1 });
      end = endOfWeek(refDate, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(refDate);
      end = endOfMonth(refDate);
      break;
    case 'year':
      start = startOfYear(refDate);
      end = endOfYear(refDate);
      break;
    default:
      if (filtered.length === 0) return [];
      const dates = filtered.map(e => parseISO(e.date)).sort((a, b) => a.getTime() - b.getTime());
      start = dates[0];
      end = dates[dates.length - 1];
  }

  return eachDayOfInterval({ start, end }).map(d => ({
    date: format(d, 'yyyy-MM-dd'),
    total: map.get(format(d, 'yyyy-MM-dd')) || 0,
  }));
}

export function monthlyTotals(expenses: Expense[], months = 12): { month: string; total: number }[] {
  const now = new Date();
  const start = subMonths(startOfMonth(now), months - 1);
  const end = endOfMonth(now);

  const map = new Map<string, number>();
  expenses.forEach(e => {
    const key = e.date.slice(0, 7);
    map.set(key, (map.get(key) || 0) + e.amount);
  });

  return eachMonthOfInterval({ start, end }).map(d => ({
    month: format(d, 'yyyy-MM'),
    total: map.get(format(d, 'yyyy-MM')) || 0,
  }));
}

export function categoryTotals(expenses: Expense[], categories: Category[]): CategoryTotal[] {
  const total = totalAmount(expenses);
  const map = new Map<string, { sum: number; count: number }>();

  expenses.forEach(e => {
    const entry = map.get(e.categoryId) || { sum: 0, count: 0 };
    entry.sum += e.amount;
    entry.count += 1;
    map.set(e.categoryId, entry);
  });

  return Array.from(map.entries())
    .map(([catId, { sum, count }]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        categoryId: catId,
        categoryName: cat?.name || 'Unknown',
        color: cat?.color || '#6B7280',
        total: sum,
        percentage: total > 0 ? (sum / total) * 100 : 0,
        count,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function getTopSpendingDay(expenses: Expense[]): { date: string; total: number } | null {
  const map = new Map<string, number>();
  expenses.forEach(e => {
    const key = e.date.slice(0, 10);
    map.set(key, (map.get(key) || 0) + e.amount);
  });
  if (map.size === 0) return null;
  let maxDate = '', maxTotal = 0;
  map.forEach((total, date) => {
    if (total > maxTotal) { maxTotal = total; maxDate = date; }
  });
  return { date: maxDate, total: maxTotal };
}

export function averageDailySpend(expenses: Expense[], range: TimeRange, refDate = new Date()): number {
  const filtered = filterByRange(expenses, range, refDate);
  if (filtered.length === 0) return 0;
  const days = new Set(filtered.map(e => e.date.slice(0, 10)));
  return totalAmount(filtered) / days.size;
}
