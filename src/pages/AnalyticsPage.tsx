import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import type { TimeRange } from '../types';
import {
  filterByRange, totalAmount, dailyTotals, monthlyTotals,
  categoryTotals, getTopSpendingDay, averageDailySpend,
} from '../utils/analytics';
import { CURRENCY_SYMBOL } from '../utils/constants';
import { TrendingUp, ArrowUpRight, Target, Flame } from '../utils/icons';
import EmptyState from '../components/EmptyState';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
);

const chartColors = {
  gridColor: 'rgba(148, 163, 184, 0.1)',
  tooltipBg: '#1E293B',
};

export default function AnalyticsPage() {
  const { expenses, categories } = useApp();
  const [range, setRange] = useState<TimeRange>('month');

  const filtered = useMemo(() => filterByRange(expenses, range), [expenses, range]);
  const total = useMemo(() => totalAmount(filtered), [filtered]);
  const daily = useMemo(() => dailyTotals(expenses, range), [expenses, range]);
  const monthly = useMemo(() => monthlyTotals(expenses, 6), [expenses]);
  const catTotals = useMemo(() => categoryTotals(filtered, categories), [filtered, categories]);
  const topDay = useMemo(() => getTopSpendingDay(filtered), [filtered]);
  const avgDaily = useMemo(() => averageDailySpend(expenses, range), [expenses, range]);

  const ranges: { key: TimeRange; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All' },
  ];

  if (expenses.length === 0) {
    return (
      <div className="page">
        <header className="page-header"><h1>Analytics</h1></header>
        <EmptyState title="No data yet" message="Start adding expenses to see analytics" />
      </div>
    );
  }

  const spendingTrendData = {
    labels: daily.map(d => {
      const parsed = parseISO(d.date);
      return range === 'year' ? format(parsed, 'MMM') : format(parsed, 'dd MMM');
    }),
    datasets: [{
      label: 'Spending',
      data: daily.map(d => d.total),
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: range === 'week' ? 4 : 2,
      pointBackgroundColor: '#6366F1',
    }],
  };

  const monthlyData = {
    labels: monthly.map(m => format(parseISO(m.month + '-01'), 'MMM yy')),
    datasets: [{
      label: 'Monthly Total',
      data: monthly.map(m => m.total),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 8,
      maxBarThickness: 40,
    }],
  };

  const categoryData = {
    labels: catTotals.map(c => c.categoryName),
    datasets: [{
      data: catTotals.map(c => c.total),
      backgroundColor: catTotals.map(c => c.color),
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        titleFont: { size: 12 },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: (ctx: { parsed: { y: number | null } }) => `${CURRENCY_SYMBOL}${(ctx.parsed.y ?? 0).toLocaleString('en-IN')}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, maxTicksLimit: 7 } },
      y: { grid: { color: chartColors.gridColor }, ticks: { font: { size: 10 }, callback: (v: string | number) => `${CURRENCY_SYMBOL}${v}` } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        cornerRadius: 8,
        callbacks: { label: (ctx: { parsed: { y: number | null } }) => `${CURRENCY_SYMBOL}${(ctx.parsed.y ?? 0).toLocaleString('en-IN')}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: chartColors.gridColor }, ticks: { font: { size: 10 }, callback: (v: string | number) => `${CURRENCY_SYMBOL}${v}` } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: { label: string; parsed: number }) =>
            `${ctx.label}: ${CURRENCY_SYMBOL}${ctx.parsed.toLocaleString('en-IN')}`,
        },
      },
    },
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Analytics</h1>
      </header>

      <div className="filter-tabs">
        {ranges.map(r => (
          <button
            key={r.key}
            className={`filter-tab ${range === r.key ? 'active' : ''}`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="insight-cards">
        <div className="insight-card">
          <div className="insight-icon" style={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="insight-value">{CURRENCY_SYMBOL}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p className="insight-label">Total Spent</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Target size={18} />
          </div>
          <div>
            <p className="insight-value">{CURRENCY_SYMBOL}{avgDaily.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 0 })}</p>
            <p className="insight-label">Avg / Day</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
            <Flame size={18} />
          </div>
          <div>
            <p className="insight-value">{filtered.length}</p>
            <p className="insight-label">Transactions</p>
          </div>
        </div>
        {topDay && (
          <div className="insight-card">
            <div className="insight-icon" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
              <ArrowUpRight size={18} />
            </div>
            <div>
              <p className="insight-value">{format(parseISO(topDay.date), 'dd MMM')}</p>
              <p className="insight-label">Highest Day ({CURRENCY_SYMBOL}{topDay.total.toLocaleString('en-IN')})</p>
            </div>
          </div>
        )}
      </div>

      <div className="chart-card">
        <h3>Spending Trend</h3>
        <div className="chart-container">
          <Line data={spendingTrendData} options={lineOptions} />
        </div>
      </div>

      <div className="chart-card">
        <h3>Monthly Overview</h3>
        <div className="chart-container">
          <Bar data={monthlyData} options={barOptions} />
        </div>
      </div>

      <div className="chart-card">
        <h3>By Category</h3>
        <div className="chart-container doughnut-container">
          <div className="doughnut-wrapper">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
          <div className="category-legend">
            {catTotals.map(ct => (
              <div key={ct.categoryId} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: ct.color }} />
                <span className="legend-name">{ct.categoryName}</span>
                <span className="legend-value">{ct.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
