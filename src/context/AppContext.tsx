import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Expense, Category, MonthlyBudget } from '../types';
import {
  loadExpenses, saveExpenses,
  loadCategories, saveCategories,
  loadBudgets, saveBudgets,
} from '../utils/storage';

interface AppState {
  expenses: Expense[];
  categories: Category[];
  budgets: MonthlyBudget[];
}

type Action =
  | { type: 'ADD_EXPENSE'; payload: Omit<Expense, 'id' | 'createdAt'> }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id' | 'isDefault'> }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_BUDGET'; payload: MonthlyBudget }
  | { type: 'RELOAD'; payload?: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_EXPENSE': {
      const expense: Expense = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, expenses: [expense, ...state.expenses] };
    }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e),
      };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    case 'ADD_CATEGORY': {
      const category: Category = { ...action.payload, id: uuidv4(), isDefault: false };
      return { ...state, categories: [...state.categories, category] };
    }
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c),
      };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'SET_BUDGET': {
      const idx = state.budgets.findIndex(b => b.month === action.payload.month);
      const budgets = idx >= 0
        ? state.budgets.map((b, i) => i === idx ? action.payload : b)
        : [...state.budgets, action.payload];
      return { ...state, budgets };
    }
    case 'RELOAD':
      return action.payload ?? {
        expenses: loadExpenses(),
        categories: loadCategories(),
        budgets: loadBudgets(),
      };
    default:
      return state;
  }
}

interface ContextValue extends AppState {
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addCategory: (data: Omit<Category, 'id' | 'isDefault'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  setBudget: (budget: MonthlyBudget) => void;
  reloadData: (data?: AppState) => void;
}

const AppContext = createContext<ContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    expenses: loadExpenses(),
    categories: loadCategories(),
    budgets: loadBudgets(),
  }));

  useEffect(() => { saveExpenses(state.expenses); }, [state.expenses]);
  useEffect(() => { saveCategories(state.categories); }, [state.categories]);
  useEffect(() => { saveBudgets(state.budgets); }, [state.budgets]);

  const addExpense = useCallback((data: Omit<Expense, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_EXPENSE', payload: data });
  }, []);
  const updateExpense = useCallback((expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  }, []);
  const deleteExpense = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  }, []);
  const addCategory = useCallback((data: Omit<Category, 'id' | 'isDefault'>) => {
    dispatch({ type: 'ADD_CATEGORY', payload: data });
  }, []);
  const updateCategory = useCallback((category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  }, []);
  const deleteCategory = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  }, []);
  const setBudget = useCallback((budget: MonthlyBudget) => {
    dispatch({ type: 'SET_BUDGET', payload: budget });
  }, []);
  const reloadData = useCallback((data?: AppState) => {
    dispatch({ type: 'RELOAD', payload: data });
  }, []);

  return (
    <AppContext.Provider value={{
      ...state, addExpense, updateExpense, deleteExpense,
      addCategory, updateCategory, deleteCategory, setBudget, reloadData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
