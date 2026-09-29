import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- API Routes ----------------

// 1. Advisor Chat Endpoint
app.post('/api/ai/advisor-chat', async (req: Request, res: Response) => {
  try {
    const { message, chatHistory = [], financialContext = {}, scenario = 'salaried' } = req.body;

    const userName = financialContext.userName || 'Prathamesh Shingme';
    const currency = financialContext.currency || '₹';
    const income = financialContext.totalIncome || 0;
    const expenses = financialContext.totalExpenses || 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    const categories = financialContext.categoryBreakdown || [];
    const goals = financialContext.goals || [];

    const systemPrompt = `You are the "Personal Finance Advisor Bot", a high-caliber Certified Financial Planner (CFP) and personal wealth architect built specifically for ${userName}.
Current Financial Context for ${userName}:
- Active Profile / Scenario: ${scenario}
- Total Monthly Income: ${currency}${income.toLocaleString()}
- Total Monthly Expenses: ${currency}${expenses.toLocaleString()}
- Net Monthly Savings: ${currency}${savings.toLocaleString()} (${savingsRate}% savings rate)
- Current Category Expenses: ${JSON.stringify(categories)}
- Active Savings Goals: ${JSON.stringify(goals)}

Guidelines:
1. Always address ${userName} with respectful, motivating, and sharp financial insights.
2. Provide concrete numbers, specific category percentage allocations (e.g., 50/30/20 rule, emergency fund runway), and clear action steps.
3. If ${userName} asks about overspending, pinpoint the exact categories from their data.
4. If in a specific scenario (e.g. Salaried Professional, College Student, Freelancer, Household Manager), adapt your counsel directly to their lifestyle constraints.
5. Format your response cleanly using Markdown with bold highlights, bullet points, and practical takeaways.
6. Provide 2-3 short, relevant follow-up questions or quick prompts ${userName} can ask next.`;

    if (!ai) {
      // Fallback response if API key is not configured
      return res.json({
        reply: `Hello **${userName}**! Based on your current logged finances:
- **Total Income:** ${currency}${income.toLocaleString()}
- **Total Expenses:** ${currency}${expenses.toLocaleString()}
- **Net Cashflow:** ${currency}${savings.toLocaleString()} (${savingsRate}% savings rate)

Your financial posture in the **${scenario}** profile looks ${savingsRate >= 20 ? 'healthy and disciplined' : 'like it needs strategic optimization'}. Keep logging your daily expenses to maintain strict adherence to your savings target!`,
        suggestedPrompts: [
          'How can I optimize my food & entertainment budget?',
          'What is my recommended 50/30/20 allocation?',
          'How do I build a 6-month emergency fund?',
        ],
      });
    }

    const conversationContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...chatHistory.map((item: { sender: string; text: string }) => ({
        role: item.sender === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config: {
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I am reviewing your financial ledgers. Could you please specify your question?';

    // Generate suggested prompts
    let suggestedPrompts = [
      'Where can I cut expenses this month?',
      'How does my savings rate compare to benchmarks?',
      'Suggest an emergency fund plan for my scenario',
    ];

    res.json({
      reply: replyText,
      suggestedPrompts,
    });
  } catch (error: any) {
    console.error('Advisor Chat Error:', error);
    res.status(500).json({ error: error.message || 'Error processing advisor chat' });
  }
});

// 2. AI Budget Generator Endpoint
app.post('/api/ai/generate-budget', async (req: Request, res: Response) => {
  try {
    const { income, expenses, categorySpending = [], scenario = 'salaried', userName = 'Prathamesh Shingme', currency = '₹' } = req.body;

    if (!ai) {
      // Algorithmic fallback
      const totalIncome = Number(income) || 50000;
      const needs = Math.round(totalIncome * 0.5);
      const wants = Math.round(totalIncome * 0.3);
      const savings = Math.round(totalIncome * 0.2);

      return res.json({
        summary: `Personalized budget plan crafted for ${userName} under the ${scenario} framework.`,
        allocation: {
          needs: { target: needs, percentage: 50 },
          wants: { target: wants, percentage: 30 },
          savings: { target: savings, percentage: 20 },
        },
        categoryLimits: [
          { category: 'Housing & Rent', limit: Math.round(totalIncome * 0.25), tip: 'Keep rent under 25-30% of take-home pay.' },
          { category: 'Groceries & Food', limit: Math.round(totalIncome * 0.15), tip: 'Meal prep on weekends to reduce takeout frequency.' },
          { category: 'Transport', limit: Math.round(totalIncome * 0.08), tip: 'Utilize monthly transit passes or carpooling.' },
          { category: 'Utilities & Bills', limit: Math.round(totalIncome * 0.07), tip: 'Audit recurring subscriptions and seasonal energy use.' },
          { category: 'Entertainment & Leisure', limit: Math.round(totalIncome * 0.10), tip: 'Capped discretionary allowance for weekends.' },
          { category: 'Healthcare', limit: Math.round(totalIncome * 0.05), tip: 'Maintain routine checkups and health insurance safety net.' },
          { category: 'Savings & Investments', limit: Math.round(totalIncome * 0.20), tip: 'Automate transfers into high-yield accounts on payday.' },
          { category: 'Miscellaneous', limit: Math.round(totalIncome * 0.05), tip: 'Buffer for unforeseen minor out-of-pocket costs.' },
        ],
        actionableTips: [
          'Set up automatic transfer of 20% on the day salary hits your account.',
          'Review discretionary food delivery expenses which often account for 35% of excess spending.',
          'Build an emergency buffer equivalent to 3-6 months of living expenses.',
        ],
        riskAreas: ['Dining out and spontaneous weekend entertainment', 'Unused software or streaming subscriptions'],
      });
    }

    const prompt = `You are an elite financial advisor analyzing finances for ${userName}.
Scenario: ${scenario}
Total Monthly Income: ${currency}${income}
Current Categorized Spending: ${JSON.stringify(categorySpending)}

Create a detailed, balanced, and realistic budget plan following proven financial strategies tailored to this specific scenario.
Return ONLY valid JSON matching this schema:
{
  "summary": string,
  "allocation": {
    "needs": { "target": number, "percentage": number },
    "wants": { "target": number, "percentage": number },
    "savings": { "target": number, "percentage": number }
  },
  "categoryLimits": [
    { "category": string, "limit": number, "tip": string }
  ],
  "actionableTips": [ string ],
  "riskAreas": [ string ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Budget Generation Error:', error);
    res.status(500).json({ error: error.message || 'Error generating budget plan' });
  }
});

// 3. AI Financial Health Score & Predictive Insights
app.post('/api/ai/financial-health', async (req: Request, res: Response) => {
  try {
    const { income = 0, expenses = 0, categories = [], debts = 0, emergencyFund = 0, scenario = 'salaried', userName = 'Prathamesh Shingme' } = req.body;

    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
    const runwayMonths = expenses > 0 ? Number((emergencyFund / expenses).toFixed(1)) : 0;

    let baseScore = 65;
    if (savingsRate >= 30) baseScore += 20;
    else if (savingsRate >= 20) baseScore += 15;
    else if (savingsRate >= 10) baseScore += 5;
    else if (savingsRate < 0) baseScore -= 25;

    if (runwayMonths >= 6) baseScore += 15;
    else if (runwayMonths >= 3) baseScore += 10;
    else if (runwayMonths < 1) baseScore -= 10;

    baseScore = Math.min(100, Math.max(10, Math.round(baseScore)));

    if (!ai) {
      return res.json({
        score: baseScore,
        grade: baseScore >= 85 ? 'A+' : baseScore >= 75 ? 'A' : baseScore >= 60 ? 'B' : 'C',
        runwayMonths,
        savingsRate: Math.round(savingsRate),
        healthStatus: baseScore >= 75 ? 'Strong Financial Resilience' : 'Moderate - Needs Optimization',
        metrics: [
          { name: 'Savings Velocity', score: Math.min(100, Math.max(10, Math.round(savingsRate * 3))), status: savingsRate >= 20 ? 'Optimal' : 'Low' },
          { name: 'Emergency Cushion', score: Math.min(100, Math.round(runwayMonths * 16.6)), status: runwayMonths >= 3 ? 'Healthy' : 'At Risk' },
          { name: 'Budget Discipline', score: expenses < income ? 85 : 40, status: expenses < income ? 'In Control' : 'Overspending' },
          { name: 'Income Diversification', score: scenario === 'freelancer' ? 70 : 80, status: 'Stable' },
        ],
        keyStrengths: [
          `Consistent income tracking maintained for ${userName}.`,
          `Positive monthly cash surplus of ${netSavings > 0 ? 'good proportion' : 'needs focus'}.`,
        ],
        priorityWarnings: [
          runwayMonths < 3 ? 'Emergency fund provides under 3 months of buffer.' : 'Ensure long-term wealth compounding via equity/index funds.',
          savingsRate < 20 ? 'Savings rate is below the recommended 20% benchmark.' : 'Discretionary spending is well controlled.',
        ],
        predictiveTrend: 'Projected net wealth growth over next 12 months with current trajectory.',
      });
    }

    const prompt = `You are an expert AI financial auditor assessing the financial health for ${userName}.
Financial Snapshot:
- Scenario: ${scenario}
- Monthly Income: ${income}
- Monthly Expenses: ${expenses}
- Net Monthly Savings: ${netSavings} (${savingsRate.toFixed(1)}%)
- Current Emergency Fund: ${emergencyFund} (${runwayMonths} months runway)
- Existing Debts/Liabilities: ${debts}
- Spending Categories: ${JSON.stringify(categories)}

Analyze and return ONLY a JSON response in the following schema:
{
  "score": number (0-100),
  "grade": string (e.g. "A+", "A", "B+", "B", "C"),
  "runwayMonths": number,
  "savingsRate": number,
  "healthStatus": string,
  "metrics": [
    { "name": string, "score": number, "status": string }
  ],
  "keyStrengths": [ string ],
  "priorityWarnings": [ string ],
  "predictiveTrend": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Financial Health Error:', error);
    res.status(500).json({ error: error.message || 'Error auditing financial health' });
  }
});

// 4. AI Structured Monthly Report
app.post('/api/ai/monthly-report', async (req: Request, res: Response) => {
  try {
    const { month = 'Current Month', income = 0, expenses = 0, categories = [], goals = [], scenario = 'salaried', userName = 'Prathamesh Shingme', currency = '₹' } = req.body;

    const netSavings = income - expenses;
    const savingsRatio = income > 0 ? Math.round((netSavings / income) * 100) : 0;

    if (!ai) {
      return res.json({
        reportTitle: `${month} Executive Financial Performance Report`,
        preparedFor: userName,
        scenario,
        executiveSummary: `During this period, ${userName} generated ${currency}${income.toLocaleString()} in income against ${currency}${expenses.toLocaleString()} in total expenses, leaving ${currency}${netSavings.toLocaleString()} in net savings (${savingsRatio}% savings rate).`,
        kpis: {
          income: `${currency}${income.toLocaleString()}`,
          expenses: `${currency}${expenses.toLocaleString()}`,
          savings: `${currency}${netSavings.toLocaleString()}`,
          savingsRate: `${savingsRatio}%`,
        },
        overspendingCulprits: [
          'Dining Out & Weekend Socializing',
          'Impulse Online Shopping',
        ],
        highlights: [
          `Achieved ${savingsRatio}% net savings rate across ${categories.length} tracked categories.`,
          'All utility and mandatory baseline overheads were fulfilled on time.',
        ],
        actionPlanNextMonth: [
          'Set a weekly expense limit of 25% of total budget to avoid month-end deficits.',
          'Transfer at least half of the monthly surplus directly into the savings goal bucket on day 1.',
          'Review discretionary subscriptions and cancel non-essential ones.',
        ],
        goalMilestones: goals.map((g: any) => ({
          name: g.name || 'Goal',
          progress: `${g.current || 0}/${g.target || 0}`,
          recommendation: 'Maintain monthly recurring contribution.',
        })),
      });
    }

    const prompt = `You are a Chief Financial Officer crafting an executive personal financial monthly summary report for ${userName}.
Details:
- Period: ${month}
- Scenario: ${scenario}
- Total Income: ${currency}${income}
- Total Expenses: ${currency}${expenses}
- Net Cash Flow: ${currency}${netSavings}
- Savings Rate: ${savingsRatio}%
- Categories: ${JSON.stringify(categories)}
- Goals: ${JSON.stringify(goals)}

Produce an insightful, highly structured monthly review. Return ONLY JSON conforming to this schema:
{
  "reportTitle": string,
  "preparedFor": string,
  "scenario": string,
  "executiveSummary": string,
  "kpis": {
    "income": string,
    "expenses": string,
    "savings": string,
    "savingsRate": string
  },
  "overspendingCulprits": [ string ],
  "highlights": [ string ],
  "actionPlanNextMonth": [ string ],
  "goalMilestones": [
    { "name": string, "progress": string, "recommendation": string }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Monthly Report Error:', error);
    res.status(500).json({ error: error.message || 'Error generating monthly report' });
  }
});

// ---------------- Vite / Static middleware ----------------
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal Finance Advisor Bot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
