'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowUp, CornerDownLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isGenerating: boolean;
  onSuggestionSelect?: (suggestion: string) => void;
  theme?: 'dark' | 'light';
}

const QUICK_PROMPTS = [
  'Show me a microservices event bus pattern with code and a comparison table',
  'How to handle Next.js SSR hydration mismatches with localStorage?',
  'Explain distributed rate limiting with Redis token bucket algorithm',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  isGenerating,
  onSuggestionSelect,
  theme = 'dark',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === 'dark';

  // Auto-resize textarea according to content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap max height to 180px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isGenerating) {
        onSubmit();
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSubmit(e);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Suggestion Chips (when input is empty) */}
      {!input && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 no-scrollbar sm:flex-wrap">
          <span
            className={cn(
              'flex shrink-0 items-center gap-1 text-[11px] font-medium uppercase tracking-wider',
              isDark ? 'text-zinc-300' : 'text-slate-600'
            )}
          >
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span className="hidden sm:inline">Quick Prompts:</span>
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              id={`quick-prompt-${idx}`}
              type="button"
              disabled={isGenerating}
              onClick={() => onSuggestionSelect?.(prompt)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs transition-all disabled:opacity-50',
                isDark
                  ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-xs'
              )}
            >
              {prompt.length > 40 ? `${prompt.slice(0, 40)}...` : prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Card */}
      <form
        id="chat-input-form"
        onSubmit={handleFormSubmit}
        className={cn(
          'relative flex flex-col rounded-2xl border p-2 sm:p-3 shadow-xl backdrop-blur-xl transition-all',
          isDark
            ? 'border-zinc-800/90 bg-zinc-900/90 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20'
            : 'border-slate-300/80 bg-white shadow-slate-200/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
        )}
      >
        <textarea
          id="chat-textarea"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isGenerating
              ? 'Architect is processing the response...'
              : 'Ask an architectural question, request code, or explore designs...'
          }
          disabled={isGenerating}
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent px-2 py-1 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
            isDark
              ? 'text-zinc-100 placeholder-zinc-500'
              : 'text-slate-900 placeholder-slate-400'
          )}
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 px-1">
          <div
            className={cn(
              'flex items-center gap-2 text-[11px]',
              isDark ? 'text-zinc-500' : 'text-slate-500'
            )}
          >
            <span className="hidden sm:inline-flex items-center gap-1 font-mono">
              <CornerDownLeft className="h-3 w-3" /> Enter to send
            </span>
            <span className={cn('hidden sm:inline', isDark ? 'text-zinc-700' : 'text-slate-300')}>•</span>
            <span className="hidden sm:inline">Shift + Enter for newline</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span
              className={cn(
                'text-[11px] font-mono',
                isDark ? 'text-zinc-500' : 'text-slate-500'
              )}
            >
              {input.length} chars
            </span>
            <button
              id="btn-send-message"
              type="submit"
              disabled={!input.trim() || isGenerating}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 shadow-md',
                input.trim() && !isGenerating
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-indigo-600/30'
                  : isDark
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
              title="Send Message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
