import React, { useState } from 'react';
import { 
  PiggyBank, 
  PlusCircle, 
  ShieldCheck, 
  Calendar, 
  Target, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Plus
} from 'lucide-react';
import { SavingsGoal, Transaction, ScenarioConfig } from '../types/finance';

interface SavingsTrackerProps {
  userName: string;
  currency: string;
  goals: SavingsGoal[];
  transactions: Transaction[];
  scenarioConfig: ScenarioConfig;
  onAddContribution: (goalId: string, amount: number) => void;
  onAddNewGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsTracker: React.FC<SavingsTrackerProps> = ({
  userName,
  currency,
  goals,
  transactions,
  scenarioConfig,
  onAddContribution,
  onAddNewGoal,
  onDeleteGoal,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  // New goal form state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('2027-06-30');
  const [newGoalCategory, setNewGoalCategory] = useState<'emergency' | 'investment' | 'purchase' | 'travel'>('emergency');
  const [newGoalContribution, setNewGoalContribution] = useState('');

  // Compute total monthly expenses
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Essential monthly needs
  const essentialExpenses = transactions
    .filter((t) => t.type === 'expense' && t.nature === 'need')
    .reduce((sum, t) => sum + t.amount, 0) || Math.round(monthlyExpenses * 0.6);

  // Total saved in emergency goals
  const emergencyGoals = goals.filter((g) => g.category === 'emergency');
  const emergencyFundBalance = emergencyGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Runway in months
  const emergencyRunwayMonths = essentialExpenses > 0 
    ? Number((emergencyFundBalance / essentialExpenses).toFixed(1))
    : 0;

  const targetRunwayMonths = scenarioConfig.emergencyTargetMonths || 6;
  const isRunwayAdequate = emergencyRunwayMonths >= targetRunwayMonths;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !depositAmount || Number(depositAmount) <= 0) return;
    onAddContribution(selectedGoalId, Number(depositAmount));
    setDepositAmount('');
    setSelectedGoalId(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget || Number(newGoalTarget) <= 0) return;

    onAddNewGoal({
      name: newGoalName.trim(),
      targetAmount: Number(newGoalTarget),
      currentAmount: Number(newGoalCurrent) || 0,
      targetDate: newGoalDate,
      category: newGoalCategory,
      monthlyContribution: Number(newGoalContribution) || Math.round(Number(newGoalTarget) / 12),
      color: newGoalCategory === 'emergency' ? '#3b82f6' : newGoalCategory === 'investment' ? '#10b981' : '#ec4899',
    });

    // Reset form
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('');
    setNewGoalContribution('');
    setShowAddGoalModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-400" />
            Goal-Based Savings & Emergency Runway
          </h2>
          <p className="text-xs text-slate-400">
            Dedicated capital vaults and liquidity buffers calibrated for {userName}
          </p>
        </div>

        <button
          onClick={() => setShowAddGoalModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Emergency Fund Runway Calculator Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Liquidity Stress Test</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white">
              Emergency Fund Runway: <span className={isRunwayAdequate ? 'text-emerald-400' : 'text-amber-400'}>{emergencyRunwayMonths} Months</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Based on essential baseline expenses of <strong className="text-slate-100">{currency}{essentialExpenses.toLocaleString()}/month</strong>, your current emergency reserve of <strong className="text-emerald-400">{currency}{emergencyFundBalance.toLocaleString()}</strong> will sustain you for {emergencyRunwayMonths} months without income.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Scenario Benchmark</div>
              <div className="text-xl font-bold text-white font-mono">{targetRunwayMonths} Months</div>
              <div className="text-[10px] text-slate-400 font-mono">({scenarioConfig.name})</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Status</div>
              <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                isRunwayAdequate 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isRunwayAdequate ? 'Resilient' : 'Needs Top-Up'}
              </div>
            </div>
          </div>

        </div>

        {/* Visual Runway Progress */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Buffer Progress ({emergencyFundBalance.toLocaleString()} / {(essentialExpenses * targetRunwayMonths).toLocaleString()})</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {Math.min(100, Math.round((emergencyFundBalance / (essentialExpenses * targetRunwayMonths || 1)) * 100))}% of Target
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isRunwayAdequate ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.round((emergencyFundBalance / (essentialExpenses * targetRunwayMonths || 1)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div 
              key={goal.id} 
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: `${goal.color || '#3b82f6'}20`, color: goal.color || '#3b82f6', border: `1px solid ${goal.color || '#3b82f6'}40` }}
                    >
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {goal.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {goal.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 text-xs transition-opacity p-1"
                    title="Remove Goal"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-white">
                      {currency}{goal.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      of {currency}{goal.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: goal.color || '#10b981'
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{progress}% Achieved</span>
                    <span>{currency}{remaining.toLocaleString()} remaining</span>
                  </div>
                </div>

                {/* Contribution details */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Target Date:</span>
                    <span className="text-slate-300 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {goal.targetDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly Target:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {currency}{goal.monthlyContribution.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Deposit Action */}
              <div className="mt-5">
                <button
                  onClick={() => setSelectedGoalId(goal.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deposit Funds</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {selectedGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
              Add Savings Contribution
            </h3>
            <p className="text-xs text-slate-300">
              Log an amount deposited into <strong className="text-white">{goals.find(g => g.id === selectedGoalId)?.name}</strong>:
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">Contribution Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoalId(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Create New Savings Goal
              </h3>
              <button
                onClick={() => setShowAddGoalModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House Down Payment, Wedding Fund"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Target Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 200000"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Already Saved ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Goal Category</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="emergency">Emergency Fund</option>
                    <option value="investment">Wealth & Investment</option>
                    <option value="purchase">Asset / Gadget Purchase</option>
                    <option value="travel">Travel & Experience</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Monthly Contribution Target ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={newGoalContribution}
                  onChange={(e) => setNewGoalContribution(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
