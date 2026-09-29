import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Lightbulb, 
  RefreshCw, 
  ShieldAlert,
  ArrowRight,
  Bot
} from 'lucide-react';
import { BudgetPlan, Transaction, ScenarioConfig } from '../types/finance';

interface BudgetPlannerProps {
  userName: string;
  currency: string;
  transactions: Transaction[];
  scenarioConfig: ScenarioConfig;
  budgetPlan: BudgetPlan | null;
  onGenerateBudget: () => Promise<void>;
  isGeneratingBudget: boolean;
  onOpenChat: (prompt: string) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  userName,
  currency,
  transactions,
  scenarioConfig,
  budgetPlan,
  onGenerateBudget,
  isGeneratingBudget,
  onOpenChat,
}) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group actual expenses by category
  const actualCategorySpent: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      actualCategorySpent[t.category] = (actualCategorySpent[t.category] || 0) + t.amount;
    });

  // Default fallback allocation if budgetPlan is empty
  const allocation = budgetPlan?.allocation || {
    needs: { target: Math.round(totalIncome * 0.5), percentage: 50 },
    wants: { target: Math.round(totalIncome * 0.3), percentage: 30 },
    savings: { target: Math.round(totalIncome * 0.2), percentage: 20 },
  };

  const categoryLimits = budgetPlan?.categoryLimits || [
    { category: 'Housing & Rent', limit: Math.round(totalIncome * 0.25), tip: 'Target rent and housing overheads under 28% of net salary.' },
    { category: 'Groceries & Food', limit: Math.round(totalIncome * 0.15), tip: 'Batch cook meals and buy pantry essentials in bulk.' },
    { category: 'Transport & Fuel', limit: Math.round(totalIncome * 0.08), tip: 'Optimize transit passes, carpool or fuel rewards.' },
    { category: 'Utilities & Bills', limit: Math.round(totalIncome * 0.06), tip: 'Audit recurring subscriptions and seasonal electricity.' },
    { category: 'Dining Out & Cafes', limit: Math.round(totalIncome * 0.08), tip: 'Set a weekend discretionary cap to curb impulsive dining.' },
    { category: 'Entertainment & OTT', limit: Math.round(totalIncome * 0.05), tip: 'Rotate streaming accounts every 3 months.' },
    { category: 'Investments & Stocks', limit: Math.round(totalIncome * 0.20), tip: 'Automate SIPs on day 1 of month.' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header and Trigger Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Budget Engine Active</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Personalized Budget Architect for {userName}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
            Calculated dynamic category limits according to the <strong className="text-indigo-300">{scenarioConfig.name}</strong> blueprint to maximize savings and eliminate overspending leaks.
          </p>
        </div>

        <button
          onClick={onGenerateBudget}
          disabled={isGeneratingBudget}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs md:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGeneratingBudget ? 'animate-spin' : ''}`} />
          <span>{isGeneratingBudget ? 'Optimizing Budget with AI...' : 'Regenerate AI Budget Plan'}</span>
        </button>
      </div>

      {/* 50 / 30 / 20 Macro Blueprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Needs */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Essential Needs</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
              {allocation.needs.percentage}%
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {currency}{allocation.needs.target.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">
            Covers shelter, essential groceries, transport, utilities, and healthcare.
          </p>
        </div>

        {/* Wants */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Discretionary Wants</span>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-bold">
              {allocation.wants.percentage}%
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {currency}{allocation.wants.target.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">
            Covers social dining, OTT subscriptions, hobbies, shopping, and entertainment.
          </p>
        </div>

        {/* Savings */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Savings & Wealth</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              {allocation.savings.percentage}%
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {currency}{allocation.savings.target.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">
            Dedicated emergency buffer, mutual funds, equity SIPs, and goal savings.
          </p>
        </div>

      </div>

      {/* Category Limits vs Actual Outflow Monitor */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Category Budget Limits & Spending Guardrails
            </h3>
            <p className="text-xs text-slate-400">
              Real-time variance tracking against AI recommended ceilings
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Safe (&lt;80%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Approaching (80-100%)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Overspent (&gt;100%)
            </span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryLimits.map((item) => {
            const spent = actualCategorySpent[item.category] || 0;
            const percentageUsed = item.limit > 0 ? Math.round((spent / item.limit) * 100) : 0;
            const remaining = item.limit - spent;
            const isOverspent = spent > item.limit;
            const isWarning = !isOverspent && percentageUsed >= 80;

            return (
              <div 
                key={item.category}
                className={`p-4 rounded-xl border transition-all ${
                  isOverspent 
                    ? 'bg-rose-950/20 border-rose-800/60' 
                    : isWarning 
                    ? 'bg-amber-950/20 border-amber-800/60' 
                    : 'bg-slate-850/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                      {item.category}
                      {isOverspent && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                          Over Limit
                        </span>
                      )}
                      {isWarning && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          80%+ Spent
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Budget Cap: <span className="font-mono text-slate-300 font-medium">{currency}{item.limit.toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">
                      {currency}{spent.toLocaleString()}
                    </div>
                    <div className={`text-[11px] font-medium ${isOverspent ? 'text-rose-400' : 'text-slate-400'}`}>
                      {isOverspent 
                        ? `${currency}${Math.abs(remaining).toLocaleString()} over` 
                        : `${currency}${remaining.toLocaleString()} left`}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverspent ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentageUsed)}%` }}
                  />
                </div>

                {/* AI Tip for category */}
                {item.tip && (
                  <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-slate-400">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    <span>{item.tip}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Actionable Insights & Risk Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Actionable Tips */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>AI Actionable Saving Recommendations</span>
          </div>
          <div className="space-y-2.5">
            {(budgetPlan?.actionableTips || [
              'Set up automated transfer of 20% on the day salary hits your account.',
              'Cook dinners at home 4 days a week to save up to ₹4,000 on weekend deliveries.',
              'Direct excess monthly surplus towards the high-priority Emergency Cushion.',
            ]).map((tip, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onOpenChat('How can I implement these actionable saving tips into my weekly schedule?')}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consult Advisor Bot on Action Plan</span>
          </button>
        </div>

        {/* Risk Areas */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Identified Overspending & Risk Areas</span>
          </div>
          <div className="space-y-2.5">
            {(budgetPlan?.riskAreas || [
              'Spontaneous weekend social outings and premium dining.',
              'Multiple active OTT subscriptions with overlapping content.',
              'Unmonitored delivery and convenience micro-charges.',
            ]).map((risk, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{risk}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onOpenChat('What are the best strategies to control and eliminate these overspending risks?')}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Advisor How to Cut Risk Categories</span>
          </button>
        </div>

      </div>

    </div>
  );
};
