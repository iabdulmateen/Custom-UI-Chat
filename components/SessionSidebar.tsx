'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Clock,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatSession, ThemeMode } from '@/lib/types';

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // If only 1 session, confirm reset/clear
      setSessionToDelete(id);
    } else {
      setSessionToDelete(id);
    }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSession(id);
    setSessionToDelete(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(null);
  };

  // Sort sessions latest updated first
  const sortedSessions = [...sessions].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="session-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-all duration-300 ease-in-out',
          // Mobile state
          isOpenMobile ? 'translate-x-0' : '-translate-x-full',
          // Desktop positioning
          'lg:static lg:z-10 lg:translate-x-0',
          // Desktop width: collapsed vs expanded
          isCollapsedDesktop ? 'lg:w-16' : 'lg:w-72 xl:w-80',
          'w-72 max-w-[85vw] sm:max-w-xs',
          // Theming
          isDark
            ? 'border-zinc-800/80 bg-zinc-950 text-zinc-300 shadow-xl lg:shadow-none'
            : 'border-slate-200/90 bg-white text-slate-700 shadow-xl lg:shadow-none'
        )}
      >
        {/* Top Header / Actions */}
        <div
          className={cn(
            'flex items-center justify-between border-b px-3 py-3 sm:py-3.5 transition-colors',
            isDark ? 'border-zinc-800/80' : 'border-slate-200'
          )}
        >
          {/* Collapsed view toggle button on desktop */}
          {isCollapsedDesktop ? (
            <div className="flex w-full flex-col items-center gap-2">
              <button
                id="btn-expand-sidebar-desktop"
                type="button"
                onClick={onToggleCollapseDesktop}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl border transition',
                  isDark
                    ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                )}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>

              <button
                id="btn-new-chat-collapsed"
                type="button"
                onClick={onNewSession}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition"
                title="New Chat Session"
                aria-label="New Chat Session"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-500 font-semibold border border-indigo-500/20">
                  <Archive className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider truncate',
                      isDark ? 'text-zinc-200' : 'text-slate-900'
                    )}
                  >
                    Conversations
                  </h2>
                  <p className={cn('text-[10px] truncate', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                    {sessions.length} saved {sessions.length === 1 ? 'thread' : 'threads'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Desktop Collapse Toggle */}
                <button
                  id="btn-collapse-sidebar-desktop"
                  type="button"
                  onClick={onToggleCollapseDesktop}
                  className={cn(
                    'hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border transition',
                    isDark
                      ? 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800'
                  )}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>

                {/* Mobile Close Button */}
                <button
                  id="btn-close-sidebar-mobile"
                  type="button"
                  onClick={onCloseMobile}
                  className={cn(
                    'flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border transition',
                    isDark
                      ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                  )}
                  title="Close sidebar"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* New Chat Button (Expanded View) */}
        {!isCollapsedDesktop && (
          <div className="p-3">
            <button
              id="btn-new-chat-expanded"
              type="button"
              onClick={() => {
                onNewSession();
                onCloseMobile();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-950/20 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] transition duration-150 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>New Conversation</span>
            </button>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {isCollapsedDesktop ? (
            // Collapsed Rail: Icons of sessions with tooltips
            <div className="flex flex-col items-center space-y-2 py-1">
              {sortedSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <button
                    key={session.id}
                    id={`btn-rail-session-${session.id}`}
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      'group relative flex h-10 w-10 items-center justify-center rounded-xl border transition',
                      isActive
                        ? isDark
                          ? 'border-indigo-500/40 bg-indigo-600/25 text-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-indigo-500/40 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                        : isDark
                          ? 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800'
                    )}
                    title={`${session.title} (${session.messages.length} msgs)`}
                    aria-label={session.title}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : sortedSessions.length === 0 ? (
            // Expanded List: Full cards with Title, timestamp, message count, rename & delete controls
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <MessageSquare className={cn('h-8 w-8 mb-2 opacity-40', isDark ? 'text-zinc-500' : 'text-slate-400')} />
                <p className={cn('text-xs font-medium', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                  No conversation threads
                </p>
                <p className={cn('text-[11px] mt-1', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                  Click &ldquo;New Conversation&rdquo; above to start fresh.
                </p>
              </div>
            ) : (
              sortedSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isEditing = editingId === session.id;
                const isDeleting = sessionToDelete === session.id;

                return (
                  <div
                    key={session.id}
                    id={`session-item-${session.id}`}
                    onClick={() => {
                      if (!isEditing) {
                        onSelectSession(session.id);
                        onCloseMobile();
                      }
                    }}
                    className={cn(
                      'group relative flex w-full flex-col rounded-xl border p-2.5 text-left transition-all duration-150 cursor-pointer select-none',
                      isActive
                        ? isDark
                          ? 'border-indigo-500/40 bg-indigo-950/30 text-zinc-100 shadow-sm ring-1 ring-indigo-500/30'
                          : 'border-indigo-500/40 bg-indigo-50/80 text-slate-900 shadow-xs ring-1 ring-indigo-500/20'
                        : isDark
                          ? 'border-zinc-800/60 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700/80 hover:bg-zinc-900/70 hover:text-zinc-100'
                          : 'border-slate-200/80 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900'
                    )}
                  >
                    {/* Delete Confirmation Overlay */}
                    {isDeleting ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between gap-1 py-0.5"
                      >
                        <span className="text-[11px] font-medium text-rose-500 truncate">
                          Delete this thread?
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            id={`btn-confirm-del-${session.id}`}
                            type="button"
                            onClick={(e) => confirmDelete(e, session.id)}
                            className="flex h-6 w-6 items-center justify-center rounded bg-rose-600 text-white hover:bg-rose-500"
                            title="Confirm delete"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            id={`btn-cancel-del-${session.id}`}
                            type="button"
                            onClick={cancelDelete}
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded border',
                              isDark
                                ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                            )}
                            title="Cancel"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : isEditing ? (
                      /* Inline Rename Form */
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 py-0.5"
                      >
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, session.id)}
                          className={cn(
                            'w-full min-w-0 rounded-lg border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500',
                            isDark
                              ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                              : 'border-slate-300 bg-white text-slate-900'
                          )}
                          maxLength={60}
                        />
                        <button
                          id={`btn-save-rename-${session.id}`}
                          type="button"
                          onClick={() => handleSaveRename(session.id)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-600 text-white hover:bg-indigo-500"
                          title="Save title"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          id={`btn-cancel-rename-${session.id}`}
                          type="button"
                          onClick={handleCancelRename}
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded border',
                            isDark
                              ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                          )}
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      /* Normal Display Card */
                      <>
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <MessageSquare
                              className={cn(
                                'h-3.5 w-3.5 shrink-0',
                                isActive
                                  ? 'text-indigo-500'
                                  : isDark
                                    ? 'text-zinc-500 group-hover:text-zinc-400'
                                    : 'text-slate-400 group-hover:text-slate-600'
                              )}
                            />
                            <span
                              className={cn(
                                'truncate text-xs font-medium',
                                isActive
                                  ? isDark
                                    ? 'text-indigo-200 font-semibold'
                                    : 'text-indigo-900 font-semibold'
                                  : isDark
                                    ? 'text-zinc-200'
                                    : 'text-slate-800'
                              )}
                              title={session.title}
                            >
                              {session.title || 'Untitled Chat'}
                            </span>
                          </div>

                          {/* Quick Rename & Delete Action Buttons (visible on hover or when active) */}
                          <div
                            className={cn(
                              'flex items-center gap-0.5 shrink-0 transition-opacity',
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            )}
                          >
                            <button
                              id={`btn-rename-session-${session.id}`}
                              type="button"
                              onClick={(e) => handleStartRename(e, session)}
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded transition',
                                isDark
                                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                                  : 'text-slate-400 hover:bg-slate-200 hover:text-slate-800'
                              )}
                              title="Rename session"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              id={`btn-delete-session-${session.id}`}
                              type="button"
                              onClick={(e) => handleDeleteClick(e, session.id)}
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded transition',
                                isDark
                                  ? 'text-zinc-400 hover:bg-rose-950/50 hover:text-rose-400'
                                  : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                              )}
                              title="Delete session"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata row: Message count and relative time */}
                        <div
                          className={cn(
                            'mt-1.5 flex items-center justify-between text-[10px]',
                            isDark ? 'text-zinc-400' : 'text-slate-500'
                          )}
                        >
                          <span className="flex items-center gap-1 truncate">
                            <Clock className="h-2.5 w-2.5 opacity-70 shrink-0" />
                            <span>{formatRelativeTime(session.updatedAt || session.createdAt)}</span>
                          </span>
                          <span
                            className={cn(
                              'rounded-md px-1.5 py-0.5 font-mono text-[9px] font-medium shrink-0',
                              isActive
                                ? isDark
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'bg-indigo-100 text-indigo-700'
                                : isDark
                                  ? 'bg-zinc-800/80 text-zinc-400'
                                  : 'bg-slate-200/80 text-slate-600'
                            )}
                          >
                            {session.messages.length} {session.messages.length === 1 ? 'msg' : 'msgs'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
        </div>

        {/* Bottom Status / Utility Dock */}
        <div
          className={cn(
            'border-t p-2.5 transition-colors',
            isDark ? 'border-zinc-800/80 bg-zinc-950/90' : 'border-slate-200 bg-slate-50/90'
          )}
        >
          {isCollapsedDesktop ? (
            <div className="flex flex-col items-center gap-2">
              <button
                id="btn-theme-collapsed"
                type="button"
                onClick={onToggleTheme}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl border transition',
                  isDark
                    ? 'border-zinc-800 bg-zinc-900 text-amber-400 hover:bg-zinc-800'
                    : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-100'
                )}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
                aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Storage Sync status pill */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px]',
                  isDark ? 'bg-zinc-900/60 text-zinc-400' : 'bg-white text-slate-600 border border-slate-200/70'
                )}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Sparkles className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span className="truncate">Local Storage Sync</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-500 font-medium shrink-0">Active</span>
              </div>

              {/* Theme toggle in sidebar */}
              <button
                id="btn-sidebar-theme-toggle"
                type="button"
                onClick={onToggleTheme}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border p-2 text-xs font-medium transition cursor-pointer',
                  isDark
                    ? 'border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 shadow-xs'
                )}
              >
                <span className="flex items-center gap-2">
                  {isDark ? (
                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
                </span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-mono uppercase',
                    isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
