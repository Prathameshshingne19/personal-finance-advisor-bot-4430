import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { MonthlyReportData, Transaction, SavingsGoal, ScenarioConfig } from '../types/finance';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currency: string;
  reportData: MonthlyReportData | null;
  onGenerateReport: (month: string) => Promise<void>;
  isGenerating: boolean;
  scenarioConfig: ScenarioConfig;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  userName,
  currency,
  reportData,
  onGenerateReport,
  isGenerating,
  scenarioConfig,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!reportData) return;
    const text = `
${reportData.reportTitle}
Prepared for: ${reportData.preparedFor} | Scenario: ${reportData.scenario}

EXECUTIVE SUMMARY:
${reportData.executiveSummary}

KEY PERFORMANCE INDICATORS:
- Gross Income: ${reportData.kpis.income}
- Total Outflow: ${reportData.kpis.expenses}
- Net Cashflow: ${reportData.kpis.savings}
- Savings Rate: ${reportData.kpis.savingsRate}

OVERSPENDING CULPRITS:
${reportData.overspendingCulprits.map(c => `• ${c}`).join('\n')}

ACTION PLAN FOR NEXT MONTH:
${reportData.actionPlanNextMonth.map(a => `• ${a}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-850/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Executive Financial Summary Report
              </h3>
              <p className="text-xs text-slate-400">
                Audited monthly financial brief for <span className="text-slate-200 font-semibold">{userName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                onGenerateReport(e.target.value);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
            </select>

            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[75vh]">
          {isGenerating ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-semibold text-white">Synthesizing Executive Monthly Review...</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Aggregating all cash inflows, categorized outlays, and goal advancements into a formal statement for {userName}.
              </p>
            </div>
          ) : reportData ? (
            <div className="space-y-6 text-slate-200">
              
              {/* Document Banner */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Confidential Personal Statement
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">
                      {reportData.reportTitle || `${selectedMonth} Financial Review`}
                    </h2>
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-400">
                    <div>Client: <strong className="text-slate-200">{reportData.preparedFor || userName}</strong></div>
                    <div>Scenario: <span className="font-mono text-emerald-400">{scenarioConfig.name}</span></div>
                  </div>
                </div>
              </div>

              {/* Executive Narrative */}
              <div className="p-4 rounded-xl bg-slate-850/70 border border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Executive Synopsis
                </h4>
                <p className="text-xs md:text-sm leading-relaxed text-slate-300">
                  {reportData.executiveSummary}
                </p>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-medium">Gross Inflow</span>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {reportData.kpis.income}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-medium">Total Outflow</span>
                  <div className="text-base font-bold font-mono text-rose-400 mt-1">
                    {reportData.kpis.expenses}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-medium">Net Savings</span>
                  <div className="text-base font-bold font-mono text-blue-400 mt-1">
                    {reportData.kpis.savings}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-medium">Savings Rate</span>
                  <div className="text-base font-bold font-mono text-amber-400 mt-1">
                    {reportData.kpis.savingsRate}
                  </div>
                </div>
              </div>

              {/* Overspending Culprits & Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Overspending Culprits */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Identified Overspending Areas
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {reportData.overspendingCulprits.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Highlights */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Fiscal Highlights & Wins
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {reportData.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Action Plan Next Month */}
              <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Strategic Financial Directive for Next Month
                </h4>
                <div className="space-y-2">
                  {reportData.actionPlanNextMonth.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-slate-750 border border-slate-700 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p>No report generated yet. Click below to compile your executive review.</p>
              <button
                onClick={() => onGenerateReport(selectedMonth)}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Generate Report
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850/80 flex items-center justify-between text-xs text-slate-400">
          <span>AI-Powered Wealth Architecture for {userName}</span>
          <button
            onClick={() => onGenerateReport(selectedMonth)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            Re-run Analysis
          </button>
        </div>

      </div>
    </div>
  );
};
