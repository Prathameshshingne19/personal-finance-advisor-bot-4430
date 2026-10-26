 import { Transaction, BudgetCategory, SavingsGoal, FinancialHealth } from '../types/finance';

export const initialTransactions: Transaction[] = [
  { id: '1', date: '2026-10-01', description: 'Monthly Salary', amount: 5000, category: 'Income', type: 'income' },
  { id: '2', date: '2026-10-02', description: 'Apartment Rent', amount: 1500, category: 'Housing', type: 'expense' },
  { id: '3', date: '2026-10-05', description: 'Grocery Store', amount: 250, category: 'Food', type: 'expense' },
  { id: '4', date: '2026-10-10', description: 'Electric & Water', amount: 120, category: 'Utilities', type: 'expense' },
  { id: '5', date: '2026-10-15', description: 'Gas Station', amount: 60, category: 'Transport', type: 'expense' }
];

export const initialBudgets: BudgetCategory[] = [
  { category: 'Housing', allocated: 1500, spent: 1500 },
  { category: 'Food', allocated: 600, spent: 250 },
  { category: 'Utilities', allocated: 200, spent: 120 },
  { category: 'Transport', allocated: 300, spent: 60 },
  { category: 'Entertainment', allocated: 200, spent: 0 }
];

export const initialGoals: SavingsGoal[] = [
  { id: 'g1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6000, deadline: '2026-12-31' },
  { id: 'g2', name: 'Vacation Trip', targetAmount: 2500, currentAmount: 1200, deadline: '2026-11-30' }
];

export const initialHealth: FinancialHealth = {
  score: 78,
  savingsRate: 25,
  debtToIncomeRatio: 12,
  emergencyFundMonths: 4
};
