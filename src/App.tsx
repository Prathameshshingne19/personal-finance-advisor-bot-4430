/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionLedger } from './components/TransactionLedger';
import { BudgetPlanner } from './components/BudgetPlanner';
import { SavingsTracker } from './components/SavingsTracker';
import { FinancialHealthView } from './components/FinancialHealthView';
import { AdvisorChatModal } from './components/AdvisorChatModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { QuickAddModal } from './components/QuickAddModal';
import { SCENARIO_CONFIGS } from './data/defaultScenarios';
import { 
  ScenarioId, 
  Transaction, 
  SavingsGoal, 
  BudgetPlan, 
  FinancialHealthData, 
  MonthlyReportData, 
  ChatMessage 
} from './types/finance';

export default function App() {
  const [userName, setUserName] = useState<string>('Prathamesh Shingme');
  const [currentScenario, setCurrentScenario] = useState<ScenarioId>('salaried');
  const [currency, setCurrency] = useState<string>('₹');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Transactions & Goals
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pfa_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SCENARIO_CONFIGS.salaried.sampleTransactions;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('pfa_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SCENARIO_CONFIGS.salaried.sampleGoals;
  });

  // AI Generated Artifacts
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);
  const [healthData, setHealthData] = useState<FinancialHealthData | null>(null);
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);

  // Loading States
  const [isGeneratingBudget, setIsGeneratingBudget] = useState<boolean>(false);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: `Hello **Prathamesh**! I am your AI **Personal Finance Advisor Bot**. I'm actively analyzing your ledger for the **${SCENARIO_CONFIGS.salaried.name}** scenario. How can I assist with your budget, expense reduction, or savings goals today?`,
      timestamp: 'Just now',
    },
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('pfa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pfa_goals', JSON.stringify(goals));
  }, [goals]);

  // Handle Scenario Switch
  const handleScenarioChange = (newScenario: ScenarioId) => {
    setCurrentScenario(newScenario);
    const cfg = SCENARIO_CONFIGS[newScenario];
    setCurrency(cfg.currency || '₹');
    setTransactions(cfg.sampleTransactions);
    setGoals(cfg.sampleGoals);
    setBudgetPlan(null);
    setHealthData(null);
    setReportData(null);

    // Add scenario switch message to chat
    setChatMessages((prev) => [
      ...prev,
      {
        id: `sc-${Date.now()}`,
        sender: 'bot',
        text: `Switched active profile to **${cfg.name}** for **${userName}**.\n\n*${cfg.description}*\n\nRecommended savings rate: **${cfg.recommendedSavingsRate}%** | Emergency buffer: **${cfg.emergencyTargetMonths} months**. Your ledgers and category benchmarks have been calibrated.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Reset to original scenario sample data
  const handleResetData = () => {
    if (window.confirm(`Reset transactions and goals to default ${SCENARIO_CONFIGS[currentScenario].name} preset?`)) {
      const cfg = SCENARIO_CONFIGS[currentScenario];
      setTransactions(cfg.sampleTransactions);
      setGoals(cfg.sampleGoals);
      setBudgetPlan(null);
      setHealthData(null);
      setReportData(null);
    }
  };

  // Add Transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Add Goal Contribution
  const handleAddContribution = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );

    // Also log as an expense under nature: 'saving'
    const targetGoal = goals.find((g) => g.id === goalId);
    if (targetGoal) {
      handleAddTransaction({
        type: 'expense',
        title: `Contribution to ${targetGoal.name}`,
        amount,
        category: 'Emergency Fund',
        nature: 'saving',
        paymentMethod: 'Net Banking',
        date: new Date().toISOString().split('T')[0],
        notes: `Direct goal vault deposit`,
      });
    }
  };

  // Add New Goal
  const handleAddNewGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, goal]);
  };

  // Delete Goal
  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Financial calculations helper
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 1. Generate AI Budget
  const handleGenerateBudget = useCallback(async () => {
    setIsGeneratingBudget(true);
    try {
      const categorySpending: Record<string, number> = {};
      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });

      const response = await fetch('/api/ai/generate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: totalIncome,
          expenses: totalExpenses,
          categorySpending,
          scenario: SCENARIO_CONFIGS[currentScenario].name,
          userName,
          currency,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate AI budget');
      const data = await response.json();
      setBudgetPlan(data);
    } catch (err) {
      console.error('Error generating budget:', err);
    } finally {
      setIsGeneratingBudget(false);
    }
  }, [transactions, totalIncome, totalExpenses, currentScenario, userName, currency]);

  // 2. Refresh Financial Health Score
  const handleRefreshHealth = useCallback(async () => {
    setIsRefreshingHealth(true);
    try {
      const categoryBreakdown = transactions
        .filter((t) => t.type === 'expense')
        .map((t) => ({ category: t.category, amount: t.amount }));

      const emergencyFundTotal = goals
        .filter((g) => g.category === 'emergency')
        .reduce((sum, g) => sum + g.currentAmount, 0);

      const response = await fetch('/api/ai/financial-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: totalIncome,
          expenses: totalExpenses,
          categories: categoryBreakdown,
          emergencyFund: emergencyFundTotal,
          scenario: SCENARIO_CONFIGS[currentScenario].name,
          userName,
        }),
      });

      if (!response.ok) throw new Error('Failed to audit financial health');
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      console.error('Error auditing financial health:', err);
    } finally {
      setIsRefreshingHealth(false);
    }
  }, [transactions, goals, totalIncome, totalExpenses, currentScenario, userName]);

  // 3. Generate Monthly Report
  const handleGenerateReport = useCallback(async (month: string = 'September 2026') => {
    setIsGeneratingReport(true);
    try {
      const categoryBreakdown = transactions
        .filter((t) => t.type === 'expense')
        .map((t) => ({ category: t.category, amount: t.amount }));

      const response = await fetch('/api/ai/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          income: totalIncome,
          expenses: totalExpenses,
          categories: categoryBreakdown,
          goals: goals.map((g) => ({ name: g.name, current: g.currentAmount, target: g.targetAmount })),
          scenario: SCENARIO_CONFIGS[currentScenario].name,
          userName,
          currency,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [transactions, goals, totalIncome, totalExpenses, currentScenario, userName, currency]);

  // 4. Send Message to Advisor Bot
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const categoryBreakdown = transactions
        .filter((t) => t.type === 'expense')
        .map((t) => ({ category: t.category, amount: t.amount }));

      const response = await fetch('/api/ai/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chatHistory: chatMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          financialContext: {
            userName,
            currency,
            totalIncome,
            totalExpenses,
            categoryBreakdown,
            goals: goals.map((g) => ({ name: g.name, current: g.currentAmount, target: g.targetAmount })),
          },
          scenario: SCENARIO_CONFIGS[currentScenario].name,
        }),
      });

      if (!response.ok) throw new Error('Failed to chat with advisor bot');
      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: data.suggestedPrompts,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Advisor chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `I experienced a temporary communication hiccup. Please ask again or adjust your prompt.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Open Chat with custom initial prompt
  const handleOpenChatWithPrompt = (prompt?: string) => {
    setIsChatOpen(true);
    if (prompt) {
      handleSendMessage(prompt);
    }
  };

  // Initial load of budget and health data
  useEffect(() => {
    if (!budgetPlan) {
      handleGenerateBudget();
    }
    if (!healthData) {
      handleRefreshHealth();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Application Header */}
      <Header
        userName={userName}
        currentScenario={currentScenario}
        currency={currency}
        onScenarioChange={handleScenarioChange}
        onCurrencyChange={setCurrency}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenReport={() => {
          setIsReportOpen(true);
          if (!reportData) handleGenerateReport();
        }}
        onOpenHealth={() => setActiveTab('health')}
        onResetData={handleResetData}
        healthScore={healthData?.score || 82}
        healthGrade={healthData?.grade || 'A'}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Port */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            userName={userName}
            currency={currency}
            transactions={transactions}
            goals={goals}
            scenarioConfig={SCENARIO_CONFIGS[currentScenario]}
            onOpenChat={handleOpenChatWithPrompt}
            onOpenReport={() => {
              setIsReportOpen(true);
              if (!reportData) handleGenerateReport();
            }}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            setActiveTab={setActiveTab}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'ledger' && (
          <TransactionLedger
            userName={userName}
            currency={currency}
            transactions={transactions}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlanner
            userName={userName}
            currency={currency}
            transactions={transactions}
            scenarioConfig={SCENARIO_CONFIGS[currentScenario]}
            budgetPlan={budgetPlan}
            onGenerateBudget={handleGenerateBudget}
            isGeneratingBudget={isGeneratingBudget}
            onOpenChat={handleOpenChatWithPrompt}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsTracker
            userName={userName}
            currency={currency}
            goals={goals}
            transactions={transactions}
            scenarioConfig={SCENARIO_CONFIGS[currentScenario]}
            onAddContribution={handleAddContribution}
            onAddNewGoal={handleAddNewGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeTab === 'health' && (
          <FinancialHealthView
            userName={userName}
            currency={currency}
            transactions={transactions}
            goals={goals}
            scenarioConfig={SCENARIO_CONFIGS[currentScenario]}
            healthData={healthData}
            onRefreshHealth={handleRefreshHealth}
            isRefreshing={isRefreshingHealth}
            onOpenChat={handleOpenChatWithPrompt}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Personal Finance Advisor Bot • Designed for <strong className="text-slate-400">{userName}</strong></span>
          <span className="font-mono text-[11px] text-slate-600">Enterprise AI Engine • Multi-Scenario Wealth Architecture</span>
        </div>
      </footer>

      {/* Floating Action Button for AI Advisor Bot */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group ring-2 ring-emerald-400/40"
        title="Chat with Personal Finance Advisor Bot"
      >
        <div className="relative">
          <span className="animate-ping absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative flex h-2.5 w-2.5 rounded-full bg-white"></span>
        </div>
        <span className="text-xs font-extrabold pr-1 tracking-tight">Ask Advisor</span>
      </button>

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        currency={currency}
        onAddTransaction={handleAddTransaction}
        userName={userName}
      />

      <AdvisorChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userName={userName}
        currency={currency}
        transactions={transactions}
        goals={goals}
        scenarioConfig={SCENARIO_CONFIGS[currentScenario]}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
        onClearChat={() => setChatMessages([])}
      />

      <MonthlyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        userName={userName}
        currency={currency}
        reportData={reportData}
        onGenerateReport={handleGenerateReport}
        isGenerating={isGeneratingReport}
        scenarioConfig={SCENARIO_CONFIGS[currentScenario]}
      />

    </div>
  );
}
