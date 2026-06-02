import { format, parseISO } from 'date-fns';
import type { Expense, Category } from '../types';
import { DynamicIcon, Trash2, Edit2 } from '../utils/icons';
import { CURRENCY_SYMBOL } from '../utils/constants';

interface Props {
  expense: Expense;
  category: Category | undefined;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseCard({ expense, category, onEdit, onDelete }: Props) {
  return (
    <div className="expense-card">
      <div className="expense-card-left">
        <div
          className="expense-icon"
          style={{ backgroundColor: `${category?.color || '#6B7280'}15`, color: category?.color || '#6B7280' }}
        >
          <DynamicIcon name={category?.icon || 'CircleDollarSign'} size={20} />
        </div>
        <div className="expense-info">
          <p className="expense-desc">{expense.description || category?.name || 'Expense'}</p>
          <p className="expense-meta">
            {category?.name} · {format(parseISO(expense.date), 'dd MMM yyyy')}
          </p>
        </div>
      </div>
      <div className="expense-card-right">
        <span className="expense-amount">-{CURRENCY_SYMBOL}{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        <div className="expense-actions">
          <button className="icon-btn-sm" onClick={() => onEdit(expense)} aria-label="Edit">
            <Edit2 size={14} />
          </button>
          <button className="icon-btn-sm danger" onClick={() => onDelete(expense.id)} aria-label="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
