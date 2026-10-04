import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
  },
});

app.post('/api/assistant', async (req, res) => {
  const { message, mode } = req.body;
  console.log('Received message:', message, 'Mode:', mode);
  
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY is not configured correctly.');
    }
    
    let systemInstruction = '';
    let responseSchema: any = {};

    if (mode === 'Home & Lifestyle') {
      systemInstruction = "You are Family Hub's home & lifestyle assistant. Your job is meal planning and grocery lists for a household. When asked to plan meals, propose a realistic weekly plan considering variety and effort level, then generate a consolidated shopping list grouped by category (produce, protein, pantry, dairy). Keep tone warm but efficient — this is a busy parent, not a recipe blog. When asked follow-up questions (swap a meal, account for a dietary restriction), adjust only what's needed and confirm the change clearly. Always express times in 12-hour format with AM/PM (e.g. '4:00 PM'), never 24-hour/military format (never '16:00'). If the user gives an ambiguous time without AM/PM, assume the most contextually likely option AND state that assumption explicitly in your reply.";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          mealPlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, time: { type: Type.STRING, description: '12-hour format string e.g. 4:00 PM' }, meal: { type: Type.STRING } } } },
          shoppingList: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
        },
        required: ['reply'],
      };
    } else {
      throw new Error('Unsupported mode.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });
    
    clearTimeout(timeout);
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Gemini API Server Error:', error);
    res.status(500).json({ error: 'I couldn\'t process that — try again', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

startServer();
