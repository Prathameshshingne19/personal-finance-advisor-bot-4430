import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  Tag,
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Transaction, TransactionType, ExpenseNature } from '../types/finance';

interface TransactionLedgerProps {
  userName: string;
  currency: string;
  transactions: Transaction[];
  onOpenQuickAdd: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  userName,
  currency,
  transactions,
  onOpenQuickAdd,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'need' | 'want' | 'saving'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  // Filter & sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchCategory && !matchNotes) return false;
        }

        // Type / Nature filter
        if (typeFilter === 'income' && t.type !== 'income') return false;
        if (typeFilter === 'expense' && t.type !== 'expense') return false;
        if (typeFilter === 'need' && t.nature !== 'need') return false;
        if (typeFilter === 'want' && t.nature !== 'want') return false;
        if (typeFilter === 'saving' && t.nature !== 'saving') return false;

        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, sortBy]);

  // Calculated totals of filtered subset
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Title', 'Category', 'Nature', 'Amount', 'Payment Method', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.nature,
      t.amount,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finance_Ledger_${userName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Financial Ledger & Transaction Journal
          </h2>
          <p className="text-xs text-slate-400">
            Log, categorize, and audit every income stream and expenditure for {userName}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Entry</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Filtered Inflow</span>
          <span className="text-base font-bold font-mono text-emerald-400">
            +{currency}{filteredIncome.toLocaleString()}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Filtered Outflow</span>
          <span className="text-base font-bold font-mono text-rose-400">
            -{currency}{filteredExpense.toLocaleString()}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Net Ledger Delta</span>
          <span className={`text-base font-bold font-mono ${
            filteredIncome - filteredExpense >= 0 ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {filteredIncome - filteredExpense >= 0 ? '+' : ''}{currency}{(filteredIncome - filteredExpense).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, notes, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Nature / Type Pills */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/80 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'income', label: 'Incomes' },
              { id: 'expense', label: 'Expenses' },
              { id: 'need', label: 'Needs' },
              { id: 'want', label: 'Wants' },
              { id: 'saving', label: 'Savings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  typeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700/80 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Transaction & Category</th>
                <th className="py-3 px-4">Nature</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                    <p className="font-medium">No transactions matched your search or filters.</p>
                    <button
                      onClick={onOpenQuickAdd}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold"
                    >
                      Log New Entry
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition-colors group">
                    
                    {/* Title & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === 'income' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tx.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                            {tx.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="font-medium text-slate-300">{tx.category}</span>
                            {tx.notes && (
                              <>
                                <span>•</span>
                                <span className="italic text-slate-400 truncate max-w-[200px]">{tx.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Nature */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        tx.nature === 'need' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : tx.nature === 'want' 
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {tx.nature === 'need' ? 'Essential (Need)' : tx.nature === 'want' ? 'Discretionary (Want)' : 'Savings / Corpus'}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-300 font-mono">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {tx.paymentMethod}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {tx.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold font-mono text-sm ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="py-3 px-4 bg-slate-850/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredTransactions.length} of {transactions.length} total entries</span>
          <span className="font-mono text-slate-300">Audited for {userName}</span>
        </div>
      </div>

    </div>
  );
};
