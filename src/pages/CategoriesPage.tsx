import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Category } from '../types';
import { DynamicIcon, Plus, Trash2, Edit2, X, Check } from '../utils/icons';

const ICON_OPTIONS = [
  'UtensilsCrossed', 'Car', 'ShoppingBag', 'Receipt', 'Clapperboard',
  'Heart', 'GraduationCap', 'Apple', 'Home', 'Wallet',
  'CircleDollarSign', 'Flame', 'Target', 'Tag',
];

const COLOR_OPTIONS = [
  '#F97316', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444',
  '#10B981', '#6366F1', '#14B8A6', '#F59E0B', '#6B7280',
  '#D946EF', '#0EA5E9', '#84CC16', '#F43F5E',
];

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, expenses } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  function openAdd() {
    setEditCat(null);
    setName('');
    setIcon(ICON_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setShowForm(true);
  }

  function handleSave() {
    if (!name.trim()) return;
    if (editCat) {
      updateCategory({ ...editCat, name: name.trim(), icon, color });
    } else {
      addCategory({ name: name.trim(), icon, color });
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const usedCount = expenses.filter(e => e.categoryId === id).length;
    if (usedCount > 0) {
      alert(`This category is used by ${usedCount} expense(s). Delete those first.`);
      return;
    }
    deleteCategory(id);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Categories</h1>
        <button className="btn-secondary" onClick={openAdd}>
          <Plus size={16} /> Add
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editCat ? 'Edit Category' : 'New Category'}</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Category name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Icon</label>
              <div className="icon-picker">
                {ICON_OPTIONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    className={`icon-pick ${icon === ic ? 'selected' : ''}`}
                    onClick={() => setIcon(ic)}
                  >
                    <DynamicIcon name={ic} size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-pick ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  >
                    {color === c && <Check size={14} color="#fff" />}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={handleSave}>
              {editCat ? 'Update' : 'Add Category'}
            </button>
          </div>
        </div>
      )}

      <div className="category-list">
        {categories.map(cat => (
          <div key={cat.id} className="category-row">
            <div className="category-row-left">
              <div
                className="category-row-icon"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                <DynamicIcon name={cat.icon} size={20} />
              </div>
              <div>
                <p className="category-row-name">{cat.name}</p>
                {cat.isDefault && <span className="badge">Default</span>}
              </div>
            </div>
            <div className="category-row-actions">
              <button className="icon-btn-sm" onClick={() => openEdit(cat)} aria-label="Edit">
                <Edit2 size={14} />
              </button>
              <button className="icon-btn-sm danger" onClick={() => handleDelete(cat.id)} aria-label="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
