export type ThemeMode = 'dark' | 'light';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type ChatHistory = Message[];
