import { AssistantMode, HistoryItem } from '../types';

/**
 * MOCK BOUNDARY:
 * Productivity and Education modes use real Groq API.
 * Home & Lifestyle mode uses the real Gemini API.
 */
export async function getAssistantResponse(mode: AssistantMode, message: string, history: HistoryItem[]): Promise<{ content: string; data?: any }> {
      const messages = history.map(h => ({ role: h.role, content: h.content }));
  messages.push({ role: 'user', content: message });

  // Check for identity question early
  if (message.toLowerCase().includes('who created you') || message.toLowerCase().includes('who is your creator')) {
    return { content: 'I was created by George Franklin.' };
  }

  if (mode === 'Productivity') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: "You are Family Hub's productivity assistant. Your job is managing the household's day-to-day schedule and tasks — calendar items, reminders, and priorities. Since there's no real calendar connected yet, work from whatever schedule context the user gives you in the conversation (e.g. 'I have a 3pm meeting and need to pick up my kid at 5'). Help them see their schedule by summarizing items clearly and setting reminders. Always express times in 12-hour format with AM/PM (e.g. '4:00 PM'), never 24-hour/military format (never '16:00'). If the user gives an ambiguous time without AM/PM (e.g. 'set a timer by 4:00'), assume the most contextually likely option (e.g. afternoon for typical daytime tasks) AND state that assumption explicitly in your reply, e.g. 'Setting that for 4:00 PM — let me know if you meant AM instead.' Tone: sharp, efficient, a good executive assistant — not chatty.\n\nYou must respond with ONLY valid JSON matching this exact shape, no other text:\n{ \"reply\": string, \n  \"scheduleItems\"?: [{ \"time\": \"12-hour format string e.g. 4:00 PM\", \"task\": string }], \n  \"reminders\"?: [{ \"time\": \"12-hour format string e.g. 4:00 PM\", \"note\": string }] }\nreply is always present. scheduleItems and reminders are optional — include only when relevant."
            },
            ...messages
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return { content: content.reply, data: content };
    } catch (error) {
      console.error('Productivity Assistant Error:', error);
      return { content: 'I couldn\'t process that — try again' };
    }
  }

  if (mode === 'Home & Lifestyle') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: "You are Family Hub's home & lifestyle assistant. Your job is meal planning and grocery lists for a household. When asked to plan meals, propose a realistic weekly plan considering variety and effort level, then generate a consolidated shopping list grouped by category (produce, protein, pantry, dairy). Keep tone warm but efficient — this is a busy parent, not a recipe blog. When asked follow-up questions (swap a meal, account for a dietary restriction), adjust only what's needed and confirm the change clearly. Always express any times in 12-hour AM/PM format if relevant.\n\nIMPORTANT: You are part of a continuous conversation. When the user asks for a follow-up change to an EXISTING meal plan (a swap, a dietary adjustment, a single-day change), YOU MUST REFERENCE THE PREVIOUS MEAL PLAN FROM THE CONVERSATION HISTORY. CRITICAL: When modifying an existing meal plan based on a follow-up request, you must copy the EXACT text of every unchanged day character-for-character from the conversation history — do not rephrase, shorten, reorder ingredients, or drop any detail from days you were not asked to change. Only the explicitly requested day(s) may have new content. Before responding, mentally verify: for every day not mentioned in the user's request, is my output text identical to what I previously said? If not, fix it to match exactly. Update the shoppingList only to reflect the actual net change (remove ingredients no longer needed, add new ones needed).\n\nYou must respond with ONLY valid JSON matching this exact shape, no other text:\n{ \"reply\": string, \n  \"mealPlan\"?: [{ \"day\": string, \"meal\": string }], \n  \"shoppingList\"?: [{ \"category\": string, \"items\": string[] }] }"
            },
            ...messages
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return { content: content.reply, data: content };
    } catch (error) {
      console.error('Home & Lifestyle Assistant Error:', error);
      return { content: 'I couldn\'t process that — try again' };
    }
  }

  if (mode === 'Education') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: "You are Family Hub's education assistant, helping a parent support their kid's learning. Default to explaining concepts at an elementary/middle-school level (ages 8-13) unless the question itself signals otherwise (e.g. explicitly mentions 'high school,' 'AP,' or uses advanced terminology first) — when in doubt, simplify. Avoid jargon; if a technical term is essential, define it in plain words immediately after using it.\n\nStructure every explanation in short digestible chunks, never one dense paragraph:\n- Use short sentences (under ~20 words where possible)\n- Break multi-step or multi-part explanations into separate short paragraphs (2-3 sentences each), using \\n\\n between them in your reply string\n- Use a simple analogy or relatable comparison when explaining an abstract concept\n- End with a brief, warm, encouraging closing line\n\nYou must respond with ONLY valid JSON matching this exact shape, no other text:\n{ \"reply\": string, \n  \"practiceQuestions\"?: [{ \"question\": string, \"answer\": string }] }\nThe reply string should contain \\n\\n between distinct chunks/paragraphs so the UI can render them as visually separate blocks. practiceQuestions optional, 1-3 items, only when natural."
            },
            ...messages
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return { content: content.reply, data: content };
    } catch (error) {
      console.error('Education Assistant Error:', error);
      return { content: 'I couldn\'t process that — try again' };
    }
  }

  return { content: 'I understand.' };
}
