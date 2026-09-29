import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Trash2, 
  User, 
  ChevronDown, 
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { ChatMessage, Transaction, SavingsGoal, ScenarioConfig } from '../types/finance';

interface AdvisorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currency: string;
  transactions: Transaction[];
  goals: SavingsGoal[];
  scenarioConfig: ScenarioConfig;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
}

export const AdvisorChatModal: React.FC<AdvisorChatModalProps> = ({
  isOpen,
  onClose,
  userName,
  currency,
  transactions,
  goals,
  scenarioConfig,
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const suggestedPrompts = [
    'Analyze my current spending and pinpoint overspending areas',
    `How can I increase my monthly savings by ${currency}10,000?`,
    'Evaluate my 50/30/20 balance and suggest category adjustments',
    'Calculate how long my emergency fund will last without income',
    `Best financial strategies for my active scenario: ${scenarioConfig.name}`,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const handleSuggestedClick = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  // Helper to format basic markdown (bold, bullets, linebreaks)
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bullet point
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200">
            {formatInlineStyles(itemText)}
          </li>
        );
      }
      // Numbered point (e.g. "1. ")
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="ml-2 font-medium text-slate-200 mt-1">
            {formatInlineStyles(line)}
          </div>
        );
      }
      // Blank line
      if (!line.trim()) {
        return <div key={idx} className="h-2"></div>;
      }
      return (
        <p key={idx} className="text-slate-200">
          {formatInlineStyles(line)}
        </p>
      );
    });
  };

  const formatInlineStyles = (text: string) => {
    // Basic regex for **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-emerald-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="h-full w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                Finance Advisor Bot
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CFP Engine
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Personalized for <span className="text-slate-200 font-medium">{userName}</span> • {scenarioConfig.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearChat}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Context Strip */}
        <div className="px-4 py-2 bg-slate-850/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 overflow-x-auto">
          <span className="shrink-0">
            Income: <strong className="text-emerald-400 font-mono">{currency}{totalIncome.toLocaleString()}</strong>
          </span>
          <span className="shrink-0">
            Expenses: <strong className="text-rose-400 font-mono">{currency}{totalExpenses.toLocaleString()}</strong>
          </span>
          <span className="shrink-0">
            Net Surplus: <strong className="text-emerald-400 font-mono">{currency}{netSavings.toLocaleString()}</strong>
          </span>
          <span className="shrink-0">
            Savings Rate: <strong className="text-white font-mono">{savingsRate}%</strong>
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Welcome Card if first message */}
          {messages.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Ready to assist your financial journey</span>
              </div>
              <p className="text-xs text-slate-300">
                Greetings <strong>{userName}</strong>! I am your AI-powered Personal Finance Advisor Bot. I have full context on your income, spending categories, 50/30/20 balance, and savings goals.
              </p>
              <div className="text-[11px] text-slate-400">
                Tap any prompt below or type your custom financial question:
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                <div className="space-y-1.5 leading-relaxed">
                  {renderFormattedText(msg.text)}
                </div>

                <div className="mt-2 text-[10px] opacity-60 text-right">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Advisor Bot is analyzing your financial ledgers...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-yellow-400" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedClick(p)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-colors shrink-0 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Ask your advisor anything about your budget, ${userName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors disabled:opacity-50 disabled:hover:bg-emerald-500"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
