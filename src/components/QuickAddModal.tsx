import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Tag, 
  CreditCard, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Transaction, TransactionType, ExpenseNature, PaymentMethod } from '../types/finance';
import { DEFAULT_CATEGORIES } from '../data/defaultScenarios';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  userName: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAddTransaction,
  userName,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries & Food');
  const [nature, setNature] = useState<ExpenseNature>('need');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState('2026-09-29');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Auto-switch nature when category changes
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const found = DEFAULT_CATEGORIES.find((c) => c.name === newCat);
    if (found) {
      setNature(found.type as ExpenseNature);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    onAddTransaction({
      type,
      title: title.trim(),
      amount: Number(amount),
      category: type === 'income' ? (category === 'Groceries & Food' ? 'Salary' : category) : category,
      nature: type === 'income' ? 'need' : nature,
      paymentMethod,
      date,
      notes: notes.trim() || undefined,
    });

    // Reset fields
    setTitle('');
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-850/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Record Financial Entry</h3>
              <p className="text-[11px] text-slate-400">Journaling for {userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Groceries & Food');
                setNature('need');
              }}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Expense Outflow</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salary');
                setNature('need');
              }}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Income Inflow</span>
            </button>
          </div>

          {/* Title and Amount */}
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-medium">Description / Payee</label>
              <input
                type="text"
                required
                placeholder={type === 'income' ? 'e.g. Monthly Salary, Freelance Invoice #102' : 'e.g. Organic Groceries, Weekend Dinner'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium">Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Category & Nature */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                {type === 'income' ? (
                  <>
                    <option value="Salary">Salary Credit</option>
                    <option value="Client Payout">Client Payout</option>
                    <option value="Allowance">Allowance / Stipend</option>
                    <option value="Investments">Investment Dividend / ROI</option>
                    <option value="Bonus">Bonus & Incentives</option>
                    <option value="Other">Other Inflow</option>
                  </>
                ) : (
                  DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>

            {type === 'expense' ? (
              <div>
                <label className="text-slate-300 font-medium">Budget Nature (50/30/20)</label>
                <select
                  value={nature}
                  onChange={(e) => setNature(e.target.value as ExpenseNature)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="need">Essential Need (50%)</option>
                  <option value="want">Discretionary Want (30%)</option>
                  <option value="saving">Savings / Investment (20%)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="text-slate-300 font-medium">Inflow Class</label>
                <div className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-emerald-400 font-semibold">
                  Income Inflow
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-slate-300 font-medium">Payment Channel</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-1">
              {(['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-1.5 px-2 rounded-lg font-medium text-[11px] border transition-colors ${
                    paymentMethod === m
                      ? 'bg-slate-700 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-300 font-medium">Notes & Tags (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Split with roomie, Project X milestone"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Save Transaction
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
