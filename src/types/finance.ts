export type TransactionType = 'income' | 'expense';

export type ExpenseNature = 'need' | 'want' | 'saving';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  nature: ExpenseNature;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
}

export interface CategoryLimit {
  category: string;
  limit: number;
  spent: number;
  tip?: string;
}

export interface BudgetPlan {
  summary: string;
  allocation: {
    needs: { target: number; percentage: number };
    wants: { target: number; percentage: number };
    savings: { target: number; percentage: number };
  };
  categoryLimits: { category: string; limit: number; tip: string }[];
  actionableTips: string[];
  riskAreas: string[];
  generatedAt?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'emergency' | 'investment' | 'purchase' | 'travel' | 'debt_payoff';
  monthlyContribution: number;
  color?: string;
}

export type ScenarioId = 'salaried' | 'student' | 'freelancer' | 'household' | 'custom';

export interface ScenarioConfig {
  id: ScenarioId;
  name: string;
  role: string;
  description: string;
  icon: string;
  currency: string;
  defaultIncome: number;
  recommendedSavingsRate: number;
  emergencyTargetMonths: number;
  sampleTransactions: Transaction[];
  sampleGoals: SavingsGoal[];
}

export interface FinancialHealthData {
  score: number;
  grade: string;
  runwayMonths: number;
  savingsRate: number;
  healthStatus: string;
  metrics: {
    name: string;
    score: number;
    status: string;
  }[];
  keyStrengths: string[];
  priorityWarnings: string[];
  predictiveTrend: string;
}

export interface MonthlyReportData {
  reportTitle: string;
  preparedFor: string;
  scenario: string;
  executiveSummary: string;
  kpis: {
    income: string;
    expenses: string;
    savings: string;
    savingsRate: string;
  };
  overspendingCulprits: string[];
  highlights: string[];
  actionPlanNextMonth: string[];
  goalMilestones: {
    name: string;
    progress: string;
    recommendation: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
}
