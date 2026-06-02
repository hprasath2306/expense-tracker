import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import type { Expense } from '../types';
import { DynamicIcon, X } from '../utils/icons';
import { CURRENCY_SYMBOL } from '../utils/constants';

interface Props {
  open: boolean;
  onClose: () => void;
  editExpense?: Expense | null;
}

export default function ExpenseModal({ open, onClose, editExpense }: Props) {
  const { categories, addExpense, updateExpense } = useApp();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (editExpense) {
      setAmount(String(editExpense.amount));
      setDescription(editExpense.description);
      setCategoryId(editExpense.categoryId);
      setDate(editExpense.date.slice(0, 10));
    } else {
      setAmount('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [editExpense, open, categories]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0 || !categoryId) return;

    if (editExpense) {
      updateExpense({ ...editExpense, amount: num, description, categoryId, date });
    } else {
      addExpense({ amount: num, description, categoryId, date });
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editExpense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount ({CURRENCY_SYMBOL})</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="What did you spend on?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  className={`category-chip ${categoryId === cat.id ? 'selected' : ''}`}
                  style={{ '--cat-color': cat.color } as React.CSSProperties}
                  onClick={() => setCategoryId(cat.id)}
                >
                  <DynamicIcon name={cat.icon} size={16} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary">
            {editExpense ? 'Update' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
