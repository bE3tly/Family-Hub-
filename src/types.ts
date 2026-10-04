export type AssistantMode = 'Productivity' | 'Home & Lifestyle' | 'Education';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AssistantMode;
  data?: any;
}

export interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';
