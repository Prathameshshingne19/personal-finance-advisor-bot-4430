import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Sliders, 
  BarChart3, 
  RefreshCw,
  Bot,
  Zap,
  ArrowRight
} from 'lucide-react';
import { FinancialHealthData, Transaction, SavingsGoal, ScenarioConfig } from '../types/finance';

interface FinancialHealthViewProps {
  userName: string;
  currency: string;
  transactions: Transaction[];
  goals: SavingsGoal[];
  scenarioConfig: ScenarioConfig;
  healthData: FinancialHealthData | null;
  onRefreshHealth: () => Promise<void>;
  isRefreshing: boolean;
  onOpenChat: (prompt: string) => void;
}

export const FinancialHealthView: React.FC<FinancialHealthViewProps> = ({
  userName,
  currency,
  transactions,
  goals,
  scenarioConfig,
  healthData,
  onRefreshHealth,
  isRefreshing,
  onOpenChat,
}) => {
  // Slider states for "What-If" Simulator
  const [incomeMultiplier, setIncomeMultiplier] = useState<number>(0); // -30% to +30%
  const [discretionaryCut, setDiscretionaryCut] = useState<number>(0); // 0% to 50%
  const [fixedOverheadInflation, setFixedOverheadInflation] = useState<number>(0); // 0% to 25%

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const needsSpent = transactions
    .filter((t) => t.type === 'expense' && t.nature === 'need')
    .reduce((sum, t) => sum + t.amount, 0);

  const wantsSpent = transactions
    .filter((t) => t.type === 'expense' && t.nature === 'want')
    .reduce((sum, t) => sum + t.amount, 0);

  // What-If simulated calculations
  const simIncome = Math.round(totalIncome * (1 + incomeMultiplier / 100));
  const simNeeds = Math.round(needsSpent * (1 + fixedOverheadInflation / 100));
  const simWants = Math.round(wantsSpent * (1 - discretionaryCut / 100));
  const simExpenses = simNeeds + simWants;
  const simNetSavings = simIncome - simExpenses;
  const simSavingsRate = simIncome > 0 ? Math.round((simNetSavings / simIncome) * 100) : 0;

  // Current values
  const currentNetSavings = totalIncome - totalExpenses;
  const currentSavingsRate = totalIncome > 0 ? Math.round((currentNetSavings / totalIncome) * 100) : 0;

  const score = healthData?.score || 82;
  const grade = healthData?.grade || 'A';
  const healthStatus = healthData?.healthStatus || 'Strong Financial Resilience';

  const metrics = healthData?.metrics || [
    { name: 'Savings Velocity', score: Math.min(100, currentSavingsRate * 3), status: currentSavingsRate >= 20 ? 'Optimal' : 'Moderate' },
    { name: 'Emergency Cushion', score: 85, status: 'Healthy' },
    { name: 'Budget Discipline', score: 88, status: 'In Control' },
    { name: 'Income Diversification', score: 75, status: 'Stable' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header and Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/30 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>AI Health Auditor & Predictive Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Financial Health Diagnostic & 30-Day Forecast
          </h2>
          <p className="text-xs md:text-sm text-slate-300">
            Real-time solvency stress test, predictive cash burn rate, and scenario sensitivity for <strong className="text-slate-100">{userName}</strong>.
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Auditing Finances...' : 'Refresh Health Score'}</span>
        </button>
      </div>

      {/* Main Health Diagnostic Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Radial Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Comprehensive Health Score
          </span>

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                className="text-emerald-500 transition-all duration-1000 ease-out"
                fill="transparent"
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                {score}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 mt-0.5">
                Grade {grade}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-100 text-sm">{healthStatus}</h4>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated against {scenarioConfig.name} solvency benchmarks.
            </p>
          </div>
        </div>

        {/* Detailed Core Health Metrics */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Core Solvency Sub-Metrics
            </h3>
            <span className="text-xs text-slate-400 font-mono">Normalized out of 100</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {metrics.map((m) => (
              <div key={m.name} className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{m.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-bold">
                    {m.status}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, m.score)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Index Rating</span>
                  <span className="font-mono font-bold text-slate-300">{m.score}/100</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenChat(`Explain my Financial Health Score of ${score}/100 and how to reach 95+.`)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
            >
              <span>Ask Advisor for detailed score improvement walkthrough</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Strengths & Priority Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Financial Strengths</span>
          </div>
          <div className="space-y-2.5 text-xs text-slate-300">
            {(healthData?.keyStrengths || [
              `Consistent record keeping of all transactions maintained for ${userName}.`,
              `Healthy monthly surplus of ${currency}${currentNetSavings.toLocaleString()} retained.`,
              `Essential needs remain well within manageable bounds.`,
            ]).map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Warnings */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Priority Areas for Attention</span>
          </div>
          <div className="space-y-2.5 text-xs text-slate-300">
            {(healthData?.priorityWarnings || [
              'Discretionary dining and entertainment can be trimmed to accelerate emergency buffer.',
              'Ensure savings are directed into liquid and market-linked instruments rather than sitting idle.',
            ]).map((w, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive "What-If" Sensitivity Simulator */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Interactive "What-If" Financial Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Simulate fluctuating income, dining austerity, or inflation to forecast next month’s cash position
            </p>
          </div>
          
          <button
            onClick={() => {
              setIncomeMultiplier(0);
              setDiscretionaryCut(0);
              setFixedOverheadInflation(0);
            }}
            className="text-xs text-slate-400 hover:text-white underline self-start md:self-auto"
          >
            Reset Simulator Sliders
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Slider 1: Income Multiplier */}
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Income Variation</span>
              <span className={`font-mono font-bold ${incomeMultiplier >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {incomeMultiplier > 0 ? '+' : ''}{incomeMultiplier}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={incomeMultiplier}
              onChange={(e) => setIncomeMultiplier(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-30% (Lean month)</span>
              <span>Baseline</span>
              <span>+30% (Bonus / Client)</span>
            </div>
          </div>

          {/* Slider 2: Discretionary Cut */}
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Cut Discretionary (Wants)</span>
              <span className="font-mono font-bold text-emerald-400">
                -{discretionaryCut}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={discretionaryCut}
              onChange={(e) => setDiscretionaryCut(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (As-is)</span>
              <span>-25% (Moderate cut)</span>
              <span>-50% (Strict austerity)</span>
            </div>
          </div>

          {/* Slider 3: Overhead Inflation */}
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Fixed Expense Inflation</span>
              <span className="font-mono font-bold text-rose-400">
                +{fixedOverheadInflation}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="5"
              value={fixedOverheadInflation}
              onChange={(e) => setFixedOverheadInflation(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0%</span>
              <span>+10% (Rent hike)</span>
              <span>+25% (Extreme)</span>
            </div>
          </div>

        </div>

        {/* Simulator Results Comparison Card */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Simulated Forecast Outcome
            </div>
            <div className="text-sm text-slate-200">
              Projected Net Savings: <strong className="text-emerald-400 font-mono text-base">{currency}{simNetSavings.toLocaleString()}</strong> 
              <span className="mx-2 text-slate-500">|</span>
              New Savings Rate: <strong className="text-white font-mono text-base">{simSavingsRate}%</strong>
            </div>
            <p className="text-[11px] text-slate-400">
              {simNetSavings > currentNetSavings ? (
                `Boosts your monthly wealth accumulation by ${currency}${(simNetSavings - currentNetSavings).toLocaleString()} compared to your baseline!`
              ) : simNetSavings < currentNetSavings ? (
                `Reduces monthly savings by ${currency}${Math.abs(simNetSavings - currentNetSavings).toLocaleString()}. Tighten discretionary spend to compensate.`
              ) : (
                'Currently matching baseline actual numbers.'
              )}
            </p>
          </div>

          <button
            onClick={() => onOpenChat(`I ran a simulation where my income is ${currency}${simIncome} and expenses are ${currency}${simExpenses} (${simSavingsRate}% savings rate). What is your recommendation?`)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consult Bot on this Simulation</span>
          </button>
        </div>

      </div>

    </div>
  );
};
