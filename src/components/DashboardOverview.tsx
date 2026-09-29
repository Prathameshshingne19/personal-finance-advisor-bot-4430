import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Bot, 
  ChevronRight,
  PieChart as PieChartIcon,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { Transaction, SavingsGoal, ScenarioConfig } from '../types/finance';

interface DashboardOverviewProps {
  userName: string;
  currency: string;
  transactions: Transaction[];
  goals: SavingsGoal[];
  scenarioConfig: ScenarioConfig;
  onOpenChat: (initialPrompt?: string) => void;
  onOpenReport: () => void;
  onOpenQuickAdd: () => void;
  setActiveTab: (tab: string) => void;
  onDeleteTransaction: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  userName,
  currency,
  transactions,
  goals,
  scenarioConfig,
  onOpenChat,
  onOpenReport,
  onOpenQuickAdd,
  setActiveTab,
  onDeleteTransaction,
}) => {
  // Financial computations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Breakdown by nature (Needs vs Wants vs Savings)
  const needsSpent = transactions
    .filter((t) => t.type === 'expense' && t.nature === 'need')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const wantsSpent = transactions
    .filter((t) => t.type === 'expense' && t.nature === 'want')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const directSavingsSpent = transactions
    .filter((t) => t.type === 'expense' && t.nature === 'saving')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const needsPercentage = totalIncome > 0 ? Math.round((needsSpent / totalIncome) * 100) : 0;
  const wantsPercentage = totalIncome > 0 ? Math.round((wantsSpent / totalIncome) * 100) : 0;
  const savingsPercentage = totalIncome > 0 ? Math.round(((directSavingsSpent + Math.max(0, netSavings)) / totalIncome) * 100) : 0;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryList = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Total goals progress
  const totalGoalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalGoalCurrent = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalGoalProgress = totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0;

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Top expense category
  const topCategory = categoryList[0];

  return (
    <div className="space-y-6">
      
      {/* Welcome & Scenario Intelligence Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 md:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Scenario: {scenarioConfig.name}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Welcome back, {userName}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              {scenarioConfig.description} Recommended savings target: <strong className="text-emerald-400">{scenarioConfig.recommendedSavingsRate}%</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenChat(`Hello! Review my current budget and spending pattern for the ${scenarioConfig.name} scenario.`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Bot className="w-4 h-4 text-emerald-100" />
              <span>Ask Advisor Bot</span>
            </button>
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
            >
              <span>Monthly Report</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {currency}{totalIncome.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>All active earnings logged</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Outflow</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {currency}{totalExpenses.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-rose-400">
                {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%
              </span>
              <span>of total monthly income</span>
            </div>
          </div>
        </div>

        {/* Net Cash Flow / Savings */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Surplus / Savings</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              netSavings >= 0 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}>
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight ${netSavings >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {netSavings >= 0 ? '+' : ''}{currency}{netSavings.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`font-semibold ${savingsRate >= scenarioConfig.recommendedSavingsRate ? 'text-emerald-400' : 'text-amber-400'}`}>
                {savingsRate}% savings rate
              </span>
              <span>(Target: {scenarioConfig.recommendedSavingsRate}%)</span>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Savings Goals</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {totalGoalProgress}%
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
              <span>{currency}{totalGoalCurrent.toLocaleString()} saved</span>
              <span className="text-purple-400">{goals.length} active goals</span>
            </div>
          </div>
        </div>

      </div>

      {/* 50/30/20 Rule Balance & AI Spending Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 50/30/20 Rule Visualizer */}
        <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                50 / 30 / 20 Budget Allocation Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Healthy benchmark: Needs (≤50%), Wants (≤30%), Savings (≥20%)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('budget')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>AI Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Allocation Progress Bars */}
          <div className="space-y-3.5 pt-2">
            
            {/* Needs */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  Needs & Essentials (Rent, Groceries, Utilities, Transit)
                </span>
                <span className="text-slate-400 font-mono">
                  {currency}{needsSpent.toLocaleString()} ({needsPercentage}% of income)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${needsPercentage <= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, needsPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Current: {needsPercentage}%</span>
                <span>Guideline target: ≤ 50%</span>
              </div>
            </div>

            {/* Wants */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
                  Wants & Discretionary (Dining, Entertainment, Shopping)
                </span>
                <span className="text-slate-400 font-mono">
                  {currency}{wantsSpent.toLocaleString()} ({wantsPercentage}% of income)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${wantsPercentage <= 30 ? 'bg-pink-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, wantsPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Current: {wantsPercentage}%</span>
                <span>Guideline target: ≤ 30%</span>
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Savings, Emergency Buffer & Investments
                </span>
                <span className="text-slate-400 font-mono">
                  {currency}{(directSavingsSpent + Math.max(0, netSavings)).toLocaleString()} ({savingsPercentage}% of income)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, savingsPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Current: {savingsPercentage}%</span>
                <span>Guideline target: ≥ 20%</span>
              </div>
            </div>

          </div>

          {/* Quick AI Summary Tip */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 mt-4">
            <Bot className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">AI Advisor Quick Insight for {userName}:</p>
              <p>
                {wantsPercentage > 30 ? (
                  `Your discretionary "Wants" are currently at ${wantsPercentage}%, exceeding the 30% target. Consider trimming ${topCategory ? topCategory.category : 'dining'} by 15% to redirect into your emergency fund.`
                ) : savingsPercentage >= 20 ? (
                  `Excellent fiscal discipline! You are retaining ${savingsPercentage}% of income for wealth generation, meeting the gold-standard 50/30/20 criteria.`
                ) : (
                  `Your current net savings rate is ${savingsPercentage}%. Let's calibrate your category limits to reach the recommended ${scenarioConfig.recommendedSavingsRate}% benchmark.`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Top Spending Categories List */}
        <div className="p-5 md:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-cyan-400" />
                Category Outflow
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {categoryList.length} Categories
              </span>
            </div>

            <div className="space-y-3">
              {categoryList.slice(0, 5).map((item, idx) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">
                      {item.category}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {currency}{item.amount.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : idx === 2 ? 'bg-cyan-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ledger')}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors mt-4"
          >
            <span>Inspect Full Ledger & History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Recent Ledger Feed */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Recent Income & Expense Entries
            </h3>
            <p className="text-xs text-slate-400">
              Latest transactions recorded for {userName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuickAdd}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
            >
              + Quick Add
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              View All
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between group hover:bg-slate-850/40 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  tx.type === 'income' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {tx.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {tx.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {tx.category}
                    </span>
                    <span>•</span>
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span className="font-mono">{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`text-sm font-bold font-mono ${
                  tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                </div>
                <button
                  onClick={() => onDeleteTransaction(tx.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 text-xs transition-opacity p-1"
                  title="Delete Entry"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
