export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Income' | 'Housing' | 'Food' | 'Transport' | 'Entertainment' | 'Utilities' | 'Savings' | 'Other';
  type: 'income' | 'expense';
}

export interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface FinancialHealth {
  score: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
}
