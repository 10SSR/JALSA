'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore, ActiveTab } from '@/lib/store';
import { getDictionary } from '@/lib/i18n';
import {
  Search,
  LayoutDashboard,
  Wallet,
  Calendar,
  AlertTriangle,
  Users,
  Sparkles,
  HeartPulse,
  ShieldAlert,
  Share2,
  Sliders,
  Moon,
  Sun,
  EyeOff,
  FileText,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const {
    language,
    theme,
    toggleTheme,
    reduceMotion,
    setReduceMotion,
    setActiveTab,
    loadSamplePlan,
    currentPlan,
  } = useAppStore();
  const dict = getDictionary(language);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // open
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'overview',
      label: dict.navigation.overview,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    { id: 'budget', label: dict.navigation.budget, icon: <Wallet className="h-4 w-4" /> },
    { id: 'whatIf', label: dict.navigation.whatIf, icon: <Sliders className="h-4 w-4" /> },
    { id: 'timeline', label: dict.navigation.timeline, icon: <Calendar className="h-4 w-4" /> },
    { id: 'risks', label: dict.navigation.risks, icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'vendors', label: dict.navigation.vendors, icon: <Users className="h-4 w-4" /> },
    { id: 'ideas', label: dict.navigation.ideas, icon: <Sparkles className="h-4 w-4" /> },
    { id: 'health', label: dict.navigation.health, icon: <HeartPulse className="h-4 w-4" /> },
    { id: 'planB', label: dict.navigation.planB, icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'export', label: dict.navigation.export, icon: <Share2 className="h-4 w-4" /> },
  ];

  const filteredNav = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-stone-900/60 pt-20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <Search className="mr-2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none dark:text-stone-100"
            placeholder="Type a command or jump to section (e.g., budget, risks, theme)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto p-2">
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Navigation
          </div>
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <span className="mr-3 text-maroon-700 dark:text-gold-400">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Quick Actions
          </div>
          <button
            onClick={() => {
              toggleTheme();
              onClose();
            }}
            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {theme === 'light' ? (
              <Moon className="mr-3 h-4 w-4 text-stone-600 dark:text-stone-400" />
            ) : (
              <Sun className="mr-3 h-4 w-4 text-gold-400" />
            )}
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>

          <button
            onClick={() => {
              setReduceMotion(!reduceMotion);
              onClose();
            }}
            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <EyeOff className="mr-3 h-4 w-4 text-stone-600 dark:text-stone-400" />
            {reduceMotion ? 'Enable Animations' : 'Reduce Motion'}
          </button>

          {!currentPlan && (
            <button
              onClick={() => {
                loadSamplePlan();
                onClose();
              }}
              className="flex w-full items-center rounded-lg bg-gold-50 px-3 py-2 text-left text-sm font-medium text-maroon-800 hover:bg-gold-100 dark:bg-maroon-950/40 dark:text-gold-300"
            >
              <FileText className="mr-3 h-4 w-4 text-gold-600" />
              Load Sample Royal Wedding Plan (Instant Demo)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
