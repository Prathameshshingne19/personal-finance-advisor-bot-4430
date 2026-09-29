import React from 'react';
import { 
  Bot, 
  Sparkles, 
  PlusCircle, 
  FileText, 
  Activity, 
  RefreshCw,
  Wallet,
  Briefcase,
  GraduationCap,
  Laptop,
  Users,
  Sliders,
  DollarSign
} from 'lucide-react';
import { ScenarioId } from '../types/finance';
import { SCENARIO_CONFIGS } from '../data/defaultScenarios';

interface HeaderProps {
  userName: string;
  currentScenario: ScenarioId;
  currency: string;
  onScenarioChange: (scenario: ScenarioId) => void;
  onCurrencyChange: (currency: string) => void;
  onOpenQuickAdd: () => void;
  onOpenChat: () => void;
  onOpenReport: () => void;
  onOpenHealth: () => void;
  onResetData: () => void;
  healthScore?: number;
  healthGrade?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  currentScenario,
  currency,
  onScenarioChange,
  onCurrencyChange,
  onOpenQuickAdd,
  onOpenChat,
  onOpenReport,
  onOpenHealth,
  onResetData,
  healthScore = 82,
  healthGrade = 'A',
  activeTab,
  setActiveTab
}) => {
  const scenarioConfig = SCENARIO_CONFIGS[currentScenario];

  const getScenarioIcon = (id: ScenarioId) => {
    switch (id) {
      case 'salaried': return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'student': return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'freelancer': return <Laptop className="w-4 h-4 text-amber-400" />;
      case 'household': return <Users className="w-4 h-4 text-purple-400" />;
      default: return <Sliders className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                    Finance Advisor Bot
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AI Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  Tailored Wealth Intelligence for <span className="font-medium text-slate-200">{userName}</span>
                </p>
              </div>
            </div>

            {/* Mobile Chat Trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={onOpenChat}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <Bot className="w-3.5 h-3.5" />
                Chat Bot
              </button>
            </div>
          </div>

          {/* Controls: Scenario, Currency, Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scenario Selector */}
            <div className="relative inline-flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/80">
              <span className="text-xs font-medium text-slate-400 pl-2 pr-1 hidden sm:inline">Scenario:</span>
              <div className="flex items-center gap-1">
                {(['salaried', 'student', 'freelancer', 'household', 'custom'] as ScenarioId[]).map((scId) => {
                  const isActive = currentScenario === scId;
                  const cfg = SCENARIO_CONFIGS[scId];
                  return (
                    <button
                      key={scId}
                      onClick={() => onScenarioChange(scId)}
                      title={cfg.name + ' - ' + cfg.description}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-slate-700 text-white shadow-sm shadow-slate-900 border border-slate-600' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {getScenarioIcon(scId)}
                      <span className="hidden sm:inline">{cfg.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80">
              {['₹', '$', '€', '£'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => onCurrencyChange(curr)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                    currency === curr
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Financial Health Pill */}
            <button
              onClick={onOpenHealth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-xs transition-colors group"
              title="Click to view Financial Health & Predictive Spending"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 font-medium">Health:</span>
              <span className="font-bold text-emerald-400">{healthScore}</span>
              <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {healthGrade}
              </span>
            </button>

            {/* Quick Add CTA */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Entry</span>
            </button>

            {/* Advisor Bot Chat CTA */}
            <button
              onClick={onOpenChat}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>Ask Advisor</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800/80 text-xs">
          <nav className="flex space-x-1 sm:space-x-2">
            {[
              { id: 'overview', label: 'Dashboard & Insights' },
              { id: 'ledger', label: 'Transactions & Ledger' },
              { id: 'budget', label: 'AI Budget Planner' },
              { id: 'savings', label: 'Goal Savings & Runway' },
              { id: 'health', label: 'Financial Health & Forecast' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 pl-2">
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Generate Monthly Financial Executive Report"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Monthly Report</span>
            </button>

            <button
              onClick={onResetData}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Reload Scenario Sample Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
