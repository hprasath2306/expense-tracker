import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import type { Expense } from './types';
import BottomNav from './components/BottomNav';
import ExpenseModal from './components/ExpenseModal';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import CategoriesPage from './pages/CategoriesPage';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  function handleAdd() {
    setEditExpense(null);
    setModalOpen(true);
  }

  function handleEdit(expense: Expense) {
    setEditExpense(expense);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditExpense(null);
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage onEdit={handleEdit} />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
            </Routes>
          </main>
          <BottomNav onAddClick={handleAdd} />
          <ExpenseModal open={modalOpen} onClose={handleClose} editExpense={editExpense} />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
