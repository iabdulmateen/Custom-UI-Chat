'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, RefreshCw, Terminal, Clock, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  isLatestAi?: boolean;
  onRegenerate?: () => void;
  isGenerating?: boolean;
  theme?: 'dark' | 'light';
  isSpeaking?: boolean;
  onToggleSpeech?: (messageId: string, content: string) => void;
  isSpeechSupported?: boolean;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLatestAi = false,
  onRegenerate,
  isGenerating = false,
  theme = 'dark',
  isSpeaking = false,
  onToggleSpeech,
  isSpeechSupported = true,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const isUser = message.role === 'user';
  const isDark = theme === 'dark';

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      // Clipboard fallback if needed
    }
  };

  const handleCopyCode = async (codeText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch {
      // Clipboard fallback if needed
    }
  };

  let codeBlockCounter = 0;

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        'group relative flex w-full gap-2 sm:gap-3 md:gap-4 transition-all duration-200 min-w-0',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Role Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 select-none items-center justify-center rounded-xl border shadow-sm transition-transform group-hover:scale-105',
          isUser
            ? isDark
              ? 'border-indigo-500/30 bg-indigo-600/20 text-indigo-400 ring-2 ring-indigo-500/20'
              : 'border-indigo-500/30 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/15'
            : isDark
              ? 'border-emerald-500/30 bg-zinc-900 text-emerald-400 ring-2 ring-emerald-500/20'
              : 'border-emerald-500/30 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/15'
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      </div>

      {/* Message Container */}
      <div
        className={cn(
          'flex min-w-0 flex-1 max-w-[calc(100%-40px)] sm:max-w-[85%] md:max-w-[78%] flex-col space-y-1.5 sm:space-y-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Meta Header */}
        <div
          className={cn(
            'flex items-center gap-2 px-1 text-[11px] font-medium tracking-wide',
            isDark ? 'text-zinc-400' : 'text-slate-500'
          )}
        >
          <span>{isUser ? 'You' : 'Architect AI'}</span>
          <span className={isDark ? 'text-zinc-600' : 'text-slate-300'}>•</span>
          <span className="flex items-center gap-1">
            <Clock className={cn('h-3 w-3', isDark ? 'text-zinc-500' : 'text-slate-400')} />
            {message.timestamp}
          </span>
        </div>

        {/* Bubble Surface */}
        <div
          className={cn(
            'relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl p-3.5 sm:p-5 text-xs sm:text-sm transition-all',
            isUser
              ? 'rounded-tr-sm bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/20'
              : isDark
                ? 'rounded-tl-sm border border-zinc-800/80 bg-zinc-900/90 text-zinc-200 shadow-lg backdrop-blur-md'
                : 'rounded-tl-sm border border-slate-200/90 bg-white text-slate-800 shadow-sm backdrop-blur-md'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">{message.content}</p>
          ) : (
            <div
              className={cn(
                'prose max-w-none space-y-3 leading-relaxed break-words [overflow-wrap:anywhere] min-w-0',
                isDark ? 'prose-invert text-zinc-200' : 'text-slate-800'
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1({ children }) {
                    return (
                      <h1 className="text-base sm:text-lg font-bold tracking-tight mb-2 mt-3 first:mt-0 break-words [overflow-wrap:anywhere]">
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2 className="text-sm sm:text-base font-bold tracking-tight mb-1.5 mt-2.5 first:mt-0 break-words [overflow-wrap:anywhere]">
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3 className="text-xs sm:text-sm font-bold tracking-tight mb-1.5 mt-2 first:mt-0 break-words [overflow-wrap:anywhere]">
                        {children}
                      </h3>
                    );
                  },
                  code({ inline, className, children, ...props }: CodeBlockProps) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const currentIdx = codeBlockCounter++;

                    if (!inline && (match || codeString.includes('\n') || codeString.length > 30)) {
                      const language = match ? match[1] : 'code';
                      const isCopied = copiedCodeIndex === currentIdx;

                      return (
                        <div className="not-prose my-2.5 sm:my-3 w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-inner">
                          {/* Code Header Bar */}
                          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-400">
                            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-zinc-300 truncate mr-2 min-w-0">
                              <Terminal className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                              <span className="truncate">{language}</span>
                            </span>
                            <button
                              id={`btn-copy-code-${message.id}-${currentIdx}`}
                              onClick={() => handleCopyCode(codeString, currentIdx)}
                              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                              title="Copy code"
                              type="button"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-sans">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span className="font-sans">Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          {/* Code Body - Auto wraps code smoothly on mobile with no roller scrollbars */}
                          <pre className="w-full max-w-full overflow-hidden p-3 sm:p-4 font-mono text-xs sm:text-[13px] leading-relaxed text-emerald-200/90 selection:bg-emerald-500/30 whitespace-pre-wrap break-words [overflow-wrap:anywhere] no-scrollbar">
                            <code className={cn(className, 'whitespace-pre-wrap break-words [overflow-wrap:anywhere]')} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <code
                        className={cn(
                          'rounded-md px-1.5 py-0.5 font-mono text-[11px] sm:text-[12px] font-semibold whitespace-pre-wrap break-words [overflow-wrap:anywhere]',
                          isDark
                            ? 'border border-zinc-700/60 bg-zinc-800/80 text-emerald-300'
                            : 'border border-slate-200 bg-slate-100 text-emerald-700'
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div
                        className={cn(
                          'my-2.5 sm:my-3 w-full min-w-0 max-w-full overflow-x-auto no-scrollbar rounded-lg border',
                          isDark ? 'border-zinc-800' : 'border-slate-200'
                        )}
                      >
                        <table className="w-full text-left text-xs border-collapse">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return (
                      <thead
                        className={cn(
                          'border-b',
                          isDark
                            ? 'bg-zinc-800/70 text-zinc-200 border-zinc-700'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        )}
                      >
                        {children}
                      </thead>
                    );
                  },
                  th({ children }) {
                    return (
                      <th
                        className={cn(
                          'px-2.5 sm:px-3 py-1.5 sm:py-2 font-semibold',
                          isDark ? 'text-zinc-300' : 'text-slate-900'
                        )}
                      >
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td
                        className={cn(
                          'px-2.5 sm:px-3 py-1.5 sm:py-2 border-t',
                          isDark ? 'border-zinc-800/60 text-zinc-300' : 'border-slate-200 text-slate-700'
                        )}
                      >
                        {children}
                      </td>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul
                        className={cn(
                          'my-2 list-disc list-outside pl-4 sm:pl-5 space-y-1 break-words [overflow-wrap:anywhere]',
                          isDark ? 'text-zinc-300' : 'text-slate-700'
                        )}
                      >
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol
                        className={cn(
                          'my-2 list-decimal list-outside pl-4 sm:pl-5 space-y-1 break-words [overflow-wrap:anywhere]',
                          isDark ? 'text-zinc-300' : 'text-slate-700'
                        )}
                      >
                        {children}
                      </ol>
                    );
                  },
                  li({ children }) {
                    return <li className="pl-0.5 break-words [overflow-wrap:anywhere]">{children}</li>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote
                        className={cn(
                          'my-2 border-l-2 border-indigo-500 px-3 sm:px-4 py-1.5 sm:py-2 italic rounded-r text-xs sm:text-sm break-words [overflow-wrap:anywhere]',
                          isDark ? 'bg-indigo-500/5 text-zinc-300' : 'bg-indigo-50 text-slate-700'
                        )}
                      >
                        {children}
                      </blockquote>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0 leading-relaxed break-words [overflow-wrap:anywhere]">{children}</p>;
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 underline decoration-indigo-500/40 underline-offset-2 transition hover:text-indigo-400 break-all"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Controls & Footer */}
        {!isUser && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-1 px-1 pt-0.5 text-xs',
              isDark ? 'text-zinc-500' : 'text-slate-500'
            )}
          >
            {isSpeechSupported && onToggleSpeech && (
              <button
                id={`btn-read-aloud-${message.id}`}
                onClick={() => onToggleSpeech(message.id, message.content)}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 transition',
                  isSpeaking
                    ? isDark
                      ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30'
                      : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20'
                    : isDark
                      ? 'hover:bg-zinc-800 hover:text-zinc-300'
                      : 'hover:bg-slate-100 hover:text-slate-700'
                )}
                title={isSpeaking ? 'Stop reading aloud' : 'Read aloud with Web Speech API'}
                aria-label={isSpeaking ? 'Stop reading response aloud' : 'Read response aloud'}
                type="button"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3 w-3 text-indigo-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-indigo-500">Stop reading</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3" />
                    <span className="text-[11px]">Read aloud</span>
                  </>
                )}
              </button>
            )}

            <button
              id={`btn-copy-msg-${message.id}`}
              onClick={handleCopyMessage}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 transition',
                isDark ? 'hover:bg-zinc-800 hover:text-zinc-300' : 'hover:bg-slate-100 hover:text-slate-700'
              )}
              title="Copy entire response"
              type="button"
            >
              {copiedMessage ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-[11px] text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="text-[11px]">Copy response</span>
                </>
              )}
            </button>

            {isLatestAi && onRegenerate && (
              <button
                id={`btn-regenerate-${message.id}`}
                onClick={onRegenerate}
                disabled={isGenerating}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition',
                  isGenerating
                    ? 'cursor-not-allowed opacity-50'
                    : isDark
                      ? 'text-indigo-400 hover:bg-indigo-950/40 hover:text-indigo-300'
                      : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                )}
                title="Regenerate response"
                type="button"
              >
                <RefreshCw className={cn('h-3 w-3', isGenerating && 'animate-spin')} />
                <span className="text-[11px]">Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
