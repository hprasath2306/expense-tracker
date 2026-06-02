import { useState, useMemo } from 'react';
import { format, parseISO, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useApp } from '../context/AppContext';
import type { Expense, TimeRange } from '../types';
import { totalAmount, filterByRange } from '../utils/analytics';
import { CURRENCY_SYMBOL } from '../utils/constants';
import { TrendingDown, Calendar, Flame } from '../utils/icons';
import ExpenseCard from '../components/ExpenseCard';
import EmptyState from '../components/EmptyState';

interface Props {
  onEdit: (e: Expense) => void;
}

export default function HomePage({ onEdit }: Props) {
  const { expenses, categories, deleteExpense } = useApp();
  const [filter, setFilter] = useState<TimeRange>('month');

  const filtered = useMemo(() => filterByRange(expenses, filter), [expenses, filter]);
  const total = useMemo(() => totalAmount(filtered), [filtered]);
  const todayTotal = useMemo(
    () => totalAmount(expenses.filter(e => isToday(parseISO(e.date)))),
    [expenses]
  );

  const grouped = useMemo(() => {
    const groups: { label: string; expenses: Expense[] }[] = [];
    const map = new Map<string, Expense[]>();

    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach(e => {
      const key = e.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });

    map.forEach((exps, dateStr) => {
      const d = parseISO(dateStr);
      let label: string;
      if (isToday(d)) label = 'Today';
      else if (isYesterday(d)) label = 'Yesterday';
      else if (isThisWeek(d, { weekStartsOn: 1 })) label = format(d, 'EEEE');
      else label = format(d, 'dd MMM yyyy');
      groups.push({ label, expenses: exps });
    });

    return groups;
  }, [filtered]);

  const streak = useMemo(() => {
    const days = new Set(expenses.map(e => e.date.slice(0, 10)));
    let count = 0;
    const d = new Date();
    while (days.has(format(d, 'yyyy-MM-dd'))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [expenses]);

  const ranges: { key: TimeRange; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="greeting">Hello there 👋</p>
          <h1>Expense Tracker</h1>
        </div>
      </header>

      <div className="summary-card">
        <div className="summary-top">
          <div>
            <p className="summary-label">Total Spent</p>
            <h2 className="summary-amount">
              {CURRENCY_SYMBOL}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="summary-badge">
            <Calendar size={14} />
            <span>{format(new Date(), 'MMM yyyy')}</span>
          </div>
        </div>
        <div className="summary-stats">
          <div className="stat">
            <TrendingDown size={16} className="stat-icon" />
            <div>
              <p className="stat-value">{CURRENCY_SYMBOL}{todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="stat-label">Today</p>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <Flame size={16} className="stat-icon" />
            <div>
              <p className="stat-value">{streak} day{streak !== 1 ? 's' : ''}</p>
              <p className="stat-label">Tracking streak</p>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        {ranges.map(r => (
          <button
            key={r.key}
            className={`filter-tab ${filter === r.key ? 'active' : ''}`}
            onClick={() => setFilter(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          message="Tap the + button to add your first expense"
        />
      ) : (
        <div className="expense-list">
          {grouped.map(group => (
            <div key={group.label} className="expense-group">
              <p className="group-label">{group.label}</p>
              {group.expenses.map(exp => (
                <ExpenseCard
                  key={exp.id}
                  expense={exp}
                  category={categories.find(c => c.id === exp.categoryId)}
                  onEdit={onEdit}
                  onDelete={deleteExpense}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
