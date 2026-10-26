import React, { useState } from 'react';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import BudgetPlanner from './components/BudgetPlanner';
import TransactionLedger from './components/TransactionLedger';
import SavingsTracker from './components/SavingsTracker';
import FinancialHealthView from './components/FinancialHealthView';
import AdvisorChatModal from './components/AdvisorChatModal';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'transactions' | 'savings' | 'health'>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onOpenChat={() => setIsChatOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'budget' && <BudgetPlanner />}
        {activeTab === 'transactions' && <TransactionLedger />}
        {activeTab === 'savings' && <SavingsTracker />}
        {activeTab === 'health' && <FinancialHealthView />}
      </main>

      {isChatOpen && <AdvisorChatModal onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}

export default App;
