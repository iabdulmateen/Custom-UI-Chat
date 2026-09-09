'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2,
  Download,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Sun,
  Moon,
  Check,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { SessionSidebar } from './SessionSidebar';
import { cn } from '@/lib/utils';
import type { Message, ThemeMode, ChatSession } from '@/lib/types';
import {
  isSpeechSynthesisSupported,
  stripMarkdownForSpeech,
  getPreferredSpeechVoice,
} from '@/lib/speech';

const SESSIONS_STORAGE_KEY = 'custom_chat_sessions_v2';
const ACTIVE_SESSION_KEY = 'custom_chat_active_session_id_v2';
const THEME_STORAGE_KEY = 'custom_chat_theme_mode_v1';
const SIDEBAR_COLLAPSED_KEY = 'custom_chat_sidebar_collapsed_v1';
const LEGACY_STORAGE_KEY = 'custom_chat_history_v1';
const DEFAULT_SESSION_ID = 'session-default-1';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-init-1',
    role: 'ai',
    content: `### Welcome to the **Architecture & Systems Command Console**
I am your dedicated Software Architect Assistant. I can help analyze distributed systems, refactor complex async flows, model database schemas, and evaluate design patterns.

Here is a quick snapshot of what we can explore:
- **Distributed Systems:** CQRS, Event-Sourcing, Saga pattern, Kafka streams.
- **Frontend Architecture:** SSR hydration boundary strategies, state machines, micro-frontends.
- **Database & Storage:** PostgreSQL partitioning, Redis cache invalidation, vector indices.

\`\`\`typescript
// Example: Safe SSR LocalStorage Synchronization Pattern
export function useSafeLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setValue(JSON.parse(saved));
    } catch (e) {
      console.warn("Storage sync failed", e);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  return { value, setValue, isHydrated };
}
\`\`\`

Ask a question or select one of the starter prompts below to begin.`,
    timestamp: 'Just now',
  },
];

const SIMULATED_RESPONSES: Record<string, string> = {
  microservices: `### Microservices Event Bus Pattern Architecture

In an event-driven microservices architecture, services communicate asynchronously via a message broker (such as Kafka, RabbitMQ, or AWS EventBridge).

#### Key Components Comparison
| Component | Primary Role | Latency Profile | Guarantee Level |
| :--- | :--- | :--- | :--- |
| **Ingress Gateway** | Auth & Protocol Translation | < 5ms | At-least-once |
| **Kafka Broker** | Distributed Commit Log | < 15ms | Exactly-once (Kafka Streams) |
| **Projection Workers** | Read Model Materialization | Eventual (~100ms) | At-least-once with idempotent upserts |

#### Production Implementation Sample

\`\`\`typescript
import { EventEmitter } from 'events';

interface DomainEvent<T = unknown> {
  id: string;
  aggregateId: string;
  type: string;
  payload: T;
  occurredAt: number;
}

export class DistributedEventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();

  public subscribe<T>(eventType: string, handler: (event: DomainEvent<T>) => Promise<void>): () => void {
    const list = this.handlers.get(eventType) || [];
    list.push(handler as (event: DomainEvent) => Promise<void>);
    this.handlers.set(eventType, list);

    return () => {
      const updated = (this.handlers.get(eventType) || []).filter((h) => h !== handler);
      this.handlers.set(eventType, updated);
    };
  }

  public async publish<T>(event: DomainEvent<T>): Promise<void> {
    const subscribers = this.handlers.get(event.type) || [];
    await Promise.allSettled(
      subscribers.map((fn) =>
        fn(event).catch((err) => {
          console.error(\`Failed event execution [\${event.id}]:\`, err);
        })
      )
    );
  }
}
\`\`\`

- **Resilience:** Wrap subscribers in a Circuit Breaker to prevent cascading downstream failures.
- **Observability:** Propagate \`traceId\` and \`correlationId\` in domain event headers.`,

  hydration: `### Eliminating Next.js SSR Hydration Mismatches with LocalStorage

When rendering client-persisted state in Next.js App Router, a hydration error occurs if the server-rendered HTML diverges from the initial client render tree before mounting.

#### Recommended Architectural Fixes:
1. **Deferred Client Hydration Flag:** Delay reading \`localStorage\` until the \`useEffect\` lifecycle has fired.
2. **Mount Skeletons:** Render an empty state or identical placeholder while \`isMounted === false\`.
3. **Cookie-Based Synchronization:** For critical layouts, store state in HTTP cookies so the Next.js Server Component can read it during SSR.

\`\`\`tsx
'use client';

import { useState, useEffect } from 'react';

export function PersistentClientWrapper({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Only executed on the client after DOM reconciliation
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Matches the static HTML pre-rendered on the server
    return <div className="animate-pulse bg-zinc-900 rounded-lg h-32 w-full" />;
  }

  return <>{children}</>;
}
\`\`\``,

  redis: `### Distributed Rate Limiter: Redis Token Bucket Algorithm

The **Token Bucket** algorithm allows burst traffic while enforcing an average rate limit over time.

\`\`\`typescript
import Redis from 'ioredis';

export class TokenBucketRateLimiter {
  constructor(
    private redis: Redis,
    private capacity: number = 100,
    private refillRatePerSec: number = 10
  ) {}

  async isAllowed(clientId: string): Promise<{ allowed: boolean; remainingTokens: number }> {
    const key = \`rate_limit:\${clientId}\`;
    const now = Date.now();

    // Atomic Lua script execution ensures no race conditions across worker nodes
    const luaScript = \`
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      
      local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
      local tokens = tonumber(data[1])
      local lastRefill = tonumber(data[2])
      
      if not tokens then
        tokens = capacity
        lastRefill = now
      else
        local delta = math.max(0, (now - lastRefill) / 1000)
        tokens = math.min(capacity, tokens + (delta * refillRate))
        lastRefill = now
      end
      
      if tokens >= 1 then
        tokens = tokens - 1
        redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
        redis.call('EXPIRE', key, 3600)
        return {1, tokens}
      else
        return {0, tokens}
      end
    \`;

    const result = (await this.redis.eval(
      luaScript,
      1,
      key,
      this.capacity,
      this.refillRatePerSec,
      now
    )) as [number, number];

    return {
      allowed: result[0] === 1,
      remainingTokens: Math.floor(result[1]),
    };
  }
}
\`\`\``,
};

function createDefaultSession(messages: Message[] = INITIAL_MESSAGES): ChatSession {
  return {
    id: DEFAULT_SESSION_ID,
    title: 'Architecture & Systems Console',
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createNewSession(): ChatSession {
  const now = Date.now();
  return {
    id: `session-${now}`,
    title: 'New Conversation',
    messages: INITIAL_MESSAGES,
    createdAt: now,
    updatedAt: now,
  };
}

function deriveSessionTitle(userPrompt: string): string {
  const cleaned = userPrompt.trim().replace(/^#+\s*/, '').replace(/\n+/g, ' ');
  if (cleaned.length <= 36) return cleaned;
  return `${cleaned.slice(0, 36).trim()}...`;
}

export const ChatInterface: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>(DEFAULT_SESSION_ID);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check speech synthesis support on mount & clean up on unmount
  useEffect(() => {
    setSpeechSupported(isSpeechSynthesisSupported());

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Safe client-side hydration from LocalStorage for sessions, active ID, theme, and sidebar
  useEffect(() => {
    try {
      // Sync theme
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme: ThemeMode = prefersDark ? 'dark' : 'light';
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
      }

      // Sync sidebar collapsed state
      const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (savedCollapsed !== null) {
        setIsCollapsedDesktop(savedCollapsed === 'true');
      }

      // Sync chat sessions
      const savedSessionsRaw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      let loadedSessions: ChatSession[] = [];
      if (savedSessionsRaw) {
        try {
          const parsed = JSON.parse(savedSessionsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedSessions = parsed;
          }
        } catch (e) {
          console.warn('Failed to parse saved sessions', e);
        }
      }

      // Fallback: check legacy single-session storage for backwards compatibility
      if (loadedSessions.length === 0) {
        const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacySaved) {
          try {
            const parsedLegacy = JSON.parse(legacySaved);
            if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
              loadedSessions = [createDefaultSession(parsedLegacy)];
            }
          } catch {
            // ignore
          }
        }
      }

      if (loadedSessions.length === 0) {
        loadedSessions = [createDefaultSession()];
      }

      setSessions(loadedSessions);

      // Sync active session ID
      const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedActiveId && loadedSessions.some((s) => s.id === savedActiveId)) {
        setActiveSessionId(savedActiveId);
      } else {
        setActiveSessionId(loadedSessions[0].id);
      }
    } catch (err) {
      console.error('Failed to initialize sessions from storage:', err);
      const initial = [createDefaultSession()];
      setSessions(initial);
      setActiveSessionId(initial[0].id);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      } catch (err) {
        console.warn('Failed to save theme preference:', err);
      }
      return next;
    });
  };

  const toggleCollapseDesktop = () => {
    setIsCollapsedDesktop((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch (e) {
        console.warn('Failed to save sidebar collapse state', e);
      }
      return next;
    });
  };

  // Save sessions to LocalStorage whenever sessions change after hydration
  useEffect(() => {
    if (isHydrated && sessions.length > 0) {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      } catch (err) {
        console.error('Failed to sync sessions to localStorage:', err);
      }
    }
  }, [sessions, isHydrated]);

  // Save active session ID to LocalStorage
  useEffect(() => {
    if (isHydrated && activeSessionId) {
      try {
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
      } catch (err) {
        console.error('Failed to sync active session ID to localStorage:', err);
      }
    }
  }, [activeSessionId, isHydrated]);

  // Derive current active session and its messages
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createDefaultSession();
  const messages = activeSession ? activeSession.messages : INITIAL_MESSAGES;

  // Auto-scroll on new messages or during generation
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isHydrated) {
      scrollToBottom('smooth');
    }
  }, [messages, isGenerating, isHydrated]);

  const generateSimulatedResponse = async (userPrompt: string): Promise<string> => {
    const lower = userPrompt.toLowerCase();
    let content = '';

    if (lower.includes('microservice') || lower.includes('event bus') || lower.includes('kafka')) {
      content = SIMULATED_RESPONSES.microservices;
    } else if (lower.includes('hydration') || lower.includes('ssr') || lower.includes('next.js') || lower.includes('mismatch')) {
      content = SIMULATED_RESPONSES.hydration;
    } else if (lower.includes('redis') || lower.includes('rate limit') || lower.includes('token bucket')) {
      content = SIMULATED_RESPONSES.redis;
    } else {
      content = `### Architectural Analysis: "${userPrompt}"

Based on the parameters provided, here is a structured evaluation of the system requirements:

#### Key Design Considerations
1. **Separation of Concerns:** Ensure data mutation paths are isolated from high-throughput query channels.
2. **Idempotency & Concurrency:** Implement optimistic locking or distributed leasing to mitigate race conditions.
3. **Data Partitioning:** Evaluate hash vs. range sharding strategies as telemetry volume scales.

\`\`\`typescript
// Architectural Scaffold Pattern
export interface SystemService<TConfig, TContext> {
  readonly serviceName: string;
  initialize(config: TConfig): Promise<void>;
  execute(context: TContext): Promise<{ success: boolean; latencyMs: number }>;
  healthCheck(): Promise<{ isHealthy: boolean; uptime: number }>;
}
\`\`\`

#### Operational Trade-offs Matrix
| Strategy | Throughput | Consistency | Complexity |
| :--- | :--- | :--- | :--- |
| **Synchronous RPC (gRPC)** | High | Immediate | Low-Medium |
| **Event-Driven Broker (Kafka)** | Ultra-High | Eventual | High |
| **Hybrid CQRS** | High | Configurable | High |

Would you like to drill down into the database schema, idempotency tokens, or security threat modeling for this architecture?`;
    }

    return content;
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isGenerating) return;

    const currentSessionId = activeSessionId;
    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const isDefaultTitle =
            s.title === 'New Conversation' ||
            (s.title === 'Architecture & Systems Console' && s.messages.length <= 1);
          const newTitle = isDefaultTitle ? deriveSessionTitle(textToSend) : s.title;
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage],
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );
    setInput('');
    setIsGenerating(true);

    // Artificial realistic latency to highlight loading skeleton
    setTimeout(async () => {
      const aiResponseContent = await generateSimulatedResponse(textToSend);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: aiResponseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMessage],
              updatedAt: Date.now(),
            };
          }
          return s;
        })
      );
      setIsGenerating(false);
    }, 900);
  };

  const handleToggleSpeech = (messageId: string, content: string) => {
    if (!isSpeechSynthesisSupported()) return;

    // If currently speaking this message, toggle off
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
      setSpeakingMessageId(null);
      return;
    }

    // Cancel any ongoing speech before starting a new utterance
    window.speechSynthesis.cancel();

    const cleanText = stripMarkdownForSpeech(content);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = getPreferredSpeechVoice();
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn('Speech synthesis utterance error:', event);
      }
      setSpeakingMessageId(null);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleRegenerate = async () => {
    if (isGenerating || messages.length === 0) return;

    // Stop active speech if regenerating
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);

    // Find the latest AI message and its associated user message
    const lastAiIdx = messages.map((m) => m.role).lastIndexOf('ai');
    if (lastAiIdx === -1) return;

    // Find the closest preceding user prompt
    let lastUserPrompt = 'Refined Architectural Exploration';
    for (let i = lastAiIdx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserPrompt = messages[i].content;
        break;
      }
    }

    setIsGenerating(true);
    const currentSessionId = activeSessionId;

    setTimeout(async () => {
      const regeneratedContent = await generateSimulatedResponse(lastUserPrompt);
      const updatedAiMessage: Message = {
        ...messages[lastAiIdx],
        content:
          regeneratedContent +
          `\n\n> *Regenerated on ${new Date().toLocaleTimeString()} with alternative synthesis.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            const copy = [...s.messages];
            copy[lastAiIdx] = updatedAiMessage;
            return {
              ...s,
              messages: copy,
              updatedAt: Date.now(),
            };
          }
          return s;
        })
      );
      setIsGenerating(false);
    }, 850);
  };

  const handleSelectSession = (id: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setActiveSessionId(id);
  };

  const handleNewSession = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (idToDelete: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);

    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== idToDelete);
      if (remaining.length === 0) {
        const fresh = createNewSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === idToDelete) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameSession = (idToRename: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === idToRename ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  const handleClearHistory = () => {
    // Open in-app dialog directly (window.confirm is blocked in iframes)
    setShowResetConfirm(true);
  };

  const confirmResetConversation = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: INITIAL_MESSAGES, updatedAt: Date.now() }
          : s
      )
    );
    setShowResetConfirm(false);
    setShowResetToast(true);
    setTimeout(() => {
      setShowResetToast(false);
    }, 2800);
  };

  const handleExportChat = () => {
    const markdownContent = messages
      .map((m) => `### [${m.role.toUpperCase()}] - ${m.timestamp}\n\n${m.content}\n\n---`)
      .join('\n\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = (activeSession.title || 'architecture-session')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    a.download = `${safeTitle}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Find index of the latest AI message
  const lastAiIndex = messages.map((m) => m.role).lastIndexOf('ai');
  const isDark = theme === 'dark';

  return (
    <div
      id="chat-root-container"
      className={cn(
        'relative flex h-full min-h-screen w-full flex-col font-sans transition-colors duration-200 antialiased',
        isDark
          ? 'dark bg-zinc-950 text-zinc-100 selection:bg-indigo-600/30'
          : 'bg-slate-50 text-slate-900 selection:bg-indigo-500/20'
      )}
    >
      {/* Top Cockpit Navigation Bar */}
      <header
        id="cockpit-header"
        className={cn(
          'sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b px-2.5 sm:px-6 backdrop-blur-xl transition-colors duration-200',
          isDark
            ? 'border-zinc-800/80 bg-zinc-950/85 text-zinc-100'
            : 'border-slate-200/80 bg-white/85 text-slate-900 shadow-sm'
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            id="btn-toggle-sidebar"
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                toggleCollapseDesktop();
              } else {
                setSidebarOpenMobile((prev) => !prev);
              }
            }}
            className={cn(
              'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border transition',
              isDark
                ? 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
            title="Toggle Sessions Sidebar"
            aria-label="Toggle Sessions Sidebar"
          >
            {isCollapsedDesktop ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-md shadow-indigo-600/20">
              <Terminal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1
                  className={cn(
                    'text-xs sm:text-sm md:text-base font-semibold tracking-tight truncate',
                    isDark ? 'text-zinc-100' : 'text-slate-900'
                  )}
                >
                  Architect Console
                </h1>
                <span className="hidden xs:inline-flex sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-emerald-500 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p
                className={cn(
                  'hidden md:block text-[11px] truncate',
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                )}
                title={activeSession.title}
              >
                Thread: {activeSession.title || 'Distributed Systems'} ({messages.length} msgs)
              </p>
            </div>
          </div>
        </div>

        {/* Console Action Tools & Theme Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            id="btn-header-new-chat"
            type="button"
            onClick={handleNewSession}
            className={cn(
              'flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border h-8 sm:h-9 px-2 sm:px-3 text-xs font-medium transition duration-150 cursor-pointer',
              isDark
                ? 'border-indigo-500/30 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs hover:bg-indigo-100'
            )}
            title="Start a new chat session"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Thread</span>
          </button>

          {/* Light/Dark Mode Switcher */}
          <button
            id="btn-theme-toggle"
            type="button"
            onClick={toggleTheme}
            className={cn(
              'flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border h-8 sm:h-9 px-2 sm:px-3 text-xs font-medium transition duration-150',
              isDark
                ? 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-amber-300'
                : 'border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-100 hover:text-indigo-600'
            )}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <button
            id="btn-export-chat"
            type="button"
            onClick={handleExportChat}
            className={cn(
              'flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border h-8 sm:h-9 px-2 sm:px-3 text-xs font-medium transition',
              isDark
                ? 'border-zinc-800/90 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                : 'border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900'
            )}
            title="Export conversation as Markdown"
          >
            <Download className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            id="btn-clear-chat"
            type="button"
            onClick={handleClearHistory}
            className={cn(
              'flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border h-8 sm:h-9 px-2 sm:px-3 text-xs font-medium transition cursor-pointer',
              isDark
                ? 'border-zinc-800/90 bg-zinc-900/60 text-zinc-300 hover:border-rose-900/60 hover:bg-rose-950/30 hover:text-rose-400'
                : 'border-slate-200 bg-white text-slate-700 shadow-xs hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
            )}
            title="Clear conversation history"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="relative flex flex-1 overflow-hidden min-w-0">
        {/* Collapsible Multi-Session Sidebar */}
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          isOpenMobile={sidebarOpenMobile}
          onCloseMobile={() => setSidebarOpenMobile(false)}
          isCollapsedDesktop={isCollapsedDesktop}
          onToggleCollapseDesktop={toggleCollapseDesktop}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Central Chat Stream & Input Cockpit */}
        <main className="relative flex flex-1 flex-col overflow-hidden min-w-0 w-full">
          {/* Messages Stream Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 sm:px-6 md:px-8 space-y-4 sm:space-y-6 min-w-0 w-full"
          >
            <div className="mx-auto max-w-4xl w-full min-w-0 space-y-4 sm:space-y-6">
              {!isHydrated ? (
                // Hydration placeholder skeleton
                <div className="space-y-4 animate-pulse">
                  <div
                    className={cn(
                      'h-20 w-3/4 rounded-2xl',
                      isDark ? 'bg-zinc-900/60' : 'bg-slate-200/70'
                    )}
                  />
                  <div
                    className={cn(
                      'h-32 w-full rounded-2xl',
                      isDark ? 'bg-zinc-900/60' : 'bg-slate-200/70'
                    )}
                  />
                </div>
              ) : (
                messages.map((message, idx) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isLatestAi={idx === lastAiIndex}
                    onRegenerate={handleRegenerate}
                    isGenerating={isGenerating}
                    theme={theme}
                    isSpeaking={speakingMessageId === message.id}
                    onToggleSpeech={handleToggleSpeech}
                    isSpeechSupported={speechSupported}
                  />
                ))
              )}

              {/* Pulsing Loading / Skeleton indicator while AI responds */}
              {isGenerating && (
                <div
                  id="generating-indicator"
                  className="flex w-full items-start gap-3 sm:gap-4 transition-all duration-200"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm ring-2',
                      isDark
                        ? 'border-emerald-500/40 bg-zinc-900 text-emerald-400 ring-emerald-500/20'
                        : 'border-emerald-500/40 bg-emerald-50 text-emerald-600 ring-emerald-500/15'
                    )}
                  >
                    <Terminal className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  </div>
                  <div className="flex flex-col space-y-2 max-w-[90%] sm:max-w-[75%] min-w-0">
                    <div
                      className={cn(
                        'flex items-center gap-2 px-1 text-[11px] font-medium',
                        isDark ? 'text-zinc-400' : 'text-slate-500'
                      )}
                    >
                      <span>Architect AI</span>
                      <span className={isDark ? 'text-zinc-600' : 'text-slate-300'}>•</span>
                      <span className="text-indigo-500 animate-pulse">Synthesizing...</span>
                    </div>
                    <div
                      className={cn(
                        'rounded-2xl rounded-tl-sm border p-3.5 sm:p-4 shadow-lg backdrop-blur-md space-y-2 min-w-0',
                        isDark
                          ? 'border-zinc-800/80 bg-zinc-900/90 text-zinc-200'
                          : 'border-slate-200/90 bg-white text-slate-800 shadow-sm'
                      )}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                        </div>
                        <span
                          className={cn(
                            'text-xs font-mono truncate',
                            isDark ? 'text-zinc-400' : 'text-slate-500'
                          )}
                        >
                          Formulating architectural code & design...
                        </span>
                      </div>
                      <div
                        className={cn(
                          'h-2 w-36 sm:w-48 rounded animate-pulse mt-2',
                          isDark ? 'bg-zinc-800' : 'bg-slate-200'
                        )}
                      />
                      <div
                        className={cn(
                          'h-2 w-24 sm:w-32 rounded animate-pulse',
                          isDark ? 'bg-zinc-800/70' : 'bg-slate-100'
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Floating Bottom Input Dock */}
          <div
            className={cn(
              'sticky bottom-0 z-20 border-t px-2.5 pb-3 pt-2 sm:px-6 md:px-8 transition-colors',
              isDark
                ? 'border-zinc-800/80 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent'
                : 'border-slate-200/80 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent'
            )}
          >
            <div className="mx-auto max-w-4xl w-full min-w-0">
              <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={() => handleSendMessage()}
                isGenerating={isGenerating}
                onSuggestionSelect={(suggestion) => handleSendMessage(suggestion)}
                theme={theme}
              />
            </div>
          </div>
        </main>
      </div>

      {/* In-App Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div
          id="reset-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
        >
          <div
            className={cn(
              'w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all',
              isDark
                ? 'border-zinc-800 bg-zinc-900 text-zinc-100'
                : 'border-slate-200 bg-white text-slate-900'
            )}
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h2 id="reset-modal-title" className="text-base font-semibold">
                  Reset Conversation?
                </h2>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  )}
                >
                  Are you sure you want to clear your conversation history? All messages and architectural code snippets will be removed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                id="btn-cancel-reset"
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm font-medium transition cursor-pointer',
                  isDark
                    ? 'border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                )}
              >
                Cancel
              </button>
              <button
                id="btn-confirm-reset"
                type="button"
                onClick={confirmResetConversation}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 active:scale-98 transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Yes, Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert on successful reset */}
      {showResetToast && (
        <div
          id="reset-toast"
          className="fixed bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/95 px-4 py-2.5 text-sm font-medium text-emerald-300 shadow-xl backdrop-blur-md"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Conversation history cleared successfully</span>
        </div>
      )}
    </div>
  );
};
