import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// AI Advisor mock endpoint
app.post('/api/advisor/chat', (req, res) => {
  const { message } = req.body;
  
  let reply = "I analyzed your financial metrics. Keep tracking your expenses and stick to your monthly budget goals!";
  const lowerMsg = message?.toLowerCase() || '';

  if (lowerMsg.includes('save') || lowerMsg.includes('saving')) {
    reply = "To improve your savings rate, try automating a transfer of 20% of your income into your savings goals right after payday.";
  } else if (lowerMsg.includes('budget') || lowerMsg.includes('spend')) {
    reply = "Your biggest spending category currently is Housing, followed by Food. Make sure you don't exceed your allocated limits.";
  }

  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Finance Advisor Server running on port ${PORT}`);
});
