'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getDictionary, Language } from '@/lib/i18n';
import { CommandPalette } from './CommandPalette';
import { Sun, Moon, Globe, Command, RotateCcw, Sparkles, Flame } from 'lucide-react';

export function Navbar() {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    reduceMotion,
    setReduceMotion,
    currentPlan,
    loadSamplePlan,
    resetPlan,
  } = useAppStore();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const dict = getDictionary(language);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-ivory-50/90 backdrop-blur-md transition-colors dark:border-maroon-900/60 dark:bg-[#120508]/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-maroon-700 to-saffron-600 text-gold-300 shadow-md">
            <Flame className="h-5 w-5 animate-pulse text-amber-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-maroon-800 via-saffron-600 to-gold-500 bg-clip-text font-serif text-2xl font-extrabold tracking-wider text-transparent dark:from-maroon-300 dark:via-gold-300 dark:to-saffron-400">
                JALSA
              </span>
              <span className="dark:bg-saffron-950/80 hidden rounded-full border border-saffron-300/40 bg-saffron-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-saffron-800 dark:text-saffron-300 sm:inline-block">
                AI Co-Pilot
              </span>
            </div>
            <p className="-mt-1 hidden text-[11px] text-stone-500 dark:text-stone-400 md:block">
              {dict.brand.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Sample Plan Instant Preview */}
          {!currentPlan ? (
            <button
              onClick={() => loadSamplePlan()}
              className="hidden items-center space-x-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-saffron-500 px-3 py-1.5 text-xs font-semibold text-stone-900 shadow-sm transition-all hover:from-gold-600 hover:to-saffron-600 sm:flex"
              aria-label="Load sample event plan"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sample Plan</span>
            </button>
          ) : (
            <button
              onClick={resetPlan}
              className="flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-maroon-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-gold-300"
              title="Start a new plan"
              aria-label="Start new plan"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">New Plan</span>
            </button>
          )}

          {/* Command Palette Button */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center space-x-1 rounded-lg border border-stone-200 bg-white/70 px-2.5 py-1.5 text-xs text-stone-500 transition-colors hover:border-gold-400 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400"
            title="Open Command Palette (Ctrl+K)"
            aria-label="Open command palette"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Ctrl+K</span>
          </button>

          {/* Language Switcher */}
          <div className="relative inline-flex items-center">
            <Globe className="pointer-events-none absolute left-2 h-4 w-4 text-stone-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="cursor-pointer rounded-lg border border-stone-200 bg-white py-1.5 pl-7 pr-3 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-gold-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
              aria-label="Choose language"
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          {/* Reduce Motion Toggle */}
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`rounded-lg p-2 text-xs font-medium transition-colors ${
              reduceMotion
                ? 'dark:bg-saffron-950 bg-saffron-100 text-saffron-800 dark:text-saffron-300'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
            title={reduceMotion ? 'Animations reduced' : 'Reduce animations'}
            aria-label="Toggle reduced motion"
          >
            <span className="text-[11px] font-bold">RM</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-stone-200 bg-white p-2 text-stone-600 transition-colors hover:border-gold-400 dark:border-stone-800 dark:bg-stone-900 dark:text-gold-300"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}
